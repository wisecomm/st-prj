import NextAuth from "next-auth";
import { decode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { serverEnv } from "./lib/env";

declare module "next-auth" {
  interface Session {
    error?: string;
    accessToken?: string;
    user: {
      id: string;
      username: string;
      email?: string;
      role?: string;
    };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    role?: string;
  }
}

// 갱신 여유 시간 (5분)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await fetch(`${serverEnv.BACKEND_API_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      console.error("[auth] Token refresh failed:", res.status);
      return null;
    }

    const data = await res.json();
    // danyoh : 2026-02-19 내부에러 확인 후 처리
    if (data.code !== '200') {
      console.error("[auth] Token refresh code failed:", data.code);
      return null;
    }

    return {
      accessToken: data.data?.token as string,
      refreshToken: data.data?.refreshToken as string,
    };
  } catch (error) {
    console.error("[auth] Token refresh error:", error);
    return null;
  }
}

/** Decode JWT payload to read exp claim (without verification) */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString()
    );
    return payload.exp ? payload.exp * 1000 : null; // Convert to ms
  } catch {
    return null;
  }
}

const authConfig: NextAuthConfig = {
  secret: serverEnv.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${serverEnv.BACKEND_API_URL}/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: credentials?.username,
                userPwd: credentials?.password,
              }),
            }
          );

          if (!res.ok) return null;

          const data = await res.json();
          if (data.code !== '200') {
            console.error("[auth] Login API failed:", data.code);
            return null;
          }

          return {
            id: data.data?.user?.userId ?? "1",
            username: data.data?.user?.userName ?? (credentials?.username as string),
            email: data.data?.user?.userEmail,
            role: data.data?.user?.roles?.[0] ?? "",
            accessToken: data.data?.token,
            refreshToken: data.data?.refreshToken,
          };
        } catch (error) {
          console.error("[auth] Login failed:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial login — store tokens from Spring Boot
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.username = user.username;
        token.role = user.role;
        return token;
      }

      // On subsequent requests — check if access token needs refresh
      const accessToken = token.accessToken as string | undefined;
      if (accessToken) {
        const expiry = getTokenExpiry(accessToken);
        const shouldRefresh =
          expiry && Date.now() > expiry - TOKEN_REFRESH_BUFFER_MS;

        if (shouldRefresh && token.refreshToken) {
          const refreshed = await refreshAccessToken(
            token.refreshToken as string
          );

          if (refreshed) {
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
          } else {
            // Refresh failed — force re-login
            token.accessToken = undefined;
            token.refreshToken = undefined;
            token.error = "RefreshTokenExpired";
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Tokens are kept in the encrypted JWT cookie only.
      // We expose accessToken so the proxy and client can use it.
      if (session.user) {
        session.user.username = (token.username as string) ?? "";
        session.user.role = token.role as string | undefined;
      }
      session.accessToken = token.accessToken as string | undefined;
      // Propagate refresh error so client can force re-login
      if (token.error) {
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Server-side only: Read the backend JWT tokens from the encrypted NextAuth cookie.
 * Use this in API routes / server components that need to call Spring Boot.
 */
export async function getServerTokens() {
  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    console.error("[getServerTokens] No session token found in cookies");
    return null;
  }

  try {
    const salt = cookieStore.get("__Secure-authjs.session-token")?.value
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    // NextAuth v5 beta relies on AUTH_SECRET natively, we are passing NEXTAUTH_SECRET.
    // However, the internal decode algorithm might expect a specific setup.
    const decoded = await decode({
      token: sessionToken,
      secret: serverEnv.NEXTAUTH_SECRET!,
      salt: salt,
    });

    if (!decoded) {
      console.error("[getServerTokens] decoded is null or undefined");
      return null;
    }

    return {
      accessToken: decoded.accessToken as string | undefined,
      refreshToken: decoded.refreshToken as string | undefined,
    };
  } catch (error) {
    console.error("[getServerTokens] Token decode failed:", error);
    return null;
  }
}
