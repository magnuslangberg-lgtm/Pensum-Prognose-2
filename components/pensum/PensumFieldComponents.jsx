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

export function AllokeringRow({ item, index, isSubItem, effektivtInvestertBelop, updateAllokeringVekt, updateAllokeringAvkastning }) {
  const [dragVekt, setDragVekt] = useState(item.vekt);
  useEffect(() => { setDragVekt(item.vekt); }, [item.vekt]);
  const commitDragVekt = () => updateAllokeringVekt(index, Number(dragVekt) || 0);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 min-w-0" style={{ width: '160px' }}>
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ASSET_COLORS[item.navn] || CATEGORY_COLORS[item.kategori] }}></div>
        <span className="font-medium text-sm truncate" style={{ color: PENSUM_COLORS.darkBlue }}>{item.navn}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <button onClick={() => updateAllokeringVekt(index, Math.max(0, (item.vekt || 0) - 0.5))} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 flex-shrink-0 text-sm">−</button>
        <input
          type="range" min="0" max="100" step="0.5"
          value={dragVekt}
          onChange={(e) => setDragVekt(parseFloat(e.target.value) || 0)}
          onMouseUp={commitDragVekt}
          onTouchEnd={commitDragVekt}
          className="w-36 accent-blue-700 flex-shrink-0"
        />
        <input
          type="number" min="0" max="100" step="0.5"
          value={dragVekt}
          onChange={(e) => setDragVekt(parseFloat(e.target.value) || 0)}
          onBlur={commitDragVekt}
          className="w-20 border border-gray-200 rounded py-1 px-2 text-sm text-right flex-shrink-0"
        />
        <span className="text-sm text-gray-500 flex-shrink-0">%</span>
        <button onClick={() => updateAllokeringVekt(index, (item.vekt || 0) + 0.5)} className="w-6 h-6 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 flex-shrink-0 text-sm">+</button>
      </div>
      <div className="text-xs text-gray-500 text-right flex-shrink-0" style={{ width: '90px' }}>
        {formatCurrency((item.vekt / 100) * effektivtInvestertBelop)}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <input type="number" step="0.5" value={item.avkastning} onChange={(e) => updateAllokeringAvkastning(index, e.target.value)} className="w-16 text-center text-sm border border-gray-200 rounded py-1 px-1" />
        <span className="text-xs text-gray-400">%</span>
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
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors" onClick={onToggle}>
      <div className="flex items-center gap-2">
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[kategori.kategori] }}></div>
        <span className="font-semibold text-sm" style={{ color: PENSUM_COLORS.darkBlue }}>{kategori.navn}</span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <span className="font-semibold" style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(kategori.vekt)}</span>
        <span className="text-gray-500">{formatCurrency(kategori.belop)}</span>
        <span style={{ color: PENSUM_COLORS.darkBlue }}>{formatPercent(kategori.avkastning)}</span>
      </div>
    </div>
  );
}

export function SimpleKategoriRow({ kategori, allokering, effektivtInvestertBelop, updateAllokeringVekt, updateAllokeringAvkastning }) {
  if (!kategori || kategori.items.length !== 1) return null;
  const item = kategori.items[0];
  return <AllokeringRow item={item} index={allokering.findIndex((a) => a.navn === item.navn)} isSubItem={false} effektivtInvestertBelop={effektivtInvestertBelop} updateAllokeringVekt={updateAllokeringVekt} updateAllokeringAvkastning={updateAllokeringAvkastning} />;
}
