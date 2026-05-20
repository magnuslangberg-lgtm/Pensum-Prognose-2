import React, { useState, useCallback, useEffect, useRef } from 'react';
import { STEG_LABELS, initialState, loadState, saveState, listProfiles, saveProfile, loadProfile, deleteProfile, exportStateJSON, importStateJSON } from '../../lib/formuesplanleggerState';
import Steg1Balanse from './Steg1Balanse';
import Steg2Mal from './Steg2Mal';
import Steg3Allokering from './Steg3Allokering';
import Steg4Prognose from './Steg4Prognose';
import Steg5Scenarioer from './Steg5Scenarioer';
import Steg6Uttak from './Steg6Uttak';
import Steg7Oppsummering from './Steg7Oppsummering';

const PENSUM_COLORS = {
  navy: '#0D2841', darkBlue: '#012441', lightBlue: '#6B9DB8', salmon: '#C4967E',
  teal: '#2D6A6A', gold: '#A67B3D',
};

const STEG_KOMPONENTER = {
  1: Steg1Balanse,
  2: Steg2Mal,
  3: Steg3Allokering,
  4: Steg4Prognose,
  5: Steg5Scenarioer,
  6: Steg6Uttak,
  7: Steg7Oppsummering,
};

export default function FormuesplanleggerTab({ visIndekser, onVisIndekser }) {
  const [state, setState] = useState(() => loadState());
  const [aktivtSteg, setAktivtSteg] = useState(1);
  const [profilNavn, setProfilNavn] = useState('');
  const [profiler, setProfiler] = useState([]);
  const [visProfilPanel, setVisProfilPanel] = useState(false);
  const saveTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { setProfiler(listProfiles()); }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 300);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  const dispatch = useCallback((action) => {
    setState(prev => {
      if (typeof action === 'function') return action(prev);
      return { ...prev, ...action };
    });
  }, []);

  const handleNyKunde = () => {
    if (!confirm('Nullstill alle data og start på nytt?')) return;
    const fresh = initialState();
    setState(fresh);
    setAktivtSteg(1);
  };

  const handleLagreProfil = () => {
    const name = profilNavn.trim() || state.kundeNavn || 'Uten navn';
    saveProfile(name, state);
    setProfiler(listProfiles());
    setProfilNavn('');
  };

  const handleLastProfil = (name) => {
    const loaded = loadProfile(name);
    if (loaded) {
      const defaults = initialState();
      setState({ ...defaults, ...loaded, forutsetninger: { ...defaults.forutsetninger, ...(loaded.forutsetninger || {}) } });
      setAktivtSteg(1);
    }
  };

  const handleSlettProfil = (name) => {
    if (!confirm(`Slett profilen "${name}"?`)) return;
    deleteProfile(name);
    setProfiler(listProfiles());
  };

  const handleExportJSON = () => {
    const blob = new Blob([exportStateJSON(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formuesplan-${state.kundeNavn || 'kunde'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = importStateJSON(ev.target.result);
        setState(imported);
        setAktivtSteg(1);
      } catch { alert('Ugyldig JSON-fil.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const StegKomponent = STEG_KOMPONENTER[aktivtSteg];

  return (
    <div className="space-y-4">
      {/* Topplinje: tittel + handlinger */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">Formuesplanlegger</h2>
            <span className="text-blue-300 text-sm">{state.kundeNavn || 'Ny kunde'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onVisIndekser} className="px-3 py-1.5 text-xs rounded-md bg-white/10 text-blue-200 hover:bg-white/20 transition-colors">
              Vis historiske indekser
            </button>
            <button onClick={() => setVisProfilPanel(p => !p)} className="px-3 py-1.5 text-xs rounded-md bg-white/10 text-blue-200 hover:bg-white/20 transition-colors">
              Profiler
            </button>
            <button onClick={handleNyKunde} className="px-3 py-1.5 text-xs rounded-md bg-white/10 text-blue-200 hover:bg-white/20 transition-colors">
              Ny kunde
            </button>
          </div>
        </div>

        {/* Profil-panel (kollapsbart) */}
        {visProfilPanel && (
          <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
            <div className="flex flex-wrap items-end gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Lagre nåværende som profil</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={profilNavn} onChange={e => setProfilNavn(e.target.value)}
                    placeholder={state.kundeNavn || 'Profilnavn'}
                    className="px-3 py-1.5 border rounded-md text-sm w-48"
                  />
                  <button onClick={handleLagreProfil} className="px-3 py-1.5 text-xs rounded-md text-white font-medium" style={{ backgroundColor: PENSUM_COLORS.teal }}>Lagre</button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportJSON} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">Eksporter JSON</button>
                <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">Importer JSON</button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </div>
            </div>
            {profiler.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Lagrede profiler</div>
                <div className="flex flex-wrap gap-2">
                  {profiler.map(p => (
                    <div key={p.name} className="flex items-center gap-1 bg-white border rounded-md px-3 py-1.5 text-sm">
                      <button onClick={() => handleLastProfil(p.name)} className="text-blue-700 hover:underline">{p.name}</button>
                      <span className="text-gray-300 text-xs">{new Date(p.date).toLocaleDateString('nb-NO')}</span>
                      <button onClick={() => handleSlettProfil(p.name)} className="text-red-400 hover:text-red-600 ml-1">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steg-navigasjon */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white overflow-x-auto">
          <nav className="flex items-center gap-1 min-w-max">
            {STEG_LABELS.map((steg, idx) => {
              const erAktivt = steg.id === aktivtSteg;
              return (
                <React.Fragment key={steg.id}>
                  {idx > 0 && (
                    <div className="w-8 h-px bg-gray-200 flex-shrink-0" />
                  )}
                  <button
                    onClick={() => setAktivtSteg(steg.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      erAktivt
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      erAktivt
                        ? 'text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`} style={erAktivt ? { backgroundColor: PENSUM_COLORS.darkBlue } : undefined}>
                      {steg.id}
                    </span>
                    {steg.label}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Aktivt steg */}
      <StegKomponent state={state} dispatch={dispatch} />

      {/* Navigasjonsknapper */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => setAktivtSteg(s => Math.max(1, s - 1))}
          disabled={aktivtSteg === 1}
          className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          &larr; Forrige
        </button>
        <button
          onClick={() => setAktivtSteg(s => Math.min(7, s + 1))}
          disabled={aktivtSteg === 7}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
        >
          Neste &rarr;
        </button>
      </div>
    </div>
  );
}
