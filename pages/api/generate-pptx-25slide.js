import { generateProposal25SlidePptx } from '../../lib/pptxGenerator25Slide';

export const runtime = 'nodejs';
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const buffer = await generateProposal25SlidePptx(body);
    const safeName = (body.kundeNavn || 'Kunde').replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g, '_');

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="Pensum_Investeringsforslag_Full_${safeName}.pptx"`);
    res.setHeader('x-pensum-output-format', 'pptx-25slide');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[generate-pptx-25slide] Error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
