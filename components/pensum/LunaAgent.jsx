import React, { useEffect, useMemo, useRef, useState } from 'react';

const TAB_LABELS = {
  input: 'Kundeinformasjon',
  losninger: 'Porteføljebygging',
  formuesplanlegger: 'Formuesplanlegger',
  scenario: 'Fondssammenligning',
  belaning: 'Belåning',
  rapport: 'Investeringsforslag',
};

const FIELD_LABELS = {
  kundeNavn: 'Investor',
  kundeSelskap: 'Selskap',
  risikoprofil: 'Risikoprofil',
  horisont: 'Investeringshorisont',
  radgiver: 'Rådgiver',
  dato: 'Dato',
  investertBelop: 'Investert beløp',
  fjernInvestertBelop: 'Bruk total kapital',
  investeringsFormaal: 'Investeringsformål',
  likviditetsbehov: 'Likviditetsbehov',
  aksjerKunde: 'Aksjer',
  aksjefondKunde: 'Aksjefond',
  renterKunde: 'Renter',
  kontanterKunde: 'Kontanter',
  peFondKunde: 'PE-fond',
  unoterteAksjerKunde: 'Unoterte aksjer',
  shippingKunde: 'Shipping',
  egenEiendomKunde: 'Egen eiendom',
  eiendomSyndikatKunde: 'Eiendomssyndikat',
  eiendomFondKunde: 'Eiendomsfond',
};

const formatValue = (key, value) => {
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nei';
  if (typeof value === 'number') {
    if (key === 'horisont') return `${value} år`;
    return `${new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value)} kr`;
  }
  return String(value);
};

const describeAction = (action) => {
  const payload = action?.payload || {};
  if (action.type === 'set_customer_fields' || action.type === 'set_capital_fields') {
    return Object.entries(payload).map(([key, value]) => `${FIELD_LABELS[key] || key}: ${formatValue(key, value)}`);
  }
  if (action.type === 'recalculate_allocation') return ['Oppdater allokeringen fra risikoprofil og kapital'];
  if (action.type === 'reset_capital_fields') return ['Nullstill alle kapitalbeløp'];
  if (action.type === 'navigate') return [`Gå til ${TAB_LABELS[payload.tab] || payload.tab}`];
  if (action.type === 'open_investment_proposal') return ['Åpne investeringsforslaget'];
  if (action.type === 'save_customer') return ['Lagre aktiv kunde'];
  return [];
};

export default function LunaAgent({ authenticated, context, onApplyActions, onRequestLogin }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hei! Jeg kan fylle ut kundedata, oppdatere beløp, endre risikoprofil og ta deg til riktig del av verktøyet.',
    },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, open]);

  const apiHistory = useMemo(() => messages
    .filter((message) => message.id !== 'welcome')
    .slice(-8)
    .map((message) => ({ role: message.role, content: message.content })), [messages]);

  const sendMessage = async (preset) => {
    const text = String(preset || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMessage = { id: `${Date.now()}-user`, role: 'user', content: text };
    setMessages((previous) => [...previous, userMessage]);

    if (!authenticated) {
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-login`,
        role: 'assistant',
        content: 'Logg inn først, så kan jeg hjelpe deg direkte i verktøyet.',
        loginPrompt: true,
      }]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/luna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: apiHistory,
          context,
          authenticated: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Luna svarte ikke.');
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: data.message,
        actions: Array.isArray(data.actions) ? data.actions : [],
        status: Array.isArray(data.actions) && data.actions.length > 0 ? 'pending' : undefined,
      }]);
    } catch (error) {
      setMessages((previous) => [...previous, {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: error.message || 'Noe gikk galt. Prøv igjen.',
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const applyActions = async (messageId, actions) => {
    setMessages((previous) => previous.map((message) => message.id === messageId ? { ...message, status: 'applying' } : message));
    try {
      await onApplyActions(actions);
      setMessages((previous) => previous.map((message) => message.id === messageId ? { ...message, status: 'applied' } : message));
    } catch (error) {
      setMessages((previous) => previous.map((message) => message.id === messageId ? {
        ...message,
        status: 'pending',
        applyError: error.message || 'Kunne ikke utføre endringene.',
      } : message));
    }
  };

  const cancelActions = (messageId) => {
    setMessages((previous) => previous.map((message) => message.id === messageId ? { ...message, status: 'cancelled' } : message));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] no-print">
      {open && (
        <section
          role="dialog"
          aria-label="Luna-assistent"
          className="absolute bottom-16 right-0 w-[390px] max-w-[calc(100vw-24px)] h-[620px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="px-4 py-3 flex items-center justify-between text-white" style={{ background: 'linear-gradient(135deg, #102A43 0%, #2E5B5E 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.5A8 8 0 019.5 3.5a8.5 8.5 0 1011 11z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">Luna <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /></div>
                <div className="text-[10px] text-white/65">Assistent i Pensum Prognose</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Lukk Luna" className="p-2 rounded-lg hover:bg-white/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ backgroundColor: '#F7F9FB' }}>
            {messages.map((message) => {
              const actionLines = (message.actions || []).flatMap(describeAction);
              return (
                <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={message.role === 'user'
                    ? 'max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white'
                    : 'max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-white border border-slate-200 text-slate-700 shadow-sm'}
                    style={message.role === 'user' ? { backgroundColor: '#173B57' } : undefined}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                    {actionLines.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Foreslåtte handlinger</p>
                        <ul className="space-y-1.5">
                          {actionLines.map((line, index) => (
                            <li key={`${line}-${index}`} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#2E5B5E' }} />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {message.status === 'pending' && (
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => applyActions(message.id, message.actions)} className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90" style={{ backgroundColor: '#2E5B5E' }}>
                          Utfør endringene
                        </button>
                        <button onClick={() => cancelActions(message.id)} className="px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:bg-white">Avbryt</button>
                      </div>
                    )}
                    {message.status === 'applying' && <p className="mt-2 text-xs text-slate-400">Utfører…</p>}
                    {message.status === 'applied' && <p className="mt-2 text-xs font-medium text-emerald-700">✓ Utført</p>}
                    {message.status === 'cancelled' && <p className="mt-2 text-xs text-slate-400">Avbrutt</p>}
                    {message.applyError && <p className="mt-2 text-xs text-red-600">{message.applyError}</p>}
                    {message.loginPrompt && (
                      <button onClick={onRequestLogin} className="mt-3 px-3 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: '#2E5B5E' }}>Logg inn</button>
                    )}
                  </div>
                </div>
              );
            })}

            {messages.length === 1 && authenticated && (
              <div className="flex flex-wrap gap-2">
                {['Hva bør jeg gjøre her?', 'Sett moderat profil og 10 års horisont', 'Gå til porteføljebygging'].map((suggestion) => (
                  <button key={suggestion} onClick={() => sendMessage(suggestion)} className="text-[11px] px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50">
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 shadow-sm">
                  {[0, 1, 2].map((dot) => <span key={dot} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: `${dot * 150}ms` }} />)}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                rows={2}
                maxLength={2000}
                placeholder={authenticated ? 'Be Luna om å fylle ut eller åpne noe…' : 'Logg inn for å bruke Luna'}
                disabled={loading}
                className="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-400 disabled:bg-slate-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                aria-label="Send til Luna"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-35 hover:opacity-90"
                style={{ backgroundColor: '#2E5B5E' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-6-6l6 6-6 6" /></svg>
              </button>
            </div>
            <p className="mt-2 text-[9px] text-slate-400 text-center">Unngå fødselsnummer, kontonummer og passord.</p>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Lukk Luna' : 'Åpne Luna'}
        className="group h-14 pl-3 pr-4 rounded-full shadow-xl text-white flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform border border-white/20"
        style={{ background: 'linear-gradient(135deg, #102A43 0%, #2E5B5E 100%)' }}
      >
        <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.5A8 8 0 019.5 3.5a8.5 8.5 0 1011 11z" /></svg>
        </span>
        <span className="text-sm font-semibold">Luna</span>
      </button>
    </div>
  );
}
