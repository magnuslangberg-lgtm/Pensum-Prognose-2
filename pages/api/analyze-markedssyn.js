import Anthropic from '@anthropic-ai/sdk';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY er ikke konfigurert. Legg til i .env.local' });
  }

  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Ingen bilder mottatt' });
    }

    const client = new Anthropic({ apiKey });

    const imageContent = images.map((img) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType,
        data: img.data,
      },
    }));

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `Du er en finansrådgiver hos Pensum Asset Management. Analyser disse slidene fra forvaltningsavdelingen og lag et kortfattet markedssyn for kunderapporter.

Skriv TRE korte avsnitt (2-3 setninger hver) på norsk:

1. **Makrobildet**: Overordnet makroøkonomisk bilde — vekst, sentralbankpolitikk, geopolitikk. Fokuser på hva som er relevant for investorer.

2. **Risikobildet**: Hovedrisikoer og hvordan vi posisjonerer oss for å håndtere dem. Vær konkret om porteføljestrategi.

3. **Mulighetsbilde**: Hvor ser vi muligheter? Konkrete sektorer, regioner eller instrumenter som er attraktive nå.

Svar BARE med JSON i dette formatet (ingen annen tekst):
{"makro": "...", "risiko": "...", "muligheter": "..."}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].text.trim();
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Kunne ikke parse AI-respons', raw: text });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (error) {
    console.error('Markedssyn-analyse feilet:', error);
    return res.status(500).json({ error: error.message || 'Ukjent feil' });
  }
}
