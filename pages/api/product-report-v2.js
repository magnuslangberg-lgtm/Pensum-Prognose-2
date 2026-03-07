import { buildProductReportNode } from '../../lib/productReportEngineV2.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { product = {}, override = {}, exposureData = null, weight = 0 } = req.body || {};
  const node = buildProductReportNode({ product, override, exposureData, weight });
  return res.status(200).json({ ok: true, node });
}
