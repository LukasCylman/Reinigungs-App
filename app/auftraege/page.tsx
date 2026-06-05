"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Auftrag {
  id: number; kunden_id: number; objekt_id?: number; datum: string;
  uhrzeit_von: string; uhrzeit_bis: string; mitarbeiter: string;
  status: string; besonderheiten: string; abgerechnet: number; preis: number;
  kundenname: string; objektname?: string;
}
interface Kunde { id: number; name: string; }
interface Objekt { id: number; name: string; kunden_id: number; }

const STATUS = ["Geplant", "In Bearbeitung", "Abgeschlossen", "Abgesagt"];
const STATUS_COLOR: Record<string, string> = {
  "Geplant": "bg-blue-100 text-blue-700",
  "In Bearbeitung": "bg-yellow-100 text-yellow-700",
  "Abgeschlossen": "bg-green-100 text-green-700",
  "Abgesagt": "bg-red-100 text-red-700",
};

const empty = { id: 0, kunden_id: 0, objekt_id: 0, datum: "", uhrzeit_von: "", uhrzeit_bis: "", mitarbeiter: "", status: "Geplant", besonderheiten: "", abgerechnet: 0, preis: 0 };

export default function AuftraegePage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [objekte, setObjekte] = useState<Objekt[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Auftrag>>(empty);
  const [filter, setFilter] = useState("alle");

  const load = () => {
    fetch("/api/auftraege").then(r => r.json()).then(setAuftraege);
    fetch("/api/kunden").then(r => r.json()).then(setKunden);
    fetch("/api/objekte").then(r => r.json()).then(setObjekte);
  };
  useEffect(load, []);

  const save = async () => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/auftraege", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModal(false); setForm(empty); load();
  };

  const del = async (id: number) => {
    if (!confirm("Auftrag löschen?")) return;
    await fetch("/api/auftraege", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const filtered = filter === "alle" ? auftraege : auftraege.filter(a => a.status === filter);
  const kundeObjekte = objekte.filter(o => o.kunden_id === Number(form.kunden_id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Aufträge</h1>
        <button onClick={() => { setForm(empty); setModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Neuer Auftrag
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["alle", ...STATUS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}>
            {s === "alle" ? "Alle" : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Datum", "Uhrzeit", "Kunde", "Objekt", "Mitarbeiter", "Preis", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Keine Aufträge gefunden</td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{new Date(a.datum).toLocaleDateString("de-DE")}</td>
                <td className="px-4 py-3 text-gray-500">{a.uhrzeit_von} – {a.uhrzeit_bis}</td>
                <td className="px-4 py-3 font-medium">{a.kundenname}</td>
                <td className="px-4 py-3 text-gray-500">{a.objektname || "–"}</td>
                <td className="px-4 py-3 text-gray-500">{a.mitarbeiter || "–"}</td>
                <td className="px-4 py-3 font-medium">{a.preis ? `${Number(a.preis).toFixed(2)} €` : "–"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || ""}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setForm(a); setModal(true); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(a.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-gray-900">{form.id ? "Auftrag bearbeiten" : "Neuer Auftrag"}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Kunde *</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.kunden_id || ""} onChange={e => setForm({ ...form, kunden_id: Number(e.target.value), objekt_id: 0 })}>
                  <option value="">Kunde wählen</option>
                  {kunden.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Objekt</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.objekt_id || ""} onChange={e => setForm({ ...form, objekt_id: Number(e.target.value) })}>
                  <option value="">Kein Objekt</option>
                  {kundeObjekte.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Datum *</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.datum || ""} onChange={e => setForm({ ...form, datum: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.status || "Geplant"} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Von</label>
                <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.uhrzeit_von || ""} onChange={e => setForm({ ...form, uhrzeit_von: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Bis</label>
                <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.uhrzeit_bis || ""} onChange={e => setForm({ ...form, uhrzeit_bis: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mitarbeiter</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.mitarbeiter || ""} onChange={e => setForm({ ...form, mitarbeiter: e.target.value })} placeholder="z.B. Maria, Peter" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Preis (€)</label>
                <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.preis || ""} onChange={e => setForm({ ...form, preis: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Besonderheiten</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.besonderheiten || ""} onChange={e => setForm({ ...form, besonderheiten: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Abbrechen</button>
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
