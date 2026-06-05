"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, X, Check, CheckSquare, Square } from "lucide-react";

interface Punkt { id: number; checkliste_id: number; aufgabe: string; erledigt: number; reihenfolge: number; }
interface Checkliste { id: number; name: string; kunden_id: number; objekt_id: number; kundenname: string; objektname: string; punkte: Punkt[]; }
interface Kunde { id: number; name: string; }

export default function ChecklistenPage() {
  const [listen, setListen] = useState<Checkliste[]>([]);
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newKunde, setNewKunde] = useState(0);
  const [newPunkt, setNewPunkt] = useState<Record<number, string>>({});

  const load = () => {
    fetch("/api/checklisten").then(r => r.json()).then(setListen);
    fetch("/api/kunden").then(r => r.json()).then(setKunden);
  };
  useEffect(load, []);

  const saveCheckliste = async () => {
    await fetch("/api/checklisten", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, kunden_id: newKunde || null, objekt_id: null }) });
    setModal(false); setNewName(""); setNewKunde(0); load();
  };

  const addPunkt = async (checklisteId: number) => {
    const aufgabe = newPunkt[checklisteId];
    if (!aufgabe?.trim()) return;
    await fetch("/api/checklisten/punkte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkliste_id: checklisteId, aufgabe, reihenfolge: 0 }) });
    setNewPunkt(p => ({ ...p, [checklisteId]: "" }));
    load();
  };

  const togglePunkt = async (p: Punkt) => {
    await fetch("/api/checklisten/punkte", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, erledigt: p.erledigt ? 0 : 1, aufgabe: p.aufgabe }) });
    load();
  };

  const delPunkt = async (id: number) => {
    await fetch("/api/checklisten/punkte", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  const delListe = async (id: number) => {
    if (!confirm("Checkliste löschen?")) return;
    await fetch("/api/checklisten", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Checklisten</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Neue Checkliste
        </button>
      </div>

      {listen.length === 0 && <div className="bg-white rounded-xl p-8 text-center text-gray-400 border border-gray-100">Noch keine Checklisten angelegt</div>}

      <div className="grid gap-4">
        {listen.map(cl => {
          const erledigt = cl.punkte.filter(p => p.erledigt).length;
          const gesamt = cl.punkte.length;
          const prozent = gesamt > 0 ? Math.round((erledigt / gesamt) * 100) : 0;
          return (
            <div key={cl.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{cl.name}</h2>
                  <p className="text-xs text-gray-500">{cl.kundenname || "Allgemein"} {cl.objektname ? `· ${cl.objektname}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">{erledigt}/{gesamt}</span>
                  <button onClick={() => delListe(cl.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {gesamt > 0 && (
                <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${prozent}%` }} />
                </div>
              )}

              <div className="space-y-2 mb-4">
                {cl.punkte.map(p => (
                  <div key={p.id} className="flex items-center gap-3 group">
                    <button onClick={() => togglePunkt(p)} className="shrink-0 text-gray-400 hover:text-green-600">
                      {p.erledigt ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5" />}
                    </button>
                    <span className={`flex-1 text-sm ${p.erledigt ? "line-through text-gray-400" : "text-gray-700"}`}>{p.aufgabe}</span>
                    <button onClick={() => delPunkt(p.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                  placeholder="Neue Aufgabe..."
                  value={newPunkt[cl.id] || ""}
                  onChange={e => setNewPunkt(p => ({ ...p, [cl.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addPunkt(cl.id)}
                />
                <button onClick={() => addPunkt(cl.id)} className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Hinzufügen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold">Neue Checkliste</h2>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={newName} onChange={e => setNewName(e.target.value)} placeholder="z.B. Büroreinigung Standard" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Für Kunden (optional)</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={newKunde} onChange={e => setNewKunde(Number(e.target.value))}>
                  <option value={0}>Allgemein</option>
                  {kunden.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Abbrechen</button>
              <button onClick={saveCheckliste} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
