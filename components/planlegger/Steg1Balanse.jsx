import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  LIKVIDITET_VALG, EIERSKAP_VALG,
  DEFAULT_AVKASTNING, DEFAULT_VOLATILITET,
  tomPosisjon, tomGjeld,
} from '../../lib/formuesplanleggerState';

/* ─── Colours ─── */
const KATEGORI_FARGER = {
  'Bolig & eiendom': '#A67B3D',
  'Likvid portefølje': '#6B9DB8',
  'Illikvide investeringer': '#2D6A6A',
  'Pensjon': '#C4967E',
  'Annet': '#9EAAB4',
};

const LIKVIDITET_FARGER = {
  'Umiddelbar': '#2D6A6A',
  'Dager': '#6B9DB8',
  'Uker': '#A67B3D',
  'Måneder': '#C4967E',
  'År': '#9EAAB4',
};

const EIERSKAP_FARGER = {
  'Privat': '#012441',
  'Holdingselskap': '#6B9DB8',
  'Felles': '#A67B3D',
  'Ektefelle': '#C4967E',
};

/* ─── Category structure ─── */
const KATEGORIER = [
  {
    kategori: 'Bolig & eiendom',
    underkategorier: ['Primærbolig', 'Fritidsbolig', 'Utleieeiendom'],
  },
  {
    kategori: 'Likvid portefølje',
    underkategorier: [
      'Pensum Global Core Active', 'Pensum Global Edge', 'Pensum Norge',
      'Pensum Financial Opportunities', 'Pensum Nordic Banking', 'Pensum Energy',
      'Pensum Nordisk Høyrente', 'Pensum Basis',
      'Andre aksjefond', 'Rentefond', 'Bank/innskudd',
    ],
  },
  {
    kategori: 'Illikvide investeringer',
    underkategorier: ['PE-fond', 'Eiendomsfond', 'Shippingfond', 'Unoterte aksjer', 'Egen virksomhet/holdingselskap'],
  },
  {
    kategori: 'Pensjon',
    underkategorier: ['FTP', 'IPS', 'Fripoliser', 'Offentlig pensjon (forventet)'],
  },
  {
    kategori: 'Annet',
    underkategorier: ['Bil', 'Båt', 'Kunst', 'Andre verdier'],
  },
];

const AVDRAGSPLAN_VALG = [
  { value: 'annuitet', label: 'Annuitet' },
  { value: 'serielaan', label: 'Serielån' },
  { value: 'avdragsfri', label: 'Avdragsfri' },
];

const GJELD_TYPER = ['Boliglån', 'Verdipapirbelåning', 'Andre lån'];

/* ─── Formatting helpers ─── */
const fmtNOK = (v) =>
  new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(v);

const fmtNOKShort = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} MNOK`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)} TNOK`;
  return `${v}`;
};

const fmtPct = (v) => `${Number(v).toFixed(1).replace('.', ',')} %`;

/* ─── Custom Recharts tooltip ─── */
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 px-4 py-3 text-sm">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: entry.payload?.fill || entry.color }} />
          <span className="text-gray-700">{entry.name}:</span>
          <span className="font-semibold text-gray-900">{fmtNOK(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut center label ─── */
function DonutCenterLabel({ viewBox, label, value }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-gray-500 text-xs">{label}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-900 text-sm font-bold">{value}</text>
    </g>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════ */
export default function Steg1Balanse({ state, dispatch }) {
  const [openKategori, setOpenKategori] = useState(null);
  const [openGjeld, setOpenGjeld] = useState(false);

  const eiendeler = state.eiendeler || [];
  const gjeldListe = state.gjeld || [];

  /* ─── Computed aggregates ─── */
  const sumEiendeler = useMemo(() => eiendeler.reduce((s, e) => s + (Number(e.verdi) || 0), 0), [eiendeler]);
  const sumGjeld = useMemo(() => gjeldListe.reduce((s, g) => s + (Number(g.hovedstol) || 0), 0), [gjeldListe]);
  const nettoFormue = sumEiendeler - sumGjeld;

  // Likviditetsandel: umiddelbar + dager + uker as share of total assets
  const likvidVerdi = useMemo(
    () => eiendeler
      .filter(e => ['Umiddelbar', 'Dager', 'Uker'].includes(e.likviditet))
      .reduce((s, e) => s + (Number(e.verdi) || 0), 0),
    [eiendeler],
  );
  const likviditetsandel = sumEiendeler > 0 ? (likvidVerdi / sumEiendeler) * 100 : 0;

  // Category breakdown for donut
  const kategoriData = useMemo(() => {
    const map = {};
    eiendeler.forEach(e => {
      const k = e.kategori || 'Annet';
      map[k] = (map[k] || 0) + (Number(e.verdi) || 0);
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, fill: KATEGORI_FARGER[name] || '#9EAAB4' }));
  }, [eiendeler]);

  // Liquidity distribution
  const likviditetData = useMemo(() => {
    const map = {};
    LIKVIDITET_VALG.forEach(l => { map[l] = 0; });
    eiendeler.forEach(e => {
      const l = e.likviditet || 'Måneder';
      map[l] = (map[l] || 0) + (Number(e.verdi) || 0);
    });
    return LIKVIDITET_VALG.map(name => ({ name, value: map[name], fill: LIKVIDITET_FARGER[name] })).filter(d => d.value > 0);
  }, [eiendeler]);

  // Ownership distribution
  const eierskapData = useMemo(() => {
    const map = {};
    EIERSKAP_VALG.forEach(e => { map[e] = 0; });
    eiendeler.forEach(e => {
      const o = e.eierskap || 'Privat';
      map[o] = (map[o] || 0) + (Number(e.verdi) || 0);
    });
    return EIERSKAP_VALG.map(name => ({ name, value: map[name], fill: EIERSKAP_FARGER[name] })).filter(d => d.value > 0);
  }, [eiendeler]);

  /* ─── Dispatch helpers ─── */
  const addPosition = (kategori, underkategori) => {
    dispatch(prev => ({
      ...prev,
      eiendeler: [...(prev.eiendeler || []), tomPosisjon(kategori, underkategori)],
    }));
  };

  const updatePosition = (id, field, value) => {
    dispatch(prev => ({
      ...prev,
      eiendeler: (prev.eiendeler || []).map(e =>
        e.id === id ? { ...e, [field]: value } : e,
      ),
    }));
  };

  const removePosition = (id) => {
    dispatch(prev => ({
      ...prev,
      eiendeler: (prev.eiendeler || []).filter(e => e.id !== id),
    }));
  };

  const addGjeld = (type) => {
    dispatch(prev => ({
      ...prev,
      gjeld: [...(prev.gjeld || []), { ...tomGjeld(), navn: type }],
    }));
  };

  const updateGjeld = (id, field, value) => {
    dispatch(prev => ({
      ...prev,
      gjeld: (prev.gjeld || []).map(g =>
        g.id === id ? { ...g, [field]: value } : g,
      ),
    }));
  };

  const removeGjeld = (id) => {
    dispatch(prev => ({
      ...prev,
      gjeld: (prev.gjeld || []).filter(g => g.id !== id),
    }));
  };

  /* ─── Sub-components ─── */
  const posisjonerForKategori = (kategori) => eiendeler.filter(e => e.kategori === kategori);

  return (
    <div className="space-y-6">

      {/* ═══ HEADER: Netto formue + key figures ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6" style={{ backgroundColor: '#012441' }}>
          <div className="text-center mb-1">
            <span className="text-blue-300 text-sm font-medium tracking-wide uppercase">Netto formue</span>
          </div>
          <div className="text-center mb-6">
            <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {fmtNOK(nettoFormue)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-lg px-5 py-3 text-center">
              <div className="text-blue-300 text-xs font-medium mb-1">Sum eiendeler</div>
              <div className="text-white text-xl font-bold">{fmtNOK(sumEiendeler)}</div>
            </div>
            <div className="bg-white/10 rounded-lg px-5 py-3 text-center">
              <div className="text-blue-300 text-xs font-medium mb-1">Sum gjeld</div>
              <div className="text-white text-xl font-bold">{fmtNOK(sumGjeld)}</div>
            </div>
            <div className="bg-white/10 rounded-lg px-5 py-3 text-center">
              <div className="text-blue-300 text-xs font-medium mb-1">Likviditetsandel</div>
              <div className="text-white text-xl font-bold">{fmtPct(likviditetsandel)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CHARTS ═══ */}
      {sumEiendeler > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Donut: kategorifordeling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Eiendelsfordeling</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={kategoriData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                >
                  {kategoriData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(val) => <span className="text-xs text-gray-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stacked bar: likviditetsfordeling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Likviditetsfordeling</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={likviditetData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tickFormatter={fmtNOKShort} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name="Verdi" radius={[0, 4, 4, 0]}>
                  {likviditetData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut: eierskap */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Eierskapsfordeling</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={eierskapData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                >
                  {eierskapData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(val) => <span className="text-xs text-gray-600">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ═══ EIENDELER ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: '#012441' }}>
          <h2 className="text-lg font-semibold text-white">Eiendeler</h2>
          <span className="text-blue-300 text-sm font-medium">{fmtNOK(sumEiendeler)}</span>
        </div>

        <div className="divide-y divide-gray-100">
          {KATEGORIER.map(({ kategori, underkategorier }) => {
            const isOpen = openKategori === kategori;
            const posisjoner = posisjonerForKategori(kategori);
            const sum = posisjoner.reduce((s, p) => s + (Number(p.verdi) || 0), 0);
            const fargeHex = KATEGORI_FARGER[kategori];

            return (
              <div key={kategori}>
                {/* Category header */}
                <button
                  onClick={() => setOpenKategori(isOpen ? null : kategori)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: fargeHex }} />
                    <span className="font-semibold text-gray-800 text-base">{kategori}</span>
                    <span className="text-gray-400 text-sm">({posisjoner.length} posisjoner)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-700">{fmtNOK(sum)}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded positions */}
                {isOpen && (
                  <div className="bg-gray-50 px-6 py-4 space-y-4">
                    {posisjoner.map(pos => (
                      <PositionRow
                        key={pos.id}
                        pos={pos}
                        onUpdate={updatePosition}
                        onRemove={removePosition}
                        fargeHex={fargeHex}
                      />
                    ))}

                    {/* Add position buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {underkategorier.map(uk => (
                        <button
                          key={uk}
                          onClick={() => addPosition(kategori, uk)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-dashed transition-colors hover:bg-white"
                          style={{ borderColor: fargeHex, color: fargeHex }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          {uk}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ GJELD ═══ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setOpenGjeld(o => !o)}
          className="w-full px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#012441' }}
        >
          <h2 className="text-lg font-semibold text-white">Gjeld</h2>
          <div className="flex items-center gap-4">
            <span className="text-blue-300 text-sm font-medium">{fmtNOK(sumGjeld)}</span>
            <svg
              className={`w-5 h-5 text-blue-300 transition-transform ${openGjeld ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {openGjeld && (
          <div className="px-6 py-4 space-y-4 bg-gray-50">
            {gjeldListe.map(g => (
              <GjeldRow
                key={g.id}
                gjeld={g}
                onUpdate={updateGjeld}
                onRemove={removeGjeld}
              />
            ))}

            <div className="flex flex-wrap gap-2 pt-2">
              {GJELD_TYPER.map(type => (
                <button
                  key={type}
                  onClick={() => addGjeld(type)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-dashed border-red-300 text-red-600 hover:bg-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PositionRow — single asset entry
   ═══════════════════════════════════════════════════════════════ */
function PositionRow({ pos, onUpdate, onRemove, fargeHex }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Compact header */}
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: fargeHex }} />
          <span className="text-sm font-medium text-gray-700 truncate">
            {pos.underkategori}{pos.navn ? ` — ${pos.navn}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-sm font-semibold text-gray-800">{fmtNOK(Number(pos.verdi) || 0)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(pos.id); }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Fjern posisjon"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fields */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Navn */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Navn</label>
              <input
                type="text"
                value={pos.navn}
                onChange={e => onUpdate(pos.id, 'navn', e.target.value)}
                placeholder="Fritekst"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            {/* Verdi */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Verdi (NOK)</label>
              <input
                type="number"
                value={pos.verdi || ''}
                onChange={e => onUpdate(pos.id, 'verdi', e.target.value === '' ? 0 : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            {/* Forventet avkastning */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Forv. avkastning (%)</label>
              <input
                type="number"
                step="0.1"
                value={pos.forventetAvkastning ?? ''}
                onChange={e => onUpdate(pos.id, 'forventetAvkastning', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            {/* Volatilitet */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Volatilitet (%)</label>
              <input
                type="number"
                step="0.1"
                value={pos.forventetVolatilitet ?? ''}
                onChange={e => onUpdate(pos.id, 'forventetVolatilitet', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>

            {/* Likviditet */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Likviditet</label>
              <select
                value={pos.likviditet}
                onChange={e => onUpdate(pos.id, 'likviditet', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              >
                {LIKVIDITET_VALG.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Eierskap */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Eierskap</label>
              <select
                value={pos.eierskap}
                onChange={e => onUpdate(pos.id, 'eierskap', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              >
                {EIERSKAP_VALG.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Kommentar */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Kommentar</label>
              <input
                type="text"
                value={pos.kommentar || ''}
                onChange={e => onUpdate(pos.id, 'kommentar', e.target.value)}
                placeholder="Valgfri"
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GjeldRow — single debt entry
   ═══════════════════════════════════════════════════════════════ */
function GjeldRow({ gjeld, onUpdate, onRemove }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-8 rounded-full flex-shrink-0 bg-red-400" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {gjeld.navn || 'Lån'}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className="text-sm font-semibold text-red-700">{fmtNOK(Number(gjeld.hovedstol) || 0)}</span>
          <button
            onClick={() => onRemove(gjeld.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Fjern gjeld"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Navn */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Navn</label>
            <input
              type="text"
              value={gjeld.navn}
              onChange={e => onUpdate(gjeld.id, 'navn', e.target.value)}
              placeholder="Lånenavn"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Hovedstol */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hovedstol (NOK)</label>
            <input
              type="number"
              value={gjeld.hovedstol || ''}
              onChange={e => onUpdate(gjeld.id, 'hovedstol', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Rente */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Rente (%)</label>
            <input
              type="number"
              step="0.1"
              value={gjeld.rente ?? ''}
              onChange={e => onUpdate(gjeld.id, 'rente', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Avdragsplan */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Avdragsplan</label>
            <select
              value={gjeld.avdragsplan}
              onChange={e => onUpdate(gjeld.id, 'avdragsplan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            >
              {AVDRAGSPLAN_VALG.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Bindingstid */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bindingstid (år)</label>
            <input
              type="number"
              value={gjeld.bindingstid || ''}
              onChange={e => onUpdate(gjeld.id, 'bindingstid', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Månedlig avdrag */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mnd. avdrag (NOK)</label>
            <input
              type="number"
              value={gjeld.maanedligAvdrag || ''}
              onChange={e => onUpdate(gjeld.id, 'maanedligAvdrag', e.target.value === '' ? 0 : Number(e.target.value))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
