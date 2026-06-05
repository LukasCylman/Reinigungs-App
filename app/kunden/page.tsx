"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Building2, ChevronDown, ChevronRight } from "lucide-react";

interface Kunde { id: number; name: string; ansprechpartner: string; adresse: string; telefon: string; email: string; vertragstyp: string; preis_pro_einsatz: number; aktiv: number; notizen: string; }
interface Objekt { id: number; kunden_id: number; name: string; adresse: string; flaeche_qm: number; etagen: number; schluessel_vorhanden: number; notizen: string; }

const emptyKunde = { id: 0, name: "", ansprechpartner: "", adresse: "", telefon: "", email: "", vertragstyp: "Wöchentlich", preis_pro_einsatz: 0, aktiv: 1, notizen: "" };
const emptyObjekt = { id: 0, kunden_id: 0, name: "", adresse: "", flaeche_qm: 0, etagen: 1, schluessel_vorhanden: 0, notizen: "" };

export default function KundenPage() {
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [objekte, setObjekte] = useState<Objekt[]>([]);
  const [modal, setModal] = useState<"kunde" | "objekt" | null>(null);
  const [form, setForm] = useState<Partial<Kunde>>(emptyKunde);
  const [objForm, setObjForm] = useState<Partial<Objekt>>(emptyObjekt);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () => {
    fetch("/api/kunden").then(r => r.json()).then(setKunden);
    fetch("/api/objekte").then(r => r.json()).then(setObjekte);
  };
  useEffect(load, []);

  const saveKunde = async () => {
    const method = form.id ? "PUT" : "POST";
    await fetch("/api/kunden", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setModal(null); setForm(emptyKunde); load();
  };

  const saveObjekt = async () => {
    await fetch("/api/objekte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(objForm) });
    setModal(null); setObjForm(emptyObjekt); load();
  };

  const delKunde = async (id: number) => {
    if (!confirm("Kunden löschen?")) return;
    await fetch("/api/kunden", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const delObjekt = async (id: number) => {
    if (!confirm("Objekt löschen?")) return;
    await fetch("/api/objekte", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kunden & Objekte</h1>
        <button onClick={() => { setForm(emptyKunde); setModal("kunde"); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Neuer Kunde
        </button>
      </div>

      <div className="space-y-3">
        {kunden.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">Noch keine Kunden angelegt</div>}
        {kunden.map(k => {
          const kundeObjekte = objekte.filter(o => o.kunden_id === k.id);
          const open = expanded === k.id;
          return (
            <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center p-4 gap-3">
                <button onClick={() => setExpanded(open ? null : k.id)} className="text-gray-400 hover:text-gray-600">
                  {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{k.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.aktiv ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {k.aktiv ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{k.ansprechpartner} · {k.telefon} · {k.vertragstyp}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900">{k.preis_pro_einsatz ? `${Number(k.preis_pro_einsatz).toFixed(2)} €` : "–"}</p>
                  <p className="text-xs text-gray-400">pro Einsatz</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => { setForm(k); setModal("kunde"); }} className="text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => delKunde(k.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {open && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Objekte ({kundeObjekte.length})</p>
                    <button onClick={() => { setObjForm({ ...emptyObjekt, kunden_id: k.id }); setModal("objekt"); }}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                      <Plus className="w-3 h-3" /> Objekt hinzufügen
                    </button>
                  </div>
                  {kundeObjekte.length === 0 && <p className="text-sm text-gray-400">Noch keine Objekte</p>}
                  {kundeObjekte.map(o => (
                    <div key={o.id} className="bg-white rounded-lg p-3 flex items-start justify-between border border-gray-100">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{o.name}</p>
                        <p className="text-xs text-gray-500">{o.adresse} · {o.flaeche_qm ? `${o.flaeche_qm} m²` : ""} · {o.etagen} Etage(n) · {o.schluessel_vorhanden ? "Schlüssel vorhanden" : "Kein Schlüssel"}</p>
                      </div>
                      <button onClick={() => delObjekt(o.id)} className="text-gray-400 hover:text-red-600 ml-2 shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {k.email && <p className="text-xs text-gray-400">E-Mail: {k.email} · Adresse: {k.adresse}</p>}
                  {k.notizen && <p className="text-xs text-gray-400 italic">{k.notizen}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal === "kunde" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold">{form.id ? "Kunde bearbeiten" : "Neuer Kunde"}</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                { label: "Firmenname *", key: "name", span: 2 },
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
                <label className="block text-xs font-medium text-gray-500 mb-1">Vertragstyp</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.vertragstyp || ""} onChange={e => setForm({ ...form, vertragstyp: e.target.value })}>
                  {["Einmalig", "Wöchentlich", "2x wöchentlich", "Monatlich"].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Preis pro Einsatz (€)</label>
                <input type="number" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.preis_pro_einsatz || ""} onChange={e => setForm({ ...form, preis_pro_einsatz: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="aktiv" checked={!!form.aktiv} onChange={e => setForm({ ...form, aktiv: e.target.checked ? 1 : 0 })} />
                <label htmlFor="aktiv" className="text-sm text-gray-700">Aktiver Kunde</label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.notizen || ""} onChange={e => setForm({ ...form, notizen: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium">Abbrechen</button>
              <button onClick={saveKunde} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "objekt" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold">Neues Objekt</h2>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Objektname *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={objForm.name || ""} onChange={e => setObjForm({ ...objForm, name: e.target.value })} placeholder="z.B. Büro 2. OG" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Adresse</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={objForm.adresse || ""} onChange={e => setObjForm({ ...objForm, adresse: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fläche (m²)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={objForm.flaeche_qm || ""} onChange={e => setObjForm({ ...objForm, flaeche_qm: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Etagen</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={objForm.etagen || 1} onChange={e => setObjForm({ ...objForm, etagen: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="schluessel" checked={!!objForm.schluessel_vorhanden} onChange={e => setObjForm({ ...objForm, schluessel_vorhanden: e.target.checked ? 1 : 0 })} />
                <label htmlFor="schluessel" className="text-sm text-gray-700">Schlüssel vorhanden</label>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Notizen</label>
                <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={objForm.notizen || ""} onChange={e => setObjForm({ ...objForm, notizen: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium">Abbrechen</button>
              <button onClick={saveObjekt} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
