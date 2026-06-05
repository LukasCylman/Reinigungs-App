import { NextRequest, NextResponse } from "next/server";

const USER = process.env.AUTH_USER || "admin";
const PASS = process.env.AUTH_PASS || "reinigung123";
const SECRET = process.env.AUTH_SECRET || "reinigung-geheim-2024";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === USER && password === PASS) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_token", SECRET, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: "Ungültige Zugangsdaten" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("auth_token");
  return res;
}
