import loadLatestPensumCsvFromUploads from '../../lib/monthlyDataImport.js';
import { buildProposalModelV2 } from '../../lib/proposalModelV2.js';
import { createProposalPresentationV2 } from '../../lib/pptxGeneratorV2.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const monthlyDataset = loadLatestPensumCsvFromUploads();
    const proposal = buildProposalModelV2({
      formData: req.body || {},
      monthlyDataset,
    });

    const pptx = await createProposalPresentationV2(proposal);
    const buffer = await pptx.write({ outputType: 'nodebuffer' });

    const fileName = `Pensum_Investeringsforslag_v2_${new Date().toISOString().slice(0,10)}.pptx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'PPTX generation failed',
    });
  }
}
