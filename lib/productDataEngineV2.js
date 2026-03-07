import { getProductReportConfig } from '../data/productReportConfigV2';

function toPct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n <= 1 ? n * 100 : n;
}

export function buildProductReportNodes(products = [], productMeta = {}) {
  return products
    .filter((p) => Number(p?.weightPct || p?.weight || 0) > 0)
    .map((p) => {
      const config = getProductReportConfig(p.name);
      const meta = productMeta[p.name] || {};
      return {
        name: p.name,
        key: config.productKey,
        weightPct: toPct(p.weightPct ?? p.weight ?? 0),
        slideCount: config.slideCount,
        slideTitles: config.slideTitles,
        chartBlocks: config.chartBlocks,
        kpiBlocks: config.kpiBlocks,
        narrativePriority: config.narrativePriority,
        role: meta.role || p.role || '',
        benchmark: meta.benchmark || p.benchmark || '',
        riskLevel: meta.riskLevel || p.riskLevel || '',
        liquidity: meta.liquidity || p.liquidity || '',
        expectedReturn: meta.expectedReturn || p.expectedReturn || null,
        expectedYield: meta.expectedYield || p.expectedYield || null,
        pitch: meta.pitch || p.pitch || '',
        longCase: meta.longCase || p.longCase || '',
        exposures: {
          regions: meta.regions || p.regions || [],
          sectors: meta.sectors || p.sectors || [],
          style: meta.style || p.style || [],
          countries: meta.countries || p.countries || [],
          topHoldings: meta.topHoldings || p.topHoldings || [],
        },
      };
    });
}

export function summariseProductDeck(productNodes = []) {
  return productNodes.map((node) => ({
    name: node.name,
    weightPct: node.weightPct,
    slideCount: node.slideCount,
    slideTitles: node.slideTitles,
    charts: node.chartBlocks,
  }));
}
