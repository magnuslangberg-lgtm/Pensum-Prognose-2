import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data');
const BRUKERE_FILE = path.join(DATA_DIR, 'brukere.json');

// Admin-passordet ligger bare på serveren. Sett PENSUM_ADMIN_PASSORD i miljøvariablene
// (f.eks. i Vercel). Reserveverdien gjør at eksisterende oppsett fortsatt virker.
const ADMIN_PASSORD = process.env.PENSUM_ADMIN_PASSORD || 'pensum2024';

// Felt en bruker selv kan endre på egen profil.
const PROFILFELT = ['navn', 'telefon', 'tittel', 'bilde'];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readBrukere() {
  try {
    ensureDataDir();
    if (!fs.existsSync(BRUKERE_FILE)) return {};
    return JSON.parse(fs.readFileSync(BRUKERE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeBrukere(brukere) {
  ensureDataDir();
  fs.writeFileSync(BRUKERE_FILE, JSON.stringify(brukere, null, 2), 'utf8');
}

// Sammenligner uten å lekke lengde/innhold via svartid.
function likeHemmeligheter(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// PIN sendes aldri ut av serveren.
function utenPin(bruker) {
  if (!bruker) return bruker;
  const { pin, ...rest } = bruker;
  return rest;
}

function erAdmin(req) {
  return likeHemmeligheter(req.headers['x-admin-passord'], ADMIN_PASSORD);
}

export default function handler(req, res) {
  const body = req.body || {};
  const epostNormalisert = typeof body.epost === 'string' ? body.epost.toLowerCase().trim() : '';

  if (req.method === 'GET') {
    // Brukerlisten (uten PIN) er bare for admin.
    if (!erAdmin(req)) return res.status(401).json({ error: 'Krever admin-tilgang' });
    const brukere = readBrukere();
    const liste = Object.fromEntries(Object.entries(brukere).map(([k, b]) => [k, utenPin(b)]));
    return res.status(200).json(liste);
  }

  if (req.method === 'POST' && body.action === 'login') {
    const bruker = readBrukere()[epostNormalisert];
    if (!bruker) return res.status(404).json({ error: 'Fant ingen bruker med denne e-postadressen' });
    if (!likeHemmeligheter(body.pin, bruker.pin)) return res.status(401).json({ error: 'Feil PIN-kode' });
    return res.status(200).json(utenPin(bruker));
  }

  if (req.method === 'POST' && body.action === 'admin') {
    if (!likeHemmeligheter(body.passord, ADMIN_PASSORD)) return res.status(401).json({ error: 'Feil passord' });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'POST') {
    // Registrer ny bruker
    const { pin, navn, telefon, tittel } = body;
    if (!epostNormalisert || !pin || !navn) {
      return res.status(400).json({ error: 'Mangler påkrevde felt' });
    }
    if (!/^\d{4,8}$/.test(String(pin))) {
      return res.status(400).json({ error: 'PIN må være 4–8 sifre' });
    }

    const brukere = readBrukere();
    if (brukere[epostNormalisert]) {
      return res.status(409).json({ error: 'Denne e-postadressen er allerede registrert' });
    }

    const nyBruker = {
      epost: epostNormalisert,
      pin: String(pin),
      navn: String(navn).slice(0, 120),
      telefon: String(telefon || '').slice(0, 40),
      tittel: String(tittel || 'Investeringsrådgiver').slice(0, 80),
      bilde: '',
      opprettet: new Date().toISOString()
    };

    brukere[epostNormalisert] = nyBruker;
    try {
      writeBrukere(brukere);
    } catch {
      return res.status(503).json({ error: 'Kunne ikke lagre bruker på serveren' });
    }

    return res.status(201).json(utenPin(nyBruker));
  }

  if (req.method === 'PUT') {
    if (!epostNormalisert) {
      return res.status(400).json({ error: 'Mangler e-post' });
    }

    const brukere = readBrukere();
    const eksisterende = brukere[epostNormalisert];
    if (!eksisterende) {
      return res.status(404).json({ error: 'Bruker ikke funnet' });
    }

    // Admin kan endre profil og PIN. En bruker kan endre egen profil med riktig PIN.
    const admin = erAdmin(req);
    if (!admin && !likeHemmeligheter(body.pin, eksisterende.pin)) {
      return res.status(401).json({ error: 'Krever PIN eller admin-tilgang' });
    }
    const oppdatering = {};
    PROFILFELT.forEach((felt) => {
      if (typeof body[felt] === 'string') oppdatering[felt] = body[felt].slice(0, felt === 'bilde' ? 700000 : 200);
    });
    if (admin && typeof body.nyPin === 'string' && /^\d{4,8}$/.test(body.nyPin)) {
      oppdatering.pin = body.nyPin;
    }

    brukere[epostNormalisert] = { ...eksisterende, ...oppdatering };
    try {
      writeBrukere(brukere);
    } catch {
      return res.status(503).json({ error: 'Kunne ikke lagre endringen på serveren' });
    }

    return res.status(200).json(utenPin(brukere[epostNormalisert]));
  }

  if (req.method === 'DELETE') {
    if (!erAdmin(req)) return res.status(401).json({ error: 'Krever admin-tilgang' });
    if (!epostNormalisert) {
      return res.status(400).json({ error: 'Mangler e-post' });
    }

    const brukere = readBrukere();
    delete brukere[epostNormalisert];
    try {
      writeBrukere(brukere);
    } catch {
      return res.status(503).json({ error: 'Kunne ikke slette bruker på serveren' });
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Metode ikke tillatt' });
}
