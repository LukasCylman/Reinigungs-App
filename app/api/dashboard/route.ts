import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();

  const heute = new Date().toISOString().split("T")[0];
  const monthStart = heute.slice(0, 7) + "-01";

  const auftraegeHeute = db.prepare(`SELECT COUNT(*) as n FROM auftraege WHERE datum = ?`).get(heute) as { n: number };
  const auftraegeOffen = db.prepare(`SELECT COUNT(*) as n FROM auftraege WHERE status = 'Geplant'`).get() as { n: number };
  const auftraegeMonat = db.prepare(`SELECT COUNT(*) as n FROM auftraege WHERE datum >= ?`).get(monthStart) as { n: number };

  const rechnungenOffen = db.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(betrag),0) as sum FROM rechnungen WHERE status = 'Offen'`).get() as { n: number; sum: number };
  const umsatzMonat = db.prepare(`SELECT COALESCE(SUM(betrag),0) as sum FROM rechnungen WHERE rechnungsdatum >= ? AND status != 'Storniert'`).get(monthStart) as { sum: number };

  const kundenAktiv = db.prepare(`SELECT COUNT(*) as n FROM kunden WHERE aktiv = 1`).get() as { n: number };
  const akquiseOffen = db.prepare(`SELECT COUNT(*) as n FROM akquise WHERE status != 'Gewonnen' AND status != 'Verloren'`).get() as { n: number };

  const naechsteAuftraege = db.prepare(`
    SELECT a.*, k.name as kundenname FROM auftraege a
    JOIN kunden k ON a.kunden_id = k.id
    WHERE a.datum >= ? AND a.status = 'Geplant'
    ORDER BY a.datum, a.uhrzeit_von
    LIMIT 5
  `).all(heute);

  const offeneRechnungen = db.prepare(`
    SELECT r.*, k.name as kundenname FROM rechnungen r
    JOIN kunden k ON r.kunden_id = k.id
    WHERE r.status = 'Offen'
    ORDER BY r.faellig_am
    LIMIT 5
  `).all();

  return NextResponse.json({
    auftraegeHeute: auftraegeHeute.n,
    auftraegeOffen: auftraegeOffen.n,
    auftraegeMonat: auftraegeMonat.n,
    rechnungenOffen: rechnungenOffen.n,
    rechnungenOffenBetrag: rechnungenOffen.sum,
    umsatzMonat: umsatzMonat.sum,
    kundenAktiv: kundenAktiv.n,
    akquiseOffen: akquiseOffen.n,
    naechsteAuftraege,
    offeneRechnungen,
  });
}
