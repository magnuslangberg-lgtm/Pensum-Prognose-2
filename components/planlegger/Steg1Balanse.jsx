import React from 'react';

export default function Steg1Balanse({ state, dispatch }) {
  const sumEiendeler = (state.eiendeler || []).reduce((s, e) => s + (Number(e.verdi) || 0), 0);
  const sumGjeld = (state.gjeld || []).reduce((s, g) => s + (Number(g.hovedstol) || 0), 0);
  const nettoFormue = sumEiendeler - sumGjeld;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Formuesbalansen</h2>
        <p className="text-gray-500 mb-6">Kartlegg kundens eiendeler og gjeld for å få et helhetlig bilde av nåsituasjonen.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-sm text-blue-600 font-medium mb-1">Sum eiendeler</div>
            <div className="text-2xl font-bold text-blue-900">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(sumEiendeler)}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-6">
            <div className="text-sm text-red-600 font-medium mb-1">Sum gjeld</div>
            <div className="text-2xl font-bold text-red-900">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(sumGjeld)}</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-6">
            <div className="text-sm text-emerald-600 font-medium mb-1">Netto formue</div>
            <div className="text-3xl font-bold text-emerald-900">{new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(nettoFormue)}</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Eiendeler, gjeld, diagrammer og nøkkeltall kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
