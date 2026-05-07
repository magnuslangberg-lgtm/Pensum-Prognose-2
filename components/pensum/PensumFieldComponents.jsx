import React, { useEffect, useState } from 'react';
import {
  ASSET_COLORS,
  ASSET_COLORS_LIGHT,
  CATEGORY_COLORS,
  PENSUM_COLORS,
  formatCurrency,
  formatNumber,
  formatPercent
} from '../../lib/pensumCore';

export function CurrencyInput({ label, value, onChange, indent }) {
  const [local, setLocal] = useState(formatNumber(value));
  useEffect(() => setLocal(formatNumber(value)), [value]);
  return (
    <div className={indent ? 'mb-3 ml-6' : 'mb-3'}>
      <label className="block text-sm font-medium mb-1.5" style={{ color: indent ? PENSUM_COLORS.darkGray : PENSUM_COLORS.darkBlue }}>{label}</label>
      <div className="relative">
        <input type="text" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={() => { const v = parseInt(local.replace(/[^0-9]/g, ''), 10) || 0; onChange(v); setLocal(formatNumber(v)); }} onFocus={() => setLocal(value.toString())} className="w-full border border-gray-200 rounded-lg py-2 px-3 pr-10 text-sm" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
      </div>
    </div>
  );
}

export function StatCard({ label, value, subtext, color }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border border-gray-100">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: color || PENSUM_COLORS.darkBlue }}>{value}</div>
      {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
    </div>
  );
}

export function CollapsibleSection({ title, isOpen, onToggle, sum, children }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={onToggle}>
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          <span className="font-medium" style={{ color: PENSUM_COLORS.darkBlue }}>{title}</span>
        </div>
        <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatCurrency(sum)}</span>
      </div>
      {isOpen && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  );
}

export function AllokeringRow({ item, index, isSubItem, effektivtInvestertBelop, updateAllokeringVekt, updateAllokeringAvkastning, avkastningLaast, onRemove }) {
  const [dragVekt, setDragVekt] = useState(item.vekt);
  useEffect(() => { setDragVekt(item.vekt); }, [item.vekt]);
  const commitDragVekt = () => updateAllokeringVekt(index, Number(dragVekt) || 0);
  const itemColor = ASSET_COLORS[item.navn] || CATEGORY_COLORS[item.kategori] || '#888';
  const pctFilled = Math.min(100, Math.max(0, dragVekt));
  return (
    <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all">
      {/* Remove button */}
      {onRemove && (
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
      {/* Name */}
      <div className="flex items-center gap-2.5 min-w-0" style={{ width: '140px' }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: itemColor }}></div>
        <span className="font-medium text-sm truncate" style={{ color: PENSUM_COLORS.darkBlue }}>{item.navn}</span>
      </div>
      {/* Slider area */}
      <div className="flex items-center gap-2 flex-1">
        <button onClick={() => updateAllokeringVekt(index, Math.max(0, (item.vekt || 0) - 0.5))} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:bg-white flex-shrink-0 flex items-center justify-center text-sm font-medium transition-colors">−</button>
        {/* Custom styled slider track */}
        <div className="flex-1 relative h-8 flex items-center" style={{ minWidth: '120px' }}>
          <div className="absolute inset-x-0 h-2 rounded-full bg-gray-100"></div>
          <div className="absolute left-0 h-2 rounded-full transition-all" style={{ width: pctFilled + '%', backgroundColor: itemColor, opacity: 0.3 }}></div>
          <input
            type="range" min="0" max="100" step="0.5"
            value={dragVekt}
            onChange={(e) => setDragVekt(parseFloat(e.target.value) || 0)}
            onMouseUp={commitDragVekt}
            onTouchEnd={commitDragVekt}
            className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute w-4 h-4 rounded-full shadow-md border-2 border-white transition-all pointer-events-none z-20"
            style={{ left: `calc(${pctFilled}% - 8px)`, backgroundColor: itemColor }}
          ></div>
        </div>
        {/* Percentage input */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <input
            type="number" min="0" max="100" step="0.5"
            value={dragVekt}
            onChange={(e) => setDragVekt(parseFloat(e.target.value) || 0)}
            onBlur={commitDragVekt}
            className="w-14 py-1.5 px-2 text-sm text-right font-semibold border-none outline-none bg-transparent"
            style={{ color: PENSUM_COLORS.darkBlue }}
          />
          <span className="text-xs text-gray-400 pr-2">%</span>
        </div>
        <button onClick={() => updateAllokeringVekt(index, (item.vekt || 0) + 0.5)} className="w-7 h-7 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:bg-white flex-shrink-0 flex items-center justify-center text-sm font-medium transition-colors">+</button>
      </div>
      {/* Amount */}
      <div className="text-xs text-gray-500 text-right flex-shrink-0 tabular-nums" style={{ width: '90px' }}>
        {formatCurrency((item.vekt / 100) * effektivtInvestertBelop)}
      </div>
      {/* Expected return */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <input type="number" step="0.5" value={item.avkastning} onChange={(e) => updateAllokeringAvkastning(index, e.target.value)} disabled={avkastningLaast} className={"w-14 py-1.5 px-2 text-sm text-center font-medium border-none outline-none bg-transparent" + (avkastningLaast ? " text-gray-400 cursor-not-allowed" : "")} style={!avkastningLaast ? { color: PENSUM_COLORS.darkBlue } : {}} title={avkastningLaast ? "Avkastningsraten er låst av admin" : ""} />
          <span className="text-xs text-gray-400 pr-2">%</span>
        </div>
      </div>
    </div>
  );
}

export function SammenligningRow({ item, index, updateSammenligningVekt, updateSammenligningAvkastning }) {
  const [localVekt, setLocalVekt] = useState(item.vekt.toString());
  useEffect(() => { setLocalVekt(item.vekt.toFixed(1)); }, [item.vekt]);
  return (
    <tr className="border-b border-gray-100 hover:bg-purple-50">
      <td className="py-2 pl-3 pr-2"><div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ASSET_COLORS_LIGHT[item.navn] || ASSET_COLORS[item.navn] }}></div><span className="text-sm" style={{ color: PENSUM_COLORS.purple }}>{item.navn}</span></div></td>
      <td className="py-2 px-1"><div className="flex items-center justify-center"><input type="text" value={localVekt} onChange={(e) => setLocalVekt(e.target.value)} onBlur={() => updateSammenligningVekt(index, parseFloat(localVekt) || 0)} className="w-14 text-center text-xs border border-purple-200 rounded py-1 px-1 bg-purple-50" /><span className="ml-1 text-purple-400 text-xs">%</span></div></td>
      <td className="py-2 px-1"><div className="flex items-center justify-center"><input type="number" step="0.5" value={item.avkastning} onChange={(e) => updateSammenligningAvkastning(index, e.target.value)} className="w-14 text-center text-xs border border-purple-200 rounded py-1 px-1 bg-purple-50" /><span className="ml-1 text-purple-400 text-xs">%</span></div></td>
    </tr>
  );
}

export function KategoriHeaderRow({ kategori, isExpanded, onToggle }) {
  if (!kategori || kategori.items.length <= 1) return null;
  const katColor = CATEGORY_COLORS[kategori.kategori] || PENSUM_COLORS.darkBlue;
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all hover:shadow-sm" onClick={onToggle} style={{ backgroundColor: isExpanded ? '#F0F4F8' : '#F8F9FA' }}>
      <div className="flex items-center gap-2.5">
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: katColor }}></div>
        <span className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>{kategori.navn}</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-bold tabular-nums" style={{ color: PENSUM_COLORS.darkBlue, width: '50px', textAlign: 'right' }}>{formatPercent(kategori.vekt)}</span>
        <span className="text-gray-400 text-xs tabular-nums" style={{ width: '90px', textAlign: 'right' }}>{formatCurrency(kategori.belop)}</span>
        <span className="font-medium tabular-nums" style={{ color: PENSUM_COLORS.teal, width: '50px', textAlign: 'right' }}>{formatPercent(kategori.avkastning)}</span>
      </div>
    </div>
  );
}

export function SimpleKategoriRow({ kategori, allokering, effektivtInvestertBelop, updateAllokeringVekt, updateAllokeringAvkastning }) {
  if (!kategori || kategori.items.length !== 1) return null;
  const item = kategori.items[0];
  return <AllokeringRow item={item} index={allokering.findIndex((a) => a.navn === item.navn)} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />;
}
