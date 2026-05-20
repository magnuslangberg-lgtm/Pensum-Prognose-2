import React from 'react';

export default function Steg2Mal({ state, dispatch }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mål & rammer</h2>
        <p className="text-gray-500 mb-6">Definer tidshorisont, likviditetsbehov, risikotoleranse og fremtidige hendelser.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Hovedhorisont</div>
            <div className="text-xl font-bold text-gray-800">{state.hovedhorisont || 10} år</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Risikotoleranse</div>
            <div className="text-xl font-bold text-gray-800">{state.risikotoleranse || 4} / 7</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Årlig uttak</div>
            <div className="text-xl font-bold text-gray-800">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(state.aarligUttak || 0)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Hendelser</div>
            <div className="text-xl font-bold text-gray-800">{(state.hendelser || []).length} planlagt</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Form med tidshorisont, potter, likviditetsbehov, risikotoleranse, tap-stresstest, hendelser og uttaksplan kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
