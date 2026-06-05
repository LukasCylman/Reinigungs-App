import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const auftraege = db.prepare(`
    SELECT a.*, k.name as kundenname, o.name as objektname
    FROM auftraege a
    JOIN kunden k ON a.kunden_id = k.id
    LEFT JOIN objekte o ON a.objekt_id = o.id
    ORDER BY a.datum DESC, a.uhrzeit_von
  `).all();
  return NextResponse.json(auftraege);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const result = db.prepare(`
    INSERT INTO auftraege (kunden_id, objekt_id, datum, uhrzeit_von, uhrzeit_bis, mitarbeiter, status, besonderheiten, abgerechnet, preis)
    VALUES (@kunden_id, @objekt_id, @datum, @uhrzeit_von, @uhrzeit_bis, @mitarbeiter, @status, @besonderheiten, @abgerechnet, @preis)
  `).run({ ...data, abgerechnet: 0 });
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  db.prepare(`
    UPDATE auftraege SET kunden_id=@kunden_id, objekt_id=@objekt_id, datum=@datum,
    uhrzeit_von=@uhrzeit_von, uhrzeit_bis=@uhrzeit_bis, mitarbeiter=@mitarbeiter,
    status=@status, besonderheiten=@besonderheiten, abgerechnet=@abgerechnet, preis=@preis
    WHERE id=@id
  `).run({ ...data, abgerechnet: data.abgerechnet ? 1 : 0 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM auftraege WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
