import React from 'react';

export default function Steg4Prognose({ state, dispatch }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prognose</h2>
        <p className="text-gray-500 mb-6">Visualisering av forventet formuesutvikling basert på allokering og forutsetninger.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Horisont</div>
            <div className="text-xl font-bold text-gray-800">{state.hovedhorisont || 10} år</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">Forventet sluttformue</div>
            <div className="text-xl font-bold text-gray-400">—</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">10. percentil</div>
            <div className="text-xl font-bold text-gray-400">—</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-xs text-gray-500 font-medium mb-1">90. percentil</div>
            <div className="text-xl font-bold text-gray-400">—</div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Stablet arealdiagram, Monte Carlo-sannsynlighetsbånd, milestone-markører og kontantstrømsvisualisering kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
