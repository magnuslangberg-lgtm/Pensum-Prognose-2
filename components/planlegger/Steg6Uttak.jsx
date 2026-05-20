import React from 'react';

export default function Steg6Uttak({ state, dispatch }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Uttak & pensjon</h2>
        <p className="text-gray-500 mb-6">Beregn bærekraftig uttaksrate og visualiser sekvensrisiko.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Årlig uttak</div>
            <div className="text-xl font-bold text-gray-800">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(state.aarligUttak || 0)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Pengene varer til</div>
            <div className="text-xl font-bold text-gray-400">—</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Trygt uttak (90 %)</div>
            <div className="text-xl font-bold text-gray-400">—</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Uttaks-slider, formuesutvikling-graf, sekvensrisiko-visualisering og anbefalt uttaksrate kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
