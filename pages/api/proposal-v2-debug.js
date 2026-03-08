import loadLatestPensumCsvFromUploads from '../../lib/monthlyDataImport';
import { buildProposalWorldClassV2 } from '../../lib/proposalWorldClassV2';

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
    return res.status(200).json({ ok: true, datasetMeta: { found: dataset.found, reportDate: dataset.reportDate, filepath: dataset.filepath }, model });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
