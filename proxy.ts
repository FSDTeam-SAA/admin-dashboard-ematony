import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const authPages = ["/login", "/forgot-password", "/verify-otp", "/reset-password"];

const protectedPrefixes = ["/dashboard", "/users", "/groups", "/payments", "/issues", "/settings"];

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = Boolean(session);
  const isAdmin = session?.user?.role === "admin";

  const isAuthPage = authPages.some((path) => nextUrl.pathname.startsWith(path));
  const isProtectedPage =
    nextUrl.pathname === "/" ||
    protectedPrefixes.some((path) => nextUrl.pathname.startsWith(path));

  if (isAuthPage && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isProtectedPage && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
