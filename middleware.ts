import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");

  if (basicAuth) {
    const auth = basicAuth.split(" ")[1];
    const [user, pwd] = atob(auth).split(":");
    const validUser = process.env.AUTH_USER || "admin";
    const validPass = process.env.AUTH_PASS || "reinigung123";

    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Login erforderlich", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Reinigung Manager - Bitte einloggen"',
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
