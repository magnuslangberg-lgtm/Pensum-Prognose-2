import { buildProposalModelV2 } from '../../lib/proposalModelV2.js';
import loadLatestPensumCsvFromUploads from '../../lib/monthlyDataImport.js';

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

    return res.status(200).json({
      ok: true,
      monthlyDataset: {
        reportDate: monthlyDataset?.reportDate || null,
        fileName: monthlyDataset?.fileName || null,
        productCount: Array.isArray(monthlyDataset?.products) ? monthlyDataset.products.length : 0,
      },
      proposal,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Preview failed',
    });
  }
}
