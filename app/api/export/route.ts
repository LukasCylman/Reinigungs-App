import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const db = getDb();
  const type = req.nextUrl.searchParams.get("type") || "auftraege";

  let data: unknown[] = [];
  let sheetName = "Export";

  if (type === "auftraege") {
    data = db.prepare(`
      SELECT a.datum, a.uhrzeit_von, a.uhrzeit_bis, k.name as Kunde, o.name as Objekt,
      a.mitarbeiter as Mitarbeiter, a.status as Status, a.preis as Preis,
      CASE WHEN a.abgerechnet = 1 THEN 'Ja' ELSE 'Nein' END as Abgerechnet,
      a.besonderheiten as Besonderheiten
      FROM auftraege a JOIN kunden k ON a.kunden_id = k.id
      LEFT JOIN objekte o ON a.objekt_id = o.id
      ORDER BY a.datum DESC
    `).all();
    sheetName = "Aufträge";
  } else if (type === "rechnungen") {
    data = db.prepare(`
      SELECT r.rechnungsnummer as Rechnungsnummer, k.name as Kunde, r.betrag as Betrag,
      r.mwst_prozent as MwSt_Prozent, r.status as Status, r.rechnungsdatum as Rechnungsdatum,
      r.faellig_am as Fällig_Am, r.bezahlt_am as Bezahlt_Am
      FROM rechnungen r JOIN kunden k ON r.kunden_id = k.id
      ORDER BY r.rechnungsdatum DESC
    `).all();
    sheetName = "Rechnungen";
  } else if (type === "kunden") {
    data = db.prepare(`
      SELECT name as Name, ansprechpartner as Ansprechpartner, adresse as Adresse,
      telefon as Telefon, email as Email, vertragstyp as Vertragstyp,
      preis_pro_einsatz as Preis_Pro_Einsatz,
      CASE WHEN aktiv = 1 THEN 'Ja' ELSE 'Nein' END as Aktiv
      FROM kunden ORDER BY name
    `).all();
    sheetName = "Kunden";
  } else if (type === "akquise") {
    data = db.prepare(`SELECT firmenname as Firma, ansprechpartner as Ansprechpartner, telefon as Telefon,
      email as Email, status as Status, naechster_kontakt as Nächster_Kontakt,
      angebotsbetrag as Angebotsbetrag, notizen as Notizen FROM akquise ORDER BY erstellt_am DESC`).all();
    sheetName = "Akquise";
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${sheetName}_Export.xlsx"`,
    },
  });
}
