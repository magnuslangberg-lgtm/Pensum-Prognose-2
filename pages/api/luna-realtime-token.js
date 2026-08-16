import crypto from 'node:crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16kb',
    },
  },
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = globalThis.__pensumLunaRealtimeRateLimit || new Map();
globalThis.__pensumLunaRealtimeRateLimit = rateLimitStore;

function getClientKey(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(req) {
  const key = getClientKey(req);
  const now = Date.now();
  const recent = (rateLimitStore.get(key) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) return true;
  recent.push(now);
  rateLimitStore.set(key, recent);
  return false;
}

function getSafetyIdentifier(req) {
  const raw = `${getClientKey(req)}|${String(req.headers['user-agent'] || '').slice(0, 240)}|pensum-luna`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Vent litt før du starter en ny talesamtale.' });
  }

  if (req.body?.authenticated !== true) {
    return res.status(401).json({ error: 'Logg inn for å snakke med Luna.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Luna mangler OPENAI_API_KEY i Vercel-miljøet.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const openAIResponse = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Safety-Identifier': getSafetyIdentifier(req),
      },
      signal: controller.signal,
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: process.env.OPENAI_LUNA_REALTIME_MODEL || 'gpt-realtime-2.1-mini',
          output_modalities: ['audio'],
          instructions: 'Du er stemmen til Luna i Pensum Prognose. Snakk naturlig, kort og tydelig på norsk. Les bare opp teksten du får i hver svarforespørsel, uten å legge til egne råd eller handlinger.',
          audio: {
            input: {
              transcription: {
                model: 'gpt-4o-mini-transcribe',
                language: 'no',
                prompt: 'Norsk investeringsrådgivning. Pensum Prognose, Pensum Norge, Pensum Global Energy, risikoprofil, portefølje, allokering og investert beløp.',
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 700,
                create_response: false,
                interrupt_response: false,
              },
            },
            output: {
              voice: 'marin',
            },
          },
        },
      }),
    });
    clearTimeout(timeout);

    const data = await openAIResponse.json().catch(() => ({}));
    if (!openAIResponse.ok) {
      console.error('OpenAI-feil for Luna tale:', openAIResponse.status, data?.error?.message || data);
      const errorCode = data?.error?.code;
      if (openAIResponse.status === 401) return res.status(500).json({ error: 'OPENAI_API_KEY i Vercel er ugyldig.' });
      if (errorCode === 'insufficient_quota') return res.status(503).json({ error: 'OpenAI-prosjektet mangler tilgjengelig API-kvote.' });
      if (errorCode === 'model_not_found') return res.status(500).json({ error: 'Talemodellen for Luna er ikke tilgjengelig i OpenAI-prosjektet.' });
      if (openAIResponse.status === 429) return res.status(503).json({ error: 'Luna tale er midlertidig opptatt. Prøv igjen om litt.' });
      return res.status(502).json({ error: 'Kunne ikke starte talesamtalen med Luna.' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Luna tale-feil:', error);
    if (error?.name === 'AbortError') return res.status(504).json({ error: 'Oppstart av tale tok for lang tid. Prøv igjen.' });
    return res.status(500).json({ error: 'Kunne ikke starte talesamtalen med Luna.' });
  }
}
