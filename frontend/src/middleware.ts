import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isAuthApi = req.nextUrl.pathname.startsWith("/api/auth");

  // Allow auth API routes
  if (isAuthApi) return;

  // Redirect logged-in users away from login page
  if (isOnLoginPage && isLoggedIn) {
    return Response.redirect(new URL("/home", req.nextUrl));
  }

  // Redirect unauthenticated users to login (except login page)
  if (!isLoggedIn && !isOnLoginPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
