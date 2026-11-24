import Anthropic from '@anthropic-ai/sdk';
import { avvisUvedkommende } from '../../lib/apiVern';
import { LUNA_MODELL, byggSkjermbildeInstruks, tolkSkjermbildeSvar, byggDagensInstruks, tolkDagensSvar } from '../../lib/luna';
import { byggVedleggInnhold } from '../../lib/lunaVedlegg';

// To lesemåter: kundedata og Pensum-beholdning til Luna-chatten, eller hele dagens portefølje til fanen med samme navn.
const INSTRUKS = byggSkjermbildeInstruks();
const INSTRUKS_DAGENS = byggDagensInstruks();

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };

export default async function handler(req, res) {
  if (avvisUvedkommende(req, res, 'luna-skjermbilde', 10)) return;
  const { innhold, feil } = byggVedleggInnhold(req.body || {});
  if (feil) return res.status(400).json({ error: feil });
  const dagens = req.body?.modus === 'dagens';
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'AI-tjenesten er ikke konfigurert.' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.beta.messages.create({
      model: process.env.ANTHROPIC_LUNA_MODEL || LUNA_MODELL, max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system: [{ type: 'text', text: dagens ? INSTRUKS_DAGENS : INSTRUKS, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: innhold }],
    });
    if (response.stop_reason === 'refusal') return res.status(200).json(dagens ? { posisjoner: [], utenVerdi: [], plattformer: [], merknad: 'Luna kunne ikke lese dette vedlegget.' } : { fields: {}, actions: [], ukjente: [], merknad: 'Luna kunne ikke lese dette vedlegget.' });
    const text = response.content.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
    return res.status(200).json(dagens ? tolkDagensSvar(text) : tolkSkjermbildeSvar(text));
  } catch (error) {
    console.error('Luna-analyse feilet:', error);
    console.error(error);
    return res.status(500).json({ error: 'Luna kunne ikke lese vedlegget.' });
  }
}
