import { loadLatestPensumCsvFromUploads, parsePensumCsvBuffer } from '../../lib/monthlyDataImport.js';
import { buildProposalModelV2 } from '../../lib/proposalModelV2.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData = null, csvBase64 = null } = req.body || {};
    const monthlyDataset = csvBase64
      ? parsePensumCsvBuffer(Buffer.from(String(csvBase64), 'base64'))
      : loadLatestPensumCsvFromUploads();

    const proposalModel = buildProposalModelV2({ formData: formData || {}, monthlyDataset });

    return res.status(200).json({
      ok: true,
      reportDate: monthlyDataset?.reportDate || null,
      unresolvedProducts: monthlyDataset?.unresolvedProducts || [],
      proposalModel
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
