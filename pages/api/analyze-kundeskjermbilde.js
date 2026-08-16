import Anthropic from '@anthropic-ai/sdk';

export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

const ALLOWED_FIELDS = new Set([
  'kundeNavn', 'kundeSelskap', 'risikoprofil', 'horisont', 'aksjerKunde', 'aksjefondKunde', 'renterKunde',
  'kontanterKunde', 'peFondKunde', 'unoterteAksjerKunde', 'shippingKunde', 'egenEiendomKunde',
  'eiendomSyndikatKunde', 'eiendomFondKunde', 'investeringsFormaal', 'likviditetsbehov',
]);
const NUMBER_FIELDS = new Set(['horisont', 'aksjerKunde', 'aksjefondKunde', 'renterKunde', 'kontanterKunde', 'peFondKunde', 'unoterteAksjerKunde', 'shippingKunde', 'egenEiendomKunde', 'eiendomSyndikatKunde', 'eiendomFondKunde']);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const images = Array.isArray(req.body?.images) ? req.body.images.slice(0, 4) : [];
  if (!images.length) return res.status(400).json({ error: 'Ingen skjermbilder mottatt.' });
  if (images.some((img) => !/^image\/(png|jpeg|webp|gif)$/.test(img?.mediaType || '') || !img?.data)) return res.status(400).json({ error: 'Ugyldig bildeformat.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'AI-tjenesten er ikke konfigurert.' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 1800,
      messages: [{ role: 'user', content: [
        ...images.map((img) => ({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } })),
        { type: 'text', text: `Du er Luna, dataassistent for et norsk finansrådgiververktøy. Les skjermbildene og trekk KUN ut kundedata som er tydelig synlige. Ikke gjett. Beløp skal være hele NOK uten skilletegn. Horisont er antall år. Risikoprofil må være Defensiv, Moderat, Dynamisk eller Offensiv. Returner bare JSON:
{"fields":{"kundeNavn":null,"kundeSelskap":null,"risikoprofil":null,"horisont":null,"aksjerKunde":null,"aksjefondKunde":null,"renterKunde":null,"kontanterKunde":null,"peFondKunde":null,"unoterteAksjerKunde":null,"shippingKunde":null,"egenEiendomKunde":null,"eiendomSyndikatKunde":null,"eiendomFondKunde":null,"investeringsFormaal":null,"likviditetsbehov":null},"merknad":"kort forklaring om usikre eller utelatte data"}` },
      ] }],
    });
    const text = response.content.find((part) => part.type === 'text')?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke tolke AI-responsen.');
    const parsed = JSON.parse(match[0]);
    const fields = {};
    for (const [key, raw] of Object.entries(parsed.fields || {})) {
      if (!ALLOWED_FIELDS.has(key) || raw === null || raw === '') continue;
      if (NUMBER_FIELDS.has(key)) {
        const value = Number(raw);
        if (Number.isFinite(value) && value >= 0) fields[key] = Math.round(value);
      } else fields[key] = String(raw).slice(0, 300);
    }
    if (fields.risikoprofil && !['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].includes(fields.risikoprofil)) delete fields.risikoprofil;
    return res.status(200).json({ fields, merknad: String(parsed.merknad || '').slice(0, 500) });
  } catch (error) {
    console.error('Luna-analyse feilet:', error);
    return res.status(500).json({ error: error.message || 'Luna kunne ikke analysere skjermbildet.' });
  }
}
