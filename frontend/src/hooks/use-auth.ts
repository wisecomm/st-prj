"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const login = async (username: string, password: string) => {
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/home");
      router.refresh();
    }

    return result;
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    accessToken: session?.accessToken,
    login,
    logout,
  };
}
