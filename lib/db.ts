import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'reinigung.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS kunden (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ansprechpartner TEXT,
      adresse TEXT,
      telefon TEXT,
      email TEXT,
      vertragstyp TEXT DEFAULT 'Einmalig',
      preis_pro_einsatz REAL DEFAULT 0,
      aktiv INTEGER DEFAULT 1,
      notizen TEXT,
      erstellt_am TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS objekte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kunden_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      adresse TEXT,
      flaeche_qm REAL,
      etagen INTEGER DEFAULT 1,
      schluessel_vorhanden INTEGER DEFAULT 0,
      notizen TEXT,
      FOREIGN KEY (kunden_id) REFERENCES kunden(id)
    );

    CREATE TABLE IF NOT EXISTS auftraege (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kunden_id INTEGER NOT NULL,
      objekt_id INTEGER,
      datum TEXT NOT NULL,
      uhrzeit_von TEXT,
      uhrzeit_bis TEXT,
      mitarbeiter TEXT,
      status TEXT DEFAULT 'Geplant',
      besonderheiten TEXT,
      abgerechnet INTEGER DEFAULT 0,
      preis REAL DEFAULT 0,
      erstellt_am TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (kunden_id) REFERENCES kunden(id),
      FOREIGN KEY (objekt_id) REFERENCES objekte(id)
    );

    CREATE TABLE IF NOT EXISTS rechnungen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rechnungsnummer TEXT UNIQUE NOT NULL,
      kunden_id INTEGER NOT NULL,
      auftrag_id INTEGER,
      betrag REAL NOT NULL,
      mwst_prozent REAL DEFAULT 19,
      status TEXT DEFAULT 'Offen',
      rechnungsdatum TEXT NOT NULL,
      faellig_am TEXT,
      bezahlt_am TEXT,
      notizen TEXT,
      erstellt_am TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (kunden_id) REFERENCES kunden(id)
    );

    CREATE TABLE IF NOT EXISTS checklisten (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      objekt_id INTEGER,
      kunden_id INTEGER,
      FOREIGN KEY (objekt_id) REFERENCES objekte(id),
      FOREIGN KEY (kunden_id) REFERENCES kunden(id)
    );

    CREATE TABLE IF NOT EXISTS checklisten_punkte (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checkliste_id INTEGER NOT NULL,
      aufgabe TEXT NOT NULL,
      erledigt INTEGER DEFAULT 0,
      reihenfolge INTEGER DEFAULT 0,
      FOREIGN KEY (checkliste_id) REFERENCES checklisten(id)
    );

    CREATE TABLE IF NOT EXISTS akquise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firmenname TEXT NOT NULL,
      ansprechpartner TEXT,
      telefon TEXT,
      email TEXT,
      adresse TEXT,
      status TEXT DEFAULT 'Neu',
      naechster_kontakt TEXT,
      angebotsbetrag REAL,
      notizen TEXT,
      erstellt_am TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mitarbeiter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      telefon TEXT,
      email TEXT,
      stundenlohn REAL DEFAULT 14,
      verfuegbarkeit TEXT,
      aktiv INTEGER DEFAULT 1
    );
  `);
}
