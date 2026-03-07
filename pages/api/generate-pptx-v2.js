import * as monthlyDataImport from '../../lib/monthlyDataImport.js';
import { buildProposalModelV2 } from '../../lib/proposalModelV2.js';
import { createProposalPresentationV2 } from '../../lib/pptxGeneratorV2.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb'
    }
  }
};

function getMonthlyDataset(csvBase64) {
  const parseFn = monthlyDataImport.parsePensumCsvBuffer;
  const loadFn = monthlyDataImport.loadLatestPensumCsvFromUploads;
  if (csvBase64 && typeof parseFn === 'function') {
    return parseFn(Buffer.from(String(csvBase64), 'base64'));
  }
  if (typeof loadFn === 'function') {
    return loadFn();
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { formData = null, csvBase64 = null } = req.body || {};
    const monthlyDataset = getMonthlyDataset(csvBase64);
    const proposalModel = buildProposalModelV2({ formData: formData || {}, monthlyDataset });
    const buffer = await createProposalPresentationV2(proposalModel);
    const fileName = `Pensum_Investeringsforslag_V2_${String(proposalModel?.meta?.kundeNavn || 'Investor').replace(/\s+/g, '_')}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
