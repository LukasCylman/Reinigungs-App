import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const rechnungen = db.prepare(`
    SELECT r.*, k.name as kundenname FROM rechnungen r
    JOIN kunden k ON r.kunden_id = k.id
    ORDER BY r.rechnungsdatum DESC
  `).all();
  return NextResponse.json(rechnungen);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const count = (db.prepare(`SELECT COUNT(*) as n FROM rechnungen`).get() as { n: number }).n;
  const year = new Date().getFullYear();
  const rechnungsnummer = `RE-${year}-${String(count + 1).padStart(4, "0")}`;
  const result = db.prepare(`
    INSERT INTO rechnungen (rechnungsnummer, kunden_id, auftrag_id, betrag, mwst_prozent, status, rechnungsdatum, faellig_am, notizen)
    VALUES (@rechnungsnummer, @kunden_id, @auftrag_id, @betrag, @mwst_prozent, @status, @rechnungsdatum, @faellig_am, @notizen)
  `).run({ ...data, rechnungsnummer });
  return NextResponse.json({ id: result.lastInsertRowid, rechnungsnummer });
}

export async function PUT(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  db.prepare(`
    UPDATE rechnungen SET status=@status, betrag=@betrag, faellig_am=@faellig_am,
    bezahlt_am=@bezahlt_am, notizen=@notizen WHERE id=@id
  `).run(data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM rechnungen WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
