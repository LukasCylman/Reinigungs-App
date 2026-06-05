import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const secret = process.env.AUTH_SECRET || "reinigung-geheim-2024";

  if (req.nextUrl.pathname.startsWith("/api/auth")) return NextResponse.next();
  if (req.nextUrl.pathname === "/login") return NextResponse.next();

  if (token !== secret) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
