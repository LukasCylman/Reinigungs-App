import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const checklisten = db.prepare(`
    SELECT c.*, k.name as kundenname, o.name as objektname
    FROM checklisten c
    LEFT JOIN kunden k ON c.kunden_id = k.id
    LEFT JOIN objekte o ON c.objekt_id = o.id
  `).all();

  const result = (checklisten as Record<string, unknown>[]).map((cl) => ({
    ...cl,
    punkte: db.prepare(`SELECT * FROM checklisten_punkte WHERE checkliste_id = ? ORDER BY reihenfolge`).all(cl.id as number),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const data = await req.json();
  const result = db.prepare(`
    INSERT INTO checklisten (name, objekt_id, kunden_id) VALUES (@name, @objekt_id, @kunden_id)
  `).run(data);
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function DELETE(req: NextRequest) {
  const db = getDb();
  const { id } = await req.json();
  db.prepare(`DELETE FROM checklisten_punkte WHERE checkliste_id = ?`).run(id);
  db.prepare(`DELETE FROM checklisten WHERE id = ?`).run(id);
  return NextResponse.json({ ok: true });
}
