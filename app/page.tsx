"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Users, FileText, TrendingUp, Euro, Calendar } from "lucide-react";

interface DashboardData {
  auftraegeHeute: number;
  auftraegeOffen: number;
  auftraegeMonat: number;
  rechnungenOffen: number;
  rechnungenOffenBetrag: number;
  umsatzMonat: number;
  kundenAktiv: number;
  akquiseOffen: number;
  naechsteAuftraege: Array<{ id: number; datum: string; uhrzeit_von: string; uhrzeit_bis: string; kundenname: string; mitarbeiter: string }>;
  offeneRechnungen: Array<{ id: number; rechnungsnummer: string; kundenname: string; betrag: number; faellig_am: string }>;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64 text-gray-400">Lade Dashboard...</div>;

  const heute = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{heute}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Aufträge heute" value={data.auftraegeHeute} icon={Calendar} color="bg-blue-500" />
        <StatCard label="Offene Aufträge" value={data.auftraegeOffen} icon={ClipboardList} color="bg-orange-500" />
        <StatCard label="Aktive Kunden" value={data.kundenAktiv} icon={Users} color="bg-green-500" />
        <StatCard label="Offene Rechnungen" value={data.rechnungenOffen} icon={FileText} color="bg-red-500" />
        <StatCard label="Aufträge diesen Monat" value={data.auftraegeMonat} icon={ClipboardList} color="bg-purple-500" />
        <StatCard label="Umsatz diesen Monat" value={`${data.umsatzMonat.toFixed(2)} €`} icon={Euro} color="bg-emerald-500" />
        <StatCard label="Offener Betrag" value={`${data.rechnungenOffenBetrag.toFixed(2)} €`} icon={Euro} color="bg-amber-500" />
        <StatCard label="Akquise laufend" value={data.akquiseOffen} icon={TrendingUp} color="bg-indigo-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Nächste Aufträge</h2>
          {data.naechsteAuftraege.length === 0 ? (
            <p className="text-gray-400 text-sm">Keine geplanten Aufträge</p>
          ) : (
            <div className="space-y-3">
              {data.naechsteAuftraege.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.kundenname}</p>
                    <p className="text-xs text-gray-500">{a.mitarbeiter || "Kein Mitarbeiter"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">{new Date(a.datum).toLocaleDateString("de-DE")}</p>
                    <p className="text-xs text-gray-400">{a.uhrzeit_von} – {a.uhrzeit_bis}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Offene Rechnungen</h2>
          {data.offeneRechnungen.length === 0 ? (
            <p className="text-gray-400 text-sm">Keine offenen Rechnungen</p>
          ) : (
            <div className="space-y-3">
              {data.offeneRechnungen.map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.kundenname}</p>
                    <p className="text-xs text-gray-500">{r.rechnungsnummer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{r.betrag.toFixed(2)} €</p>
                    <p className="text-xs text-gray-400">fällig: {r.faellig_am ? new Date(r.faellig_am).toLocaleDateString("de-DE") : "–"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
