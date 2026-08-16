import Anthropic from '@anthropic-ai/sdk';

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

const ALLOWED_FIELDS = new Set([
  'kundeNavn', 'kundeSelskap', 'risikoprofil', 'horisont', 'aksjerKunde', 'aksjefondKunde', 'renterKunde',
  'kontanterKunde', 'peFondKunde', 'unoterteAksjerKunde', 'shippingKunde', 'egenEiendomKunde',
  'eiendomSyndikatKunde', 'eiendomFondKunde', 'investeringsFormaal', 'likviditetsbehov',
]);
const NUMBER_FIELDS = new Set(['horisont', 'aksjerKunde', 'aksjefondKunde', 'renterKunde', 'kontanterKunde', 'peFondKunde', 'unoterteAksjerKunde', 'shippingKunde', 'egenEiendomKunde', 'eiendomSyndikatKunde', 'eiendomFondKunde']);

const sanitizeFields = (input = {}) => {
  const fields = {};
  for (const [key, raw] of Object.entries(input)) {
    if (!ALLOWED_FIELDS.has(key) || raw === null || raw === '') continue;
    if (NUMBER_FIELDS.has(key)) {
      const value = Number(raw);
      if (Number.isFinite(value) && value >= 0) fields[key] = Math.round(value);
    } else fields[key] = String(raw).slice(0, 300);
  }
  if (fields.risikoprofil && !['Defensiv', 'Moderat', 'Dynamisk', 'Offensiv'].includes(fields.risikoprofil)) delete fields.risikoprofil;
  return fields;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const messages = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
  if (!messages.length) return res.status(400).json({ error: 'Ingen melding mottatt.' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'AI-tjenesten er ikke konfigurert.' });
  const sanitizedMessages = messages
    .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
    .map((message) => ({ role: message.role, content: message.content.slice(0, 3000) }));
  const firstUserIndex = sanitizedMessages.findIndex((message) => message.role === 'user');
  const safeMessages = firstUserIndex >= 0 ? sanitizedMessages.slice(firstUserIndex) : [];
  if (!safeMessages.length) return res.status(400).json({ error: 'Ingen brukermelding mottatt.' });
  const context = JSON.stringify(req.body?.context || {}).slice(0, 6000);

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514', max_tokens: 1200,
      system: `Du er Luna, en vennlig norskspråklig assistent i Pensums rådgiververktøy. Hjelp rådgiveren med å forstå og fylle ut kundekortet og bruke verktøyet. Du skal ikke gi personlig investeringsråd eller påstå at en investering er egnet. Når brukeren eksplisitt oppgir data som bør fylles inn, foreslå dem i fields. Ikke gjett manglende verdier. Gjeldende kundekortkontekst: ${context}\nSvar BARE som JSON: {"message":"naturlig svar på norsk","fields":{},"merknad":"eventuell kort usikkerhet"}`,
      messages: safeMessages,
    });
    const text = response.content.find((part) => part.type === 'text')?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Kunne ikke tolke Luna-responsen.');
    const parsed = JSON.parse(match[0]);
    return res.status(200).json({
      message: String(parsed.message || 'Jeg kunne ikke formulere et svar.').slice(0, 4000),
      fields: sanitizeFields(parsed.fields), merknad: String(parsed.merknad || '').slice(0, 500),
    });
  } catch (error) {
    console.error('Luna-chat feilet:', error);
    return res.status(500).json({ error: error.message || 'Luna kunne ikke svare.' });
  }
}
