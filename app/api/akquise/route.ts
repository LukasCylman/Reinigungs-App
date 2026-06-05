import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.prepare(`SELECT * FROM akquise ORDER BY erstellt_am DESC`).all());
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const result = db.prepare(`
    INSERT INTO akquise (firmenname, ansprechpartner, telefon, email, adresse, status, naechster_kontakt, angebotsbetrag, notizen)
    VALUES (@firmenname, @ansprechpartner, @telefon, @email, @adresse, @status, @naechster_kontakt, @angebotsbetrag, @notizen)
  `).run(data);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  db.prepare(`
    UPDATE akquise SET firmenname=@firmenname, ansprechpartner=@ansprechpartner, telefon=@telefon,
    email=@email, adresse=@adresse, status=@status, naechster_kontakt=@naechster_kontakt,
    angebotsbetrag=@angebotsbetrag, notizen=@notizen WHERE id=@id
  `).run(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM akquise WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
