import { buildProductAdminModel, mergeProductReportData, validateProductAdminModel } from '../../lib/productReportEngineV2';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { product = {}, adminOverride = {}, exposure = {}, monthly = {}, allocationWeight = 0 } = req.body || {};
    const adminModel = buildProductAdminModel({ ...product, ...adminOverride });
    const validation = validateProductAdminModel(adminModel);
    const merged = mergeProductReportData({
      product,
      adminOverride,
      exposure,
      monthly,
      allocationWeight
    });

    return res.status(200).json({
      ok: true,
      validation,
      adminModel,
      reportNode: merged
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Unknown error'
    });
  }
}
