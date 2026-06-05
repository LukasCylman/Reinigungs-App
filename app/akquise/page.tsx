"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Phone, Mail } from "lucide-react";

interface Akquise { id: number; firmenname: string; ansprechpartner: string; telefon: string; email: string; adresse: string; status: string; naechster_kontakt: string; angebotsbetrag: number; notizen: string; erstellt_am: string; }

const STATUS = ["Neu", "Kontaktiert", "Angebot gesendet", "In Verhandlung", "Gewonnen", "Verloren"];
const STATUS_COLOR: Record<string, string> = {
  "Neu": "bg-gray-100 text-gray-600",
  "Kontaktiert": "bg-blue-100 text-blue-700",
  "Angebot gesendet": "bg-yellow-100 text-yellow-700",
  "In Verhandlung": "bg-orange-100 text-orange-700",
  "Gewonnen": "bg-green-100 text-green-700",
  "Verloren": "bg-red-100 text-red-700",
};

const empty: Partial<Akquise> = { firmenname: "", ansprechpartner: "", telefon: "", email: "", adresse: "", status: "Neu", naechster_kontakt: "", angebotsbetrag: 0, notizen: "" };

export default function AkquisePage() {
  const [liste, setListe] = useState<Akquise[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<Partial<Akquise>>(empty);
  const [filter, setFilter] = useState("alle");

  const load = () => { fetch("/api/akquise").then(r => r.json()).then(setListe); };
  useEffect(load, []);

  const save = async () => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/akquise", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModal(false); setForm(empty); load();
  };

  const del = async (id: number) => {
    if (!confirm("Eintrag löschen?")) return;
    await fetch("/api/akquise", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const filtered = filter === "alle" ? liste : liste.filter(a => a.status === filter);
  const potenzial = liste.filter(a => a.status !== "Verloren" && a.status !== "Gewonnen").reduce((s, a) => s + Number(a.angebotsbetrag || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Akquise</h1>
          <p className="text-sm text-gray-500 mt-0.5">Potenzial laufend: <span className="font-semibold text-green-600">{potenzial.toFixed(2)} €</span></p>
        </div>
        <button onClick={() => { setForm(empty); setModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Neuer Interessent
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

      <div className="grid gap-3">
        {filtered.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">Keine Einträge gefunden</div>}
        {filtered.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{a.firmenname}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || ""}`}>{a.status}</span>
              </div>
              <p className="text-sm text-gray-600">{a.ansprechpartner}</p>
              <div className="flex gap-4 mt-2">
                {a.telefon && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3" />{a.telefon}</span>}
                {a.email && <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{a.email}</span>}
              </div>
              {a.notizen && <p className="text-xs text-gray-400 mt-2 italic">{a.notizen}</p>}
            </div>
            <div className="text-right shrink-0">
              {a.angebotsbetrag ? <p className="font-semibold text-gray-900">{Number(a.angebotsbetrag).toFixed(2)} €</p> : null}
              {a.naechster_kontakt && <p className="text-xs text-gray-400 mt-0.5">Kontakt: {new Date(a.naechster_kontakt).toLocaleDateString("de-DE")}</p>}
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => { setForm(a); setModal(true); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => del(a.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold">{form.id ? "Bearbeiten" : "Neuer Interessent"}</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: "Firmenname *", key: "firmenname", span: 2 },
                { label: "Ansprechpartner", key: "ansprechpartner" },
                { label: "Telefon", key: "telefon" },
                { label: "E-Mail", key: "email" },
                { label: "Adresse", key: "adresse" },
              ].map(({ label, key, span }) => (
                <div key={key} className={span === 2 ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={(form as Record<string, unknown>)[key] as string || ""} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.status || "Neu"} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Angebotsbetrag (€)</label>
                <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.angebotsbetrag || ""} onChange={e => setForm({ ...form, angebotsbetrag: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Nächster Kontakt</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.naechster_kontakt || ""} onChange={e => setForm({ ...form, naechster_kontakt: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
                <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.notizen || ""} onChange={e => setForm({ ...form, notizen: e.target.value })} />
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
