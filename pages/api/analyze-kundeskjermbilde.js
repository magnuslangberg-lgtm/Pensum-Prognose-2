import Anthropic from '@anthropic-ai/sdk';
import { avvisUvedkommende } from '../../lib/apiVern';
import { LUNA_MODELL, byggSkjermbildeInstruks, tolkSkjermbildeSvar } from '../../lib/luna';

const INSTRUKS = byggSkjermbildeInstruks();

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (avvisUvedkommende(req, res, 'luna-skjermbilde', 10)) return;
  const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 4) : [];
  if (!images.length) return res.status(400).json({ error: 'Ingen skjermbilder mottatt.' });
  if (images.some((img) => !/^image\/(png|jpeg|webp|gif)$/.test(img?.mediaType || '') || !img?.data)) return res.status(400).json({ error: 'Ugyldig bildeformat.' });
  const melding = typeof req.body?.melding === 'string' ? req.body.melding.trim().slice(0, 2000) : '';
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'AI-tjenesten er ikke konfigurert.' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.beta.messages.create({
      model: process.env.ANTHROPIC_LUNA_MODEL || LUNA_MODELL, max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: INSTRUKS, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: [
        ...images.map((img) => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } })),
        { type: 'text', text: `${melding ? `Rådgiveren skriver om bildene:\n${melding}\n\n` : ''}Les skjermbildene og svar med JSON som beskrevet.` },
      ] }],
    });
    if (response.stop_reason === 'refusal') return res.status(200).json({ fields: {}, actions: [], ukjente: [], merknad: 'Luna kunne ikke lese dette skjermbildet.' });
    const text = response.content.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
    return res.status(200).json(tolkSkjermbildeSvar(text));
  } catch (error) {
    console.error('Luna-analyse feilet:', error);
    console.error(error);
    return res.status(500).json({ error: 'Luna kunne ikke analysere skjermbildet.' });
  }
}
