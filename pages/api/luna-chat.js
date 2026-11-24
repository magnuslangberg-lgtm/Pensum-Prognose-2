import Anthropic from '@anthropic-ai/sdk';
import { avvisUvedkommende } from '../../lib/apiVern';
import { LUNA_MODELL, LUNA_VERKTOY, byggLunaInstruks, byggLunaMeldinger, tolkLunaSvar } from '../../lib/luna';

export const config = { api: { bodyParser: { sizeLimit: '256kb' } } };

const INSTRUKS = byggLunaInstruks();

export default async function handler(req, res) {
  if (avvisUvedkommende(req, res, 'luna-chat', 20)) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'AI-tjenesten er ikke konfigurert.' });
  const messages = byggLunaMeldinger(req.body?.messages, req.body?.context);
  if (!messages.length) return res.status(400).json({ error: 'Ingen melding mottatt.' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // Blir forespørselen avvist av sikkerhetsfiltrene, kjører Anthropic den på en reservemodell.
    const response = await client.beta.messages.create({
      model: process.env.ANTHROPIC_LUNA_MODEL || LUNA_MODELL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Korte chat-svar: lav innsats holder svartiden nede.
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: INSTRUKS, cache_control: { type: 'ephemeral' } }],
      tools: LUNA_VERKTOY,
      messages,
    });
    return res.status(200).json(tolkLunaSvar(response));
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return res.status(429).json({ error: 'Luna har mye å gjøre akkurat nå. Prøv igjen om litt.' });
    if (error instanceof Anthropic.AuthenticationError) { console.error('Luna: ugyldig API-nøkkel'); return res.status(500).json({ error: 'AI-tjenesten er ikke riktig konfigurert.' }); }
    if (error instanceof Anthropic.BadRequestError) { console.error('Luna: forespørselen ble avvist:', error.message); return res.status(500).json({ error: 'Luna kunne ikke behandle forespørselen.' }); }
    console.error('Luna-chat feilet:', error);
    return res.status(500).json({ error: 'Luna kunne ikke svare. Prøv igjen.' });
  }
}
