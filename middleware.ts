import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("session");

  // /admin/* routes
  if (pathname.startsWith("/admin")) {
    // Allow access to login page
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    // All other admin routes require session
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // /listas/* routes require session
  if (pathname.startsWith("/listas")) {
    if (!session) {
      return NextResponse.redirect(new URL("/cuenta", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*|/listas/:path*",
};
