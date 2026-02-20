import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/about", "/api/auth"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Redirect logged-in users away from login page
  if (pathname.startsWith("/login") && isLoggedIn) {
    return Response.redirect(new URL("/home", req.nextUrl));
  }

  // Redirect unauthenticated users to login (except public routes)
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
