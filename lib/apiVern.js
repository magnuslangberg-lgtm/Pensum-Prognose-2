// Enkel beskyttelse av AI-tjenestene, som bruker Pensums API-nøkkel. Verktøyet har
// ingen innlogging på serveren, så dette er ikke ekte tilgangskontroll: det stopper
// kall fra andre nettsteder og begrenser hvor mange kall én adresse kan gjøre.
const VINDU_MS = 60 * 1000;
const lager = globalThis.__pensumRateLimit || new Map();
globalThis.__pensumRateLimit = lager;

// Nettleseren sender Origin på alle POST-kall. Den må peke på samme vert som tjenesten.
export const erSammeOpphav = (req) => {
  const origin = req.headers?.origin;
  const vert = req.headers?.['x-forwarded-host'] || req.headers?.host;
  if (!origin || !vert) return false;
  try { return new URL(origin).host === String(vert).split(',')[0].trim(); } catch { return false; }
};

export const erOverGrensen = (req, navn, maksPerMinutt) => {
  const ip = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'ukjent';
  const nokkel = `${navn}:${ip}`;
  const naa = Date.now();
  const nylige = (lager.get(nokkel) || []).filter((t) => naa - t < VINDU_MS);
  if (nylige.length >= maksPerMinutt) { lager.set(nokkel, nylige); return true; }
  nylige.push(naa);
  lager.set(nokkel, nylige);
  if (lager.size > 5000) lager.clear();
  return false;
};

// Returnerer true når kallet er avvist og svaret allerede er sendt.
export const avvisUvedkommende = (req, res, navn, maksPerMinutt = 20) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.status(405).json({ error: 'Method not allowed' }); return true; }
  if (!erSammeOpphav(req)) { res.status(403).json({ error: 'Tjenesten kan bare brukes fra rådgiververktøyet.' }); return true; }
  if (erOverGrensen(req, navn, maksPerMinutt)) { res.status(429).json({ error: 'For mange forespørsler. Vent litt og prøv igjen.' }); return true; }
  return false;
};
