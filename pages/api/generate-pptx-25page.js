import { generate25PagePptx } from '../../lib/pptxGenerator25Page';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const payload = req.body || {};
    const buffer = await generate25PagePptx(payload);
    const safeName = (payload.kundeNavn || 'Kunde').replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="Pensum_Forslag_Komplett_${safeName}.pptx"`);
    res.setHeader('x-pensum-output-format', 'pptx-25page');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('25-page PPTX generation error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
