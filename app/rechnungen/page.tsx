"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Rechnung { id: number; rechnungsnummer: string; kunden_id: number; kundenname: string; betrag: number; mwst_prozent: number; status: string; rechnungsdatum: string; faellig_am: string; bezahlt_am: string; notizen: string; }
interface Kunde { id: number; name: string; }

const STATUS = ["Offen", "Bezahlt", "Überfällig", "Storniert"];
const STATUS_COLOR: Record<string, string> = {
  "Offen": "bg-yellow-100 text-yellow-700",
  "Bezahlt": "bg-green-100 text-green-700",
  "Überfällig": "bg-red-100 text-red-700",
  "Storniert": "bg-gray-100 text-gray-500",
};

const empty = { id: 0, rechnungsnummer: "", kunden_id: 0, kundenname: "", betrag: 0, mwst_prozent: 19, status: "Offen", rechnungsdatum: new Date().toISOString().split("T")[0], faellig_am: "", bezahlt_am: "", notizen: "" };

export default function RechnungenPage() {
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Rechnung>>(empty);

  const load = () => {
    fetch("/api/rechnungen").then(r => r.json()).then(setRechnungen);
    fetch("/api/kunden").then(r => r.json()).then(setKunden);
  };
  useEffect(load, []);

  const save = async () => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/rechnungen", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModal(false); setForm(empty); load();
  };

  const del = async (id: number) => {
    if (!confirm("Rechnung löschen?")) return;
    await fetch("/api/rechnungen", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const gesamtOffen = rechnungen.filter(r => r.status === "Offen").reduce((s, r) => s + Number(r.betrag), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Offener Betrag: <span className="font-semibold text-red-600">{gesamtOffen.toFixed(2)} €</span></p>
        </div>
        <button onClick={() => { setForm({ ...empty, rechnungsdatum: new Date().toISOString().split("T")[0] }); setModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Neue Rechnung
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Nummer", "Kunde", "Betrag (brutto)", "MwSt", "Status", "Datum", "Fällig am", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rechnungen.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Keine Rechnungen vorhanden</td></tr>}
            {rechnungen.map(r => {
              const brutto = Number(r.betrag);
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.rechnungsnummer}</td>
                  <td className="px-4 py-3 font-medium">{r.kundenname}</td>
                  <td className="px-4 py-3 font-semibold">{brutto.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-gray-500">{r.mwst_prozent}%</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[r.status] || ""}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.rechnungsdatum).toLocaleDateString("de-DE")}</td>
                  <td className="px-4 py-3 text-gray-500">{r.faellig_am ? new Date(r.faellig_am).toLocaleDateString("de-DE") : "–"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setForm(r); setModal(true); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold">{form.id ? "Rechnung bearbeiten" : "Neue Rechnung"}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Kunde *</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.kunden_id || ""} onChange={e => setForm({ ...form, kunden_id: Number(e.target.value) })}>
                  <option value="">Kunde wählen</option>
                  {kunden.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Betrag (€ brutto)</label>
                <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.betrag || ""} onChange={e => setForm({ ...form, betrag: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">MwSt (%)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.mwst_prozent ?? 19} onChange={e => setForm({ ...form, mwst_prozent: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Rechnungsdatum</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.rechnungsdatum || ""} onChange={e => setForm({ ...form, rechnungsdatum: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fällig am</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.faellig_am || ""} onChange={e => setForm({ ...form, faellig_am: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.status || "Offen"} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bezahlt am</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.bezahlt_am || ""} onChange={e => setForm({ ...form, bezahlt_am: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.notizen || ""} onChange={e => setForm({ ...form, notizen: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Abbrechen</button>
              <button onClick={save} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
