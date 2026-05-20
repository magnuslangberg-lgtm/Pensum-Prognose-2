import React from 'react';

export default function Steg3Allokering({ state, dispatch }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Allokering</h2>
        <p className="text-gray-500 mb-6">Sammenlign dagens allokering med foreslått porteføljesammensetning.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">Dagens allokering</div>
            <p className="text-gray-400 text-sm">Auto-utledet fra nåsituasjonen</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-2">Foreslått allokering</div>
            <p className="text-gray-400 text-sm">Pensum-mandater med sliders</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        <p className="text-lg">To-kolonne visning med sliders, diff-visning og byggestein-kort kommer i neste leveranse.</p>
      </div>
    </div>
  );
}
