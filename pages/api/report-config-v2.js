import { buildMonthlyDataSnapshot } from '../../lib/monthlyDataImport';
import { buildProductReportNodes, summariseProductDeck } from '../../lib/productDataEngineV2';

export default async function handler(req, res) {
  const uploadsDir = process.cwd() + '/uploads';
  const snapshot = buildMonthlyDataSnapshot(uploadsDir);
  const selectedProducts = Array.isArray(req.body?.selectedProducts) ? req.body.selectedProducts : [];
  const productMeta = req.body?.productMeta || {};
  const nodes = buildProductReportNodes(selectedProducts, productMeta);

  return res.status(200).json({
    ok: true,
    reportDate: snapshot.reportDate,
    availableProductsFromFeed: snapshot.products,
    selectedProductDeck: summariseProductDeck(nodes),
    selectedProductNodes: nodes,
  });
}
