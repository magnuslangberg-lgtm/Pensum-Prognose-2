import React from 'react';

export default function Steg7Oppsummering({ state, dispatch }) {
  const sumEiendeler = (state.eiendeler || []).reduce((s, e) => s + (Number(e.verdi) || 0), 0);
  const sumGjeld = (state.gjeld || []).reduce((s, g) => s + (Number(g.hovedstol) || 0), 0);
  const nettoFormue = sumEiendeler - sumGjeld;
  const fmt = v => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Oppsummering</h2>
            <p className="text-gray-500">Komprimert oversikt egnet for projektor og PDF-eksport.</p>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div>{state.kundeNavn || 'Kunde ikke navngitt'}</div>
            <div>{state.opprettetDato}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-lg p-5 text-center">
            <div className="text-sm text-emerald-600 font-medium mb-1">Netto formue i dag</div>
            <div className="text-2xl font-bold text-emerald-900">{fmt(nettoFormue)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-5 text-center">
            <div className="text-sm text-blue-600 font-medium mb-1">Horisont</div>
            <div className="text-2xl font-bold text-blue-900">{state.hovedhorisont || 10} år</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-5 text-center">
            <div className="text-sm text-amber-600 font-medium mb-1">Risikotoleranse</div>
            <div className="text-2xl font-bold text-amber-900">{state.risikotoleranse || 4} / 7</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Allokerings-visualisering, prognose-graf, scenario-tabell, fritekst-anbefaling, PDF/JSON-eksport og disclaimer kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
