import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const BRUKERE_FILE = path.join(DATA_DIR, 'brukere.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readBrukere() {
  ensureDataDir();
  if (!fs.existsSync(BRUKERE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(BRUKERE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeBrukere(brukere) {
  ensureDataDir();
  fs.writeFileSync(BRUKERE_FILE, JSON.stringify(brukere, null, 2), 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users (for login lookup)
    const brukere = readBrukere();
    return res.status(200).json(brukere);
  }

  if (req.method === 'POST') {
    // Register new user
    const { epost, pin, navn, telefon, tittel } = req.body;
    if (!epost || !pin || !navn) {
      return res.status(400).json({ error: 'Mangler påkrevde felt' });
    }

    const brukere = readBrukere();
    const epostNormalisert = epost.toLowerCase().trim();

    if (brukere[epostNormalisert]) {
      return res.status(409).json({ error: 'Denne e-postadressen er allerede registrert' });
    }

    const nyBruker = {
      epost: epostNormalisert,
      pin,
      navn,
      telefon: telefon || '',
      tittel: tittel || 'Investeringsrådgiver',
      bilde: '',
      opprettet: new Date().toISOString()
    };

    brukere[epostNormalisert] = nyBruker;
    writeBrukere(brukere);

    return res.status(201).json(nyBruker);
  }

  if (req.method === 'PUT') {
    // Update user (e.g. admin operations)
    const { epost, ...updates } = req.body;
    if (!epost) {
      return res.status(400).json({ error: 'Mangler e-post' });
    }

    const brukere = readBrukere();
    const epostNormalisert = epost.toLowerCase().trim();

    if (!brukere[epostNormalisert]) {
      return res.status(404).json({ error: 'Bruker ikke funnet' });
    }

    brukere[epostNormalisert] = { ...brukere[epostNormalisert], ...updates };
    writeBrukere(brukere);

    return res.status(200).json(brukere[epostNormalisert]);
  }

  if (req.method === 'DELETE') {
    const { epost } = req.body;
    if (!epost) {
      return res.status(400).json({ error: 'Mangler e-post' });
    }

    const brukere = readBrukere();
    const epostNormalisert = epost.toLowerCase().trim();
    delete brukere[epostNormalisert];
    writeBrukere(brukere);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Metode ikke tillatt' });
}
