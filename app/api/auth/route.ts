import { NextRequest, NextResponse } from "next/server";

const VALID_USER = "LukasCylman";
const VALID_PASS = "Stambouli1";
const TOKEN = "eingeloggt-2024";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username === VALID_USER && password === VALID_PASS) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_token", TOKEN, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("auth_token");
  return res;
}
