import loadLatestPensumCsvFromUploads from '../../lib/monthlyDataImport';
import { buildProposalWorldClassV2 } from '../../lib/proposalWorldClassV2';
import { generateProposalPptxV2 } from '../../lib/pptxGeneratorV2';

export const runtime = 'nodejs';
export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const dataset = loadLatestPensumCsvFromUploads();
    const body = req.body || {};
    const model = buildProposalWorldClassV2({
      dataset,
      portfolioWeights: body.portfolioWeights || body.pensumAllokering || {},
      customer: body.customer || {},
    });
    const buffer = await generateProposalPptxV2(model);
    const safeName = (model?.meta?.customerName || 'Kunde').replace(/[^a-zA-Z0-9_-]+/g, '_');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="Pensum_Investeringsforslag_V2_${safeName}.pptx"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
