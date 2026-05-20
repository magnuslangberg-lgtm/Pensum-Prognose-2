import React from 'react';
import { KRISE_SCENARIOER } from '../../lib/formuesplanleggerState';

export default function Steg5Scenarioer({ state, dispatch }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Scenarioer</h2>
        <p className="text-gray-500 mb-6">Stresstest porteføljen mot historiske og egendefinerte kriser.</p>
        <div className="flex flex-wrap justify-center gap-3">
          {KRISE_SCENARIOER.map(s => (
            <button key={s.id} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">Side-om-side sammenligning, robusthetsscore og personlige scenarioer kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
