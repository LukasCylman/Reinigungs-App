import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const result = db.prepare(`
    INSERT INTO checklisten_punkte (checkliste_id, aufgabe, reihenfolge) VALUES (@checkliste_id, @aufgabe, @reihenfolge)
  `).run(data);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  db.prepare(`UPDATE checklisten_punkte SET erledigt=@erledigt, aufgabe=@aufgabe WHERE id=@id`).run(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM checklisten_punkte WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
