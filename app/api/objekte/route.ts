import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = getDb();
  const kundenId = req.nextUrl.searchParams.get("kunden_id");
  const objekte = kundenId
    ? db.prepare(`SELECT o.*, k.name as kundenname FROM objekte o JOIN kunden k ON o.kunden_id = k.id WHERE o.kunden_id = ?`).all(kundenId)
    : db.prepare(`SELECT o.*, k.name as kundenname FROM objekte o JOIN kunden k ON o.kunden_id = k.id ORDER BY k.name`).all();
  return NextResponse.json(objekte);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const result = db.prepare(`
    INSERT INTO objekte (kunden_id, name, adresse, flaeche_qm, etagen, schluessel_vorhanden, notizen)
    VALUES (@kunden_id, @name, @adresse, @flaeche_qm, @etagen, @schluessel_vorhanden, @notizen)
  `).run({ ...data, schluessel_vorhanden: data.schluessel_vorhanden ? 1 : 0 });
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM objekte WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
