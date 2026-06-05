import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const kunden = db.prepare(`SELECT * FROM kunden ORDER BY name`).all();
  return NextResponse.json(kunden);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const stmt = db.prepare(`
    INSERT INTO kunden (name, ansprechpartner, adresse, telefon, email, vertragstyp, preis_pro_einsatz, aktiv, notizen)
    VALUES (@name, @ansprechpartner, @adresse, @telefon, @email, @vertragstyp, @preis_pro_einsatz, @aktiv, @notizen)
  `);
  const result = stmt.run({ ...data, aktiv: data.aktiv ? 1 : 0 });
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  db.prepare(`
    UPDATE kunden SET name=@name, ansprechpartner=@ansprechpartner, adresse=@adresse,
    telefon=@telefon, email=@email, vertragstyp=@vertragstyp, preis_pro_einsatz=@preis_pro_einsatz,
    aktiv=@aktiv, notizen=@notizen WHERE id=@id
  `).run({ ...data, aktiv: data.aktiv ? 1 : 0 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM kunden WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
