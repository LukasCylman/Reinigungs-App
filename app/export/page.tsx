"use client";
import { Download, FileSpreadsheet } from "lucide-react";

const exports = [
  { type: "auftraege", label: "Aufträge exportieren", desc: "Alle Aufträge mit Datum, Kunde, Mitarbeiter, Status und Preis", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { type: "rechnungen", label: "Rechnungen exportieren", desc: "Alle Rechnungen mit Nummer, Betrag, MwSt und Zahlungsstatus", color: "bg-green-50 border-green-200 text-green-700" },
  { type: "kunden", label: "Kunden exportieren", desc: "Alle Kunden mit Kontaktdaten und Vertragsdetails", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { type: "akquise", label: "Akquise exportieren", desc: "Alle Interessenten mit Status und Angebotswerten", color: "bg-orange-50 border-orange-200 text-orange-700" },
];

export default function ExportPage() {
  const download = (type: string) => {
    window.open(`/api/export?type=${type}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Excel Export</h1>
        <p className="text-gray-500 text-sm mt-1">Exportiere deine Daten als Excel-Datei (.xlsx) für weitere Auswertungen</p>
      </div>

      <div className="grid gap-4">
        {exports.map(({ type, label, desc, color }) => (
          <div key={type} className={`border rounded-xl p-5 flex items-center gap-4 ${color}`}>
            <div className="w-12 h-12 bg-white/60 rounded-xl flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs opacity-75 mt-0.5">{desc}</p>
            </div>
            <button
              onClick={() => download(type)}
              className="flex items-center gap-2 bg-white/80 hover:bg-white border border-current/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
            >
              <Download className="w-4 h-4" /> Herunterladen
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <p className="text-sm text-gray-600 font-medium mb-2">Hinweis</p>
        <p className="text-sm text-gray-500">Die exportierten Excel-Dateien können mit Microsoft Excel, Google Sheets oder LibreOffice Calc geöffnet werden. Alle Daten werden aus der aktuellen Datenbank exportiert.</p>
      </div>
    </div>
  );
}
