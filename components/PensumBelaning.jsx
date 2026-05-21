import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts';

// Pensum Belåningsverktøy — adaptert fra "Modell-for-Verdipapirbelåning" repo
// (https://github.com/magnuslangberg-lgtm/Modell-for-Verdipapirbel-ning)
const PensumBelaning = ({ defaultPortfolioValue = 10000000 }) => {
  // Porteføljesammensetning
  const [portefoljeMode, setPortefoljeMode] = useState('enkel');
  const [portefoljeVerdi, setPortefoljeVerdi] = useState(defaultPortfolioValue || 10000000);
  const [portefolje, setPortefolje] = useState({
    cash: 0,
    pengemarkedsfond: 0,
    enkeltaksjer: 0,
    hoyrentefond: 0,
    aksjefond: defaultPortfolioValue || 10000000
  });
  // Hold porteføljeverdi i sync med kundeverdi i Enkel-modus
  useEffect(() => {
    if (defaultPortfolioValue && portefoljeMode === 'enkel') {
      setPortefoljeVerdi(defaultPortfolioValue);
    }
  }, [defaultPortfolioValue, portefoljeMode]);
  
  const [enkeltaksjerDiversifisert, setEnkeltaksjerDiversifisert] = useState(true);
  const [aktivaklasse, setAktivaklasse] = useState('aksjefond');
  const [ltv, setLtv] = useState(60);
  
  // Renteinnstillinger
  const [valuta, setValuta] = useState('NOK');
  const [rentepaaslag, setRentepaaslag] = useState(1.0);
  
  const [reinvesteringAvkastning, setReinvesteringAvkastning] = useState(8);
  const [tidshorisont, setTidshorisont] = useState(5);
  const [modus, setModus] = useState('reinvestering'); // 'reinvestering', 'kontantuttak'
  const [visMaksBelaning, setVisMaksBelaning] = useState(false); // Valgfri tilleggsblokk
  const [visDetaljer, setVisDetaljer] = useState(true);
  
  // Investeringsscenario for kontantuttak
  const [visInvesteringsscenario, setVisInvesteringsscenario] = useState(false);
  const [investeringstype, setInvesteringstype] = useState('eiendom'); // 'eiendom', 'pe'
  const [investeringAvkastning, setInvesteringAvkastning] = useState(12); // Forventet avkastning på eiendom/PE

  // Eksisterende verdipapirfinansiering — kundens benyttede beløp av rammen
  // (Total låneramme beregnes automatisk fra EK × maks LTV)
  const [eksisterendeBenyttet, setEksisterendeBenyttet] = useState(0);

  // Aktivaklasser med maks LTV
  const getAktivaklasser = (diversifisert) => ({
    cash: { navn: 'Cash', maksLTV: 100, farge: '#2e7d4a' },
    pengemarkedsfond: { navn: 'Pengemarkedsfond', maksLTV: 90, farge: '#4f8aa9' },
    enkeltaksjer: {
      navn: 'Enkeltaksjer',
      maksLTV: diversifisert ? 50 : 20,
      farge: '#123e6a',
      info: diversifisert ? 'Maks 20% per aksje' : 'Konsentrert posisjon'
    },
    hoyrentefond: { navn: 'Høyrentefond', maksLTV: 80, farge: '#d3826a' },
    aksjefond: { navn: 'Aksjefond', maksLTV: 60, farge: '#0d2841' }
  });

  const aktivaklasser = getAktivaklasser(enkeltaksjerDiversifisert);

  // Baserenter (3M) – lastes fra /rates.json, med fallback-verdier
  const [baserenter, setBaserenter] = useState({
    NOK: { navn: 'NIBOR 3M', rate: 4.00, oppdatert: '03.01.2026' },
    EUR: { navn: 'EURIBOR 3M', rate: 2.25, oppdatert: '03.01.2026' },
    USD: { navn: 'SOFR 3M', rate: 3.60, oppdatert: '02.01.2026' },
    SEK: { navn: 'STIBOR 3M', rate: 2.00, oppdatert: '03.03.2026' }
  });
  const [renteOppdatert, setRenteOppdatert] = useState(null);

  useEffect(() => {
    // Henter direkte fra GitHub – oppdateres uten redeploy
    const RATES_URL =
      'https://raw.githubusercontent.com/magnuslangberg-lgtm/Modell-for-Verdipapirbel-ning/main/public/rates.json';
    fetch(RATES_URL)
      .then(res => res.json())
      .then(data => {
        if (data.rates) setBaserenter(data.rates);
        if (data.updated) setRenteOppdatert(data.updated);
      })
      .catch(() => {}); // Beholder fallback-verdier ved feil
  }, []);

  const valgtValuta = baserenter[valuta];
  const totalRente = valgtValuta.rate + rentepaaslag;

  // Pensum fargepalett – iht. NY Pensum Profilhåndbok 2021
  const colors = {
    primary: '#123e6a',       // BLÅ – primærfarge
    primaryLight: '#4f8aa9',  // MELLOMBLÅ – sekundærfarge
    primaryDark: '#0d2841',   // DYP BLÅSORT – mørkeste blå
    accent: '#d3826a',        // KOBBER – sekundær aksent
    white: '#ffffff',
    lightGray: '#f4f5f7',     // Lys grå bakgrunn
    mediumGray: '#D0D0CE',    // Cool Grey 2
    darkGray: '#B1B3B3',      // Cool Grey 5
    textDark: '#0d2841',      // Dyp blåsort for tekst
    textMuted: '#6b7a8d',
    success: '#2e7d4a',
    warning: '#d3826a',       // Bruker kobber for advarsler
    danger: '#b33a3a'
  };

  // Beregn vektet LTV for porteføljesammensetning
  const portefoljeBeregning = useMemo(() => {
    if (portefoljeMode === 'enkel') {
      const valgtAktiva = aktivaklasser[aktivaklasse];
      const faktiskLTV = Math.min(ltv, valgtAktiva.maksLTV);
      return {
        totalVerdi: portefoljeVerdi,
        vektetMaksLTV: valgtAktiva.maksLTV,
        faktiskLTV,
        maksLanebelop: portefoljeVerdi * (valgtAktiva.maksLTV / 100),
        faktiskLanebelop: portefoljeVerdi * (faktiskLTV / 100),
        fordeling: [{ navn: valgtAktiva.navn, verdi: portefoljeVerdi, andel: 100, maksLTV: valgtAktiva.maksLTV }]
      };
    } else {
      const totalVerdi = Object.values(portefolje).reduce((sum, val) => sum + val, 0);
      
      if (totalVerdi === 0) {
        return { totalVerdi: 0, vektetMaksLTV: 0, faktiskLTV: 0, maksLanebelop: 0, faktiskLanebelop: 0, fordeling: [] };
      }

      let vektetMaksLTV = 0;
      const fordeling = [];
      
      Object.entries(portefolje).forEach(([key, verdi]) => {
        if (verdi > 0) {
          const aktiva = aktivaklasser[key];
          const andel = (verdi / totalVerdi) * 100;
          vektetMaksLTV += (verdi / totalVerdi) * aktiva.maksLTV;
          fordeling.push({ key, navn: aktiva.navn, verdi, andel, maksLTV: aktiva.maksLTV });
        }
      });

      const faktiskLTV = Math.min(ltv, vektetMaksLTV);
      
      return {
        totalVerdi, vektetMaksLTV, faktiskLTV,
        maksLanebelop: totalVerdi * (vektetMaksLTV / 100),
        faktiskLanebelop: totalVerdi * (faktiskLTV / 100),
        fordeling: fordeling.sort((a, b) => b.verdi - a.verdi)
      };
    }
  }, [portefoljeMode, portefolje, portefoljeVerdi, aktivaklasse, ltv, aktivaklasser]);

  // Maks belåning med reinvestering beregninger - forenklet
  const maksBelaningBeregning = useMemo(() => {
    const C = portefoljeBeregning.totalVerdi; // Startpant / Egenkapital
    const valgtAktiva = portefoljeMode === 'enkel' ? aktivaklasser[aktivaklasse] : null;
    const L = portefoljeMode === 'enkel' ? valgtAktiva.maksLTV / 100 : portefoljeBeregning.vektetMaksLTV / 100;
    
    if (L >= 1 || C === 0) {
      return { arligData: [], maksGjeld: 0, totalEksponering: 0, ltv: L * 100, egenkapital: C };
    }
    
    // Teoretisk maks gjeld med reinvestering: D = (L / (1 - L)) * C
    const maksGjeld = (L / (1 - L)) * C;
    const totalEksponering = C + maksGjeld;
    
    const arligData = [];
    
    // År 0: Start - kun egenkapital, ingen gjeld ennå
    arligData.push({
      ar: 0,
      label: 'Start',
      egenkapital: C,
      gjeld: 0,
      totalEksponering: C,
      ltv: 0
    });
    
    // År 1+: Full maks belåning fra år 1, deretter vokser alt med avkastning
    let egenkapital = C;
    
    for (let ar = 1; ar <= Math.max(tidshorisont, 10); ar++) {
      // Total eksponering ved maks LTV = Egenkapital / (1 - LTV)
      const eksponering = egenkapital / (1 - L);
      const gjeld = eksponering - egenkapital;
      const ltvProsent = (gjeld / eksponering) * 100; // Skal alltid være lik L * 100
      
      arligData.push({
        ar,
        label: `År ${ar}`,
        egenkapital: egenkapital,
        gjeld: gjeld,
        totalEksponering: eksponering,
        ltv: ltvProsent
      });
      
      // Neste år: egenkapitalen vokser med avkastning på total eksponering minus rentekostnader
      const avkastning = eksponering * (reinvesteringAvkastning / 100);
      const rentekostnad = gjeld * (totalRente / 100);
      egenkapital = egenkapital + avkastning - rentekostnad;
    }
    
    return {
      arligData,
      maksGjeld,
      totalEksponering,
      ltv: L * 100,
      egenkapital: C
    };
  }, [portefoljeBeregning, aktivaklasse, aktivaklasser, portefoljeMode, totalRente, reinvesteringAvkastning, tidshorisont]);

  const beregninger = useMemo(() => {
    const { totalVerdi, faktiskLTV, faktiskLanebelop } = portefoljeBeregning;
    const initieltLan = faktiskLanebelop;
    const rentekostnadArlig = initieltLan * (totalRente / 100);
    
    if (faktiskLTV === 0 || initieltLan === 0 || totalVerdi === 0) {
      return {
        initieltLan: 0, rentekostnadArlig: 0, totalRentekostnad: 0,
        arligData: [], sluttPortefolje: totalVerdi, effektivLTV: 0, faktiskLTV
      };
    }
    
    if (modus === 'kontantuttak') {
      // KORRIGERT LOGIKK:
      // - Kontantuttak tas ut én gang ved start og er "ute" (brukes til annet)
      // - Pantet (fondet) forblir investert og utvikler seg med avkastning
      // - Rentekostnader trekkes fra panteverdien (belastes kontoen)
      // - Netto panteverdi = Brutto panteverdi - Akkumulert rentekostnad
      
      const kontantUttak = initieltLan; // Dette beløpet tas ut og er "ute"
      const arligData = [];
      
      let bruttoPantVerdi = totalVerdi; // Starter med opprinnelig pant
      let akkumulertRente = 0;
      
      // Start
      arligData.push({
        ar: 0,
        label: 'Start',
        bruttoPantVerdi: totalVerdi,
        avkastning: 0,
        rentekostnad: 0,
        akkumulertRente: 0,
        nettoPantVerdi: totalVerdi,
        kontantUttak: kontantUttak,
        gjeld: initieltLan,
        effektivLTV: (initieltLan / totalVerdi) * 100
      });
      
      for (let ar = 1; ar <= tidshorisont; ar++) {
        // Avkastning på brutto panteverdi
        const avkastning = bruttoPantVerdi * (reinvesteringAvkastning / 100);
        bruttoPantVerdi += avkastning;
        
        // Rentekostnad på lånet (trekkes fra pant/konto)
        const rentekostnad = initieltLan * (totalRente / 100);
        akkumulertRente += rentekostnad;
        
        // Netto panteverdi = Brutto - akkumulerte rentekostnader
        const nettoPantVerdi = bruttoPantVerdi - akkumulertRente;
        
        // Effektiv LTV basert på brutto panteverdi
        const effektivLTV = (initieltLan / bruttoPantVerdi) * 100;
        
        arligData.push({
          ar,
          label: `År ${ar}`,
          bruttoPantVerdi,
          avkastning,
          rentekostnad,
          akkumulertRente,
          nettoPantVerdi,
          kontantUttak, // Forblir konstant - er "ute"
          gjeld: initieltLan, // Lånet forblir konstant (ingen nedbetaling)
          effektivLTV
        });
      }
      
      const sisteAr = arligData[arligData.length - 1];
      const totalAvkastning = sisteAr.bruttoPantVerdi - totalVerdi;
      const totalRentekostnad = sisteAr.akkumulertRente;
      const nettoResultat = totalAvkastning - totalRentekostnad; // Hva du sitter igjen med i pantet etter renter
      
      return {
        initieltLan,
        kontantUttak,
        rentekostnadArlig,
        totalRentekostnad,
        arligData,
        faktiskLTV,
        // Sluttresultater
        sluttBruttoPant: sisteAr.bruttoPantVerdi,
        sluttNettoPant: sisteAr.nettoPantVerdi,
        totalAvkastning,
        nettoResultat,
        sluttEffektivLTV: sisteAr.effektivLTV,
        // Total formue = Netto pant + kontantuttak (som er brukt til annet)
        totalFormue: sisteAr.nettoPantVerdi + kontantUttak
      };
    } else {
      // Reinvestering - uendret logikk
      let totalEksponering = totalVerdi + initieltLan;
      let totalLan = initieltLan;
      
      const arligData = [];
      let forrigePortefolje = totalEksponering;
      let portefoljeUtenLan = totalVerdi;
      let akkumulertRentekostnad = 0;
      
      arligData.push({
        ar: 0, label: 'Start',
        portefoljeVerdi: totalEksponering,
        portefoljeUtenLan: totalVerdi,
        avkastning: 0, rentekostnad: 0, akkumulertRentekostnad: 0,
        nettoGevinst: 0, akkumulertNettoGevinst: 0,
        totalLan, effektivLTV: (totalLan / totalEksponering) * 100
      });
      
      for (let ar = 1; ar <= tidshorisont; ar++) {
        const avkastning = forrigePortefolje * (reinvesteringAvkastning / 100);
        const avkastningUtenLan = portefoljeUtenLan * (reinvesteringAvkastning / 100);
        const rentekostnad = totalLan * (totalRente / 100);
        akkumulertRentekostnad += rentekostnad;
        const nyPortefoljeVerdi = forrigePortefolje + avkastning;
        const nyPortefoljeUtenLan = portefoljeUtenLan + avkastningUtenLan;
        const nettoGevinst = avkastning - rentekostnad;
        const arligEffektivLTV = (totalLan / nyPortefoljeVerdi) * 100;
        
        arligData.push({
          ar, label: `År ${ar}`,
          portefoljeVerdi: nyPortefoljeVerdi,
          portefoljeUtenLan: nyPortefoljeUtenLan,
          avkastning, rentekostnad, akkumulertRentekostnad,
          nettoGevinst,
          akkumulertNettoGevinst: arligData[arligData.length - 1].akkumulertNettoGevinst + nettoGevinst,
          totalLan, effektivLTV: arligEffektivLTV
        });
        
        forrigePortefolje = nyPortefoljeVerdi;
        portefoljeUtenLan = nyPortefoljeUtenLan;
      }
      
      const sisteAr = arligData[arligData.length - 1];
      const totalAvkastning = sisteAr.portefoljeVerdi - totalEksponering;
      const totalRentekostnad = akkumulertRentekostnad;
      const nettoGevinst = totalAvkastning - totalRentekostnad;
      const avkastningUtenLan = sisteAr.portefoljeUtenLan - totalVerdi;
      const merverdi = nettoGevinst - avkastningUtenLan;
      
      return {
        initieltLan, totalEksponering, totalAvkastning, totalRentekostnad,
        nettoGevinst, avkastningUtenLan, merverdi, arligData,
        sluttPortefolje: sisteAr.portefoljeVerdi,
        effektivLTV: sisteAr.effektivLTV, faktiskLTV, rentekostnadArlig
      };
    }
  }, [portefoljeBeregning, totalRente, reinvesteringAvkastning, tidshorisont, modus]);

  const formatNOK = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0 kr';
    return new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  const formatNOKShort = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toFixed(0);
  };

  const formatProsent = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0,0%';
    return `${value.toFixed(1)}%`;
  };

  const updatePortefolje = (key, value) => {
    setPortefolje(prev => ({ ...prev, [key]: Math.max(0, Number(value) || 0) }));
  };

  const ltvOverMaks = ltv > portefoljeBeregning.vektetMaksLTV;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: colors.white, border: `1px solid ${colors.mediumGray}`, borderRadius: '8px', padding: '12px 16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: colors.primary }}>{label}</div>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '12px', marginBottom: '3px' }}>
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span style={{ fontWeight: '500' }}>{formatNOK(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PensumLogo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* Pensum P-ikon – åpen bolle, stroket iht. profilhåndbok */}
      <svg width="44" height="48" viewBox="0 0 100 110" fill="none">
        <path
          d="M20,100 L20,8 L38,8 C78,8 78,58 36,58"
          fill="none"
          stroke="#4f8aa9"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* Tynn vertikal linje */}
      <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.3)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
        <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '4px', fontFamily: "'Open Sans', sans-serif", lineHeight: 1 }}>PENSUM</div>
        <div style={{ fontSize: '9px', letterSpacing: '2px', opacity: 0.7, fontFamily: "'Open Sans', sans-serif", fontWeight: '400', lineHeight: 1 }}>ASSET MANAGEMENT</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: colors.lightGray, fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: colors.textDark }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input[type="range"] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: ${colors.mediumGray}; outline: none; margin: 14px 0; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: ${colors.primary}; cursor: pointer; border: 3px solid ${colors.white}; box-shadow: 0 2px 6px rgba(18, 62, 106, 0.3); }
        input[type="number"] { background: ${colors.white}; border: 1px solid ${colors.mediumGray}; border-radius: 6px; padding: 10px 12px; color: ${colors.textDark}; font-family: 'Open Sans', sans-serif; font-size: 14px; width: 100%; }
        input[type="number"]:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px rgba(18, 62, 106, 0.1); }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .pensum-card { background: ${colors.white}; border-radius: 8px; padding: 24px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); border: 1px solid rgba(0, 0, 0, 0.04); }
        .pensum-header { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); color: ${colors.white}; padding: 20px 40px; margin-bottom: 24px; }
        .result-box { background: ${colors.lightGray}; border-radius: 6px; padding: 14px 16px; border-left: 4px solid ${colors.primary}; }
        .result-box.highlight { border-left-color: ${colors.accent}; background: linear-gradient(135deg, rgba(211, 130, 106, 0.08) 0%, rgba(211, 130, 106, 0.02) 100%); }
        .result-box.danger { border-left-color: ${colors.danger}; background: linear-gradient(135deg, rgba(179, 58, 58, 0.08) 0%, rgba(179, 58, 58, 0.02) 100%); }
        .result-box.success { border-left-color: ${colors.success}; background: linear-gradient(135deg, rgba(46, 125, 74, 0.08) 0%, rgba(46, 125, 74, 0.02) 100%); }
        .btn-modus { padding: 10px 18px; border: 2px solid ${colors.primary}; border-radius: 6px; font-family: 'Open Sans', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; cursor: pointer; transition: all 0.2s ease; }
        .btn-modus.active { background: ${colors.primary}; color: ${colors.white}; }
        .btn-modus.inactive { background: ${colors.white}; color: ${colors.primary}; }
        .btn-modus.inactive:hover { background: ${colors.lightGray}; }
        .valuta-btn { padding: 10px 12px; border: 2px solid ${colors.mediumGray}; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; background: ${colors.white}; display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
        .valuta-btn:hover { border-color: ${colors.primary}; }
        .valuta-btn.selected { border-color: ${colors.primary}; background: rgba(18, 62, 106, 0.05); }
        .data-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
        .data-table th { background: ${colors.primary}; color: ${colors.white}; padding: 10px 10px; text-align: right; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; }
        .data-table th:first-child { text-align: left; border-radius: 6px 0 0 0; }
        .data-table th:last-child { border-radius: 0 6px 0 0; }
        .data-table td { padding: 9px 10px; text-align: right; border-bottom: 1px solid ${colors.mediumGray}; }
        .data-table td:first-child { text-align: left; font-weight: 500; }
        .data-table tr:hover td { background: ${colors.lightGray}; }
        .positive { color: ${colors.success}; font-weight: 600; }
        .negative { color: ${colors.danger}; font-weight: 600; }
        .section-title { font-family: 'Open Sans', sans-serif; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${colors.primary}; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid ${colors.mediumGray}; }
        .label-text { font-size: 12px; color: ${colors.textMuted}; font-weight: 500; }
        .value-text { font-size: 12px; font-weight: 700; color: ${colors.primary}; }
        .portfolio-input { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid ${colors.mediumGray}; }
        .portfolio-input:last-child { border-bottom: none; }
        .portfolio-bar { height: 6px; border-radius: 3px; background: ${colors.mediumGray}; flex: 1; overflow: hidden; }
        .portfolio-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
        .toggle-switch { position: relative; width: 40px; height: 22px; background: ${colors.mediumGray}; border-radius: 11px; cursor: pointer; transition: background 0.3s ease; }
        .toggle-switch.active { background: ${colors.success}; }
        .toggle-switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.3s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .toggle-switch.active::after { transform: translateX(18px); }
        .warning-box { background: rgba(211,130,106,0.07); border: 1px solid ${colors.accent}; border-radius: 6px; padding: 12px 16px; margin-top: 14px; }
        .danger-box { background: #fdf2f2; border: 1px solid ${colors.danger}; border-radius: 6px; padding: 12px 16px; margin-top: 14px; }
        .info-box { background: rgba(79,138,169,0.08); border: 1px solid ${colors.primaryLight}; border-radius: 6px; padding: 12px 16px; margin-top: 14px; }
      `}</style>
      
      {/* Tab-overskrift */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`, color: colors.white, padding: '20px 40px', marginBottom: '24px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, fontFamily: "'Open Sans', sans-serif", letterSpacing: '0.5px' }}>
              Belåningsverktøy
            </h1>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>Beregn opplåning, reinvestering og kontantuttak — startverdi hentet fra kundens portefølje</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.85 }}>
            <div>Pensum Asset Management</div>
            <div style={{ opacity: 0.7 }}>Verdipapirfinansiering</div>
          </div>
        </div>
      </div>

      <div>
        {/* Modus-velger */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className={`btn-modus ${modus === 'reinvestering' ? 'active' : 'inactive'}`} onClick={() => setModus('reinvestering')}>
              📈 Reinvestering
            </button>
            <button className={`btn-modus ${modus === 'kontantuttak' ? 'active' : 'inactive'}`} onClick={() => setModus('kontantuttak')}>
              💵 Kontantuttak
            </button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: colors.textDark, padding: '6px 10px', background: visMaksBelaning ? colors.lightGray : 'transparent', borderRadius: '5px', border: `1px solid ${visMaksBelaning ? colors.accent : colors.mediumGray}` }}>
            <input type="checkbox" checked={visMaksBelaning} onChange={(e) => setVisMaksBelaning(e.target.checked)} style={{ width: '14px', height: '14px', cursor: 'pointer' }} />
            <span style={{ fontWeight: 500 }}>🚀 Vis maks belåning</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 400px) 1fr', gap: '20px', alignItems: 'start' }}>
          {/* Inndata-panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Porteføljesammensetning */}
            <div className="pensum-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 className="section-title" style={{ margin: 0, padding: 0, border: 'none' }}>Egenkapital (EK)</h2>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['enkel', 'sammensetning'].map(mode => (
                    <button key={mode} onClick={() => setPortefoljeMode(mode)}
                      style={{
                        padding: '5px 10px', fontSize: '10px',
                        border: `1px solid ${portefoljeMode === mode ? colors.primary : '#d0d7e0'}`,
                        background: portefoljeMode === mode ? colors.primary : colors.white,
                        color: portefoljeMode === mode ? colors.white : colors.textMuted,
                        borderRadius: '4px', cursor: 'pointer', fontWeight: '500'
                      }}
                    >
                      {mode === 'enkel' ? 'Enkel' : 'Sammensatt'}
                    </button>
                  ))}
                </div>
              </div>

              {portefoljeMode === 'enkel' ? (
                <>
                  <div style={{ marginBottom: '14px', padding: '8px 10px', background: colors.lightGray, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '500' }}>Enkeltaksjer diversifisert?</div>
                      <div style={{ fontSize: '9px', color: colors.textMuted }}>{enkeltaksjerDiversifisert ? '50% LTV' : '20% LTV'}</div>
                    </div>
                    <div className={`toggle-switch ${enkeltaksjerDiversifisert ? 'active' : ''}`} onClick={() => setEnkeltaksjerDiversifisert(!enkeltaksjerDiversifisert)} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label className="label-text" style={{ display: 'block', marginBottom: '6px' }}>Aktivaklasse</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                      {Object.entries(aktivaklasser).map(([key, value]) => (
                        <button key={key} onClick={() => setAktivaklasse(key)}
                          style={{
                            padding: '6px 4px', border: `2px solid ${aktivaklasse === key ? value.farge : '#d0d7e0'}`,
                            borderRadius: '5px', background: aktivaklasse === key ? `${value.farge}10` : colors.white,
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px'
                          }}
                        >
                          <span style={{ fontSize: '10px', fontWeight: '500' }}>{value.navn}</span>
                          <span style={{ fontSize: '9px', color: colors.textMuted }}>{value.maksLTV}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="label-text">Egenkapital</span>
                      <span className="value-text">{formatNOK(portefoljeVerdi)}</span>
                    </label>
                    <input type="number" value={portefoljeVerdi} onChange={(e) => setPortefoljeVerdi(Number(e.target.value) || 0)} step={100000} min={0} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '10px', padding: '8px 10px', background: `${colors.primaryLight}10`, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${colors.primaryLight}30` }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: '500' }}>Enkeltaksjer diversifisert?</div>
                      <div style={{ fontSize: '9px', color: colors.textMuted }}>{enkeltaksjerDiversifisert ? '50%' : '20%'} LTV</div>
                    </div>
                    <div className={`toggle-switch ${enkeltaksjerDiversifisert ? 'active' : ''}`} onClick={() => setEnkeltaksjerDiversifisert(!enkeltaksjerDiversifisert)} />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    {Object.entries(aktivaklasser).map(([key, value]) => {
                      const verdi = portefolje[key];
                      const andel = portefoljeBeregning.totalVerdi > 0 ? (verdi / portefoljeBeregning.totalVerdi) * 100 : 0;
                      return (
                        <div key={key} className="portfolio-input">
                          <div style={{ width: '90px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '500' }}>{value.navn}</div>
                            <div style={{ fontSize: '9px', color: colors.textMuted }}>{value.maksLTV}%</div>
                          </div>
                          <input type="number" value={verdi || ''} onChange={(e) => updatePortefolje(key, e.target.value)} placeholder="0" style={{ width: '100px', fontSize: '12px', padding: '8px 10px' }} step={100000} />
                          <div className="portfolio-bar">
                            <div className="portfolio-bar-fill" style={{ width: `${andel}%`, background: value.farge }} />
                          </div>
                          <div style={{ width: '35px', textAlign: 'right', fontSize: '10px', color: colors.textMuted }}>{andel.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ background: colors.lightGray, padding: '10px 12px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>Total egenkapital</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: colors.primary }}>{formatNOK(portefoljeBeregning.totalVerdi)}</span>
                  </div>
                  
                  <div style={{ marginTop: '10px', padding: '10px 12px', background: `${colors.accent}10`, borderRadius: '5px', border: `1px solid ${colors.accent}40` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: colors.textMuted }}>Vektet maks LTV</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: colors.accent }}>{formatProsent(portefoljeBeregning.vektetMaksLTV)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Lånerente */}
            <div className="pensum-card">
              <h2 className="section-title">Lånerente</h2>
              
              <div style={{ marginBottom: '14px' }}>
                <label className="label-text" style={{ display: 'block', marginBottom: '6px' }}>Valuta / Baserente</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {Object.entries(baserenter).map(([key, value]) => (
                    <button key={key} className={`valuta-btn ${valuta === key ? 'selected' : ''}`} onClick={() => setValuta(key)}>
                      <span style={{ fontSize: '12px' }}>{key}</span>
                      <span style={{ fontSize: '9px', color: colors.textMuted }}>{value.rate.toFixed(2)}%</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span className="label-text">Rentepåslag</span>
                  <span className="value-text">+{rentepaaslag.toFixed(2)}%</span>
                </label>
                <input type="range" min="0" max="3" step="0.05" value={rentepaaslag} onChange={(e) => setRentepaaslag(Number(e.target.value))} />
              </div>
              
              <div style={{ background: colors.lightGray, padding: '12px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>Total lånerente</div>
                  <div style={{ fontSize: '9px', color: colors.textMuted }}>{valgtValuta.rate.toFixed(2)}% + {rentepaaslag.toFixed(2)}%</div>
                </div>
                <span style={{ fontSize: '18px', fontWeight: '700', color: colors.danger }}>{totalRente.toFixed(2)}%</span>
              </div>
              {renteOppdatert && (
                <div style={{ marginTop: '6px', fontSize: '9px', color: colors.textMuted, textAlign: 'right' }}>
                  Renter sist oppdatert: {renteOppdatert}
                </div>
              )}
            </div>

            {/* Parametere */}
            <div className="pensum-card">
              <h2 className="section-title">Parametere</h2>
              
              {true && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span className="label-text">Belåningsgrad (LTV)</span>
                    <span className="value-text" style={{ color: ltvOverMaks ? colors.danger : colors.primary }}>
                      {ltv}%{ltvOverMaks && <span style={{ fontWeight: '400', fontSize: '10px' }}> → {portefoljeBeregning.vektetMaksLTV.toFixed(0)}%</span>}
                    </span>
                  </label>
                  <input type="range" min="0" max="100" value={ltv} onChange={(e) => setLtv(Number(e.target.value))} />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span className="label-text">Forventet avkastning (p.a.)</span>
                  <span className="value-text" style={{ color: colors.success }}>{reinvesteringAvkastning}%</span>
                </label>
                <input type="range" min="0" max="20" step="0.5" value={reinvesteringAvkastning} onChange={(e) => setReinvesteringAvkastning(Number(e.target.value))} />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span className="label-text">Tidshorisont</span>
                  <span className="value-text">{tidshorisont} år</span>
                </label>
                <input type="range" min="1" max="20" value={tidshorisont} onChange={(e) => setTidshorisont(Number(e.target.value))} />
              </div>
            </div>

            {/* Eksisterende verdipapirfinansiering */}
            <div className="pensum-card">
              <h2 className="section-title">Eksisterende låneramme</h2>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '12px', lineHeight: 1.5 }}>
                Lånerammen beregnes fra egenkapitalen × maks LTV for valgt aktivaklasse. Fyll inn hvor mye kunden allerede har trukket opp for å se tilgjengelig kapasitet.
              </div>

              <div style={{ marginBottom: '12px', padding: '10px 12px', background: colors.lightGray, borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                  <span className="label-text">Total låneramme</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: colors.primary }}>{formatNOK(portefoljeBeregning.maksLanebelop)}</span>
                </div>
                <div style={{ fontSize: '10px', color: colors.textMuted }}>
                  {formatNOK(portefoljeBeregning.totalVerdi)} × {formatProsent(portefoljeBeregning.vektetMaksLTV)} maks LTV
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="label-text">Benyttet av rammen</span>
                  <span className="value-text" style={{ color: colors.accent }}>{formatNOK(eksisterendeBenyttet)}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  value={eksisterendeBenyttet || ''}
                  placeholder="0"
                  onChange={(e) => setEksisterendeBenyttet(Math.max(0, parseFloat(e.target.value) || 0))}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: `1px solid ${colors.mediumGray}`, borderRadius: '4px', textAlign: 'right' }}
                />
              </div>

              {(() => {
                const ramme = portefoljeBeregning.maksLanebelop;
                const benyttetCapped = Math.min(eksisterendeBenyttet, ramme);
                const tilgjengelig = Math.max(0, ramme - eksisterendeBenyttet);
                const utnyttetPct = ramme > 0 ? (eksisterendeBenyttet / ramme) * 100 : 0;
                const overTrukket = eksisterendeBenyttet > ramme;
                const utnyttetFarge = overTrukket ? colors.danger : utnyttetPct > 90 ? colors.danger : utnyttetPct > 70 ? colors.accent : colors.success;
                return (
                  <div style={{ background: colors.lightGray, borderRadius: '6px', padding: '12px', borderLeft: `4px solid ${utnyttetFarge}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: colors.textMuted, textTransform: 'uppercase', fontWeight: 600 }}>Tilgjengelig å låne</span>
                      <span style={{ fontSize: '10px', color: utnyttetFarge, fontWeight: 600 }}>{ramme > 0 ? formatProsent(utnyttetPct) + ' utnyttet' : '—'}</span>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: utnyttetFarge }}>{formatNOK(tilgjengelig)}</div>
                    {ramme > 0 && (
                      <div style={{ width: '100%', height: '5px', background: colors.mediumGray, borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.min(100, utnyttetPct) + '%', background: utnyttetFarge, transition: 'width 0.2s' }} />
                      </div>
                    )}
                    {overTrukket && (
                      <div style={{ marginTop: '6px', fontSize: '10px', color: colors.danger, fontWeight: 600 }}>
                        ⚠ Benyttet overstiger rammen med {formatNOK(eksisterendeBenyttet - ramme)}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Resultater */}
          <div>
            {/* REINVESTERING */}
            {modus === 'reinvestering' && (
              <div className="pensum-card" style={{ marginBottom: '16px' }}>
                <h2 className="section-title">📈 Reinvesteringsanalyse</h2>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px', padding: '8px 12px', background: colors.lightGray, borderRadius: '5px' }}>
                  Låner {formatProsent(beregninger.faktiskLTV)} av pantet ({formatNOK(beregninger.initieltLan)}) og reinvesterer i samme aktiva. Simulering over {tidshorisont} år.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  <div className="result-box">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Lånebeløp</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{formatNOK(beregninger.initieltLan)}</div>
                  </div>
                  <div className="result-box highlight">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Total eksponering</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.accent }}>{formatNOK(beregninger.totalEksponering)}</div>
                  </div>
                  <div className="result-box danger">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Rentekostnad ({tidshorisont} år)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.danger }}>{formatNOK(beregninger.totalRentekostnad)}</div>
                  </div>
                  <div className="result-box success">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Portefølje år {tidshorisont}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.success }}>{formatNOK(beregninger.sluttPortefolje)}</div>
                  </div>
                </div>

                {beregninger.initieltLan > 0 && (
                  <div style={{ background: colors.lightGray, borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '10px', color: colors.textMuted, textTransform: 'uppercase' }}>Nettoresultat over {tidshorisont} år</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Uten belåning</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.textMuted }}>{formatNOK(beregninger.avkastningUtenLan)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Med belåning (netto)</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>{formatNOK(beregninger.nettoGevinst)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Merverdi</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: beregninger.merverdi > 0 ? colors.success : colors.danger }}>
                          {beregninger.merverdi > 0 ? '+' : ''}{formatNOK(beregninger.merverdi)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graf */}
                {beregninger.arligData.length > 0 && (
                  <div style={{ height: '240px', marginBottom: '14px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={beregninger.arligData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.primary} stopOpacity={0.15}/>
                            <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.mediumGray} />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: colors.textMuted }} />
                        <YAxis tickFormatter={formatNOKShort} tick={{ fontSize: 9, fill: colors.textMuted }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="portefoljeVerdi" name="Med belåning" stroke={colors.primary} strokeWidth={2} fill="url(#colorPort)" />
                        <Line type="monotone" dataKey="portefoljeUtenLan" name="Uten belåning" stroke={colors.textMuted} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        <Line type="monotone" dataKey="totalLan" name="Lån" stroke={colors.danger} strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Tabell toggle */}
                <button onClick={() => setVisDetaljer(!visDetaljer)} style={{ background: 'none', border: `1px solid ${colors.primary}`, borderRadius: '4px', padding: '6px 12px', color: colors.primary, cursor: 'pointer', fontSize: '10px', fontWeight: '600', marginBottom: visDetaljer ? '10px' : 0 }}>
                  {visDetaljer ? '▼ Skjul tabell' : '▶ Vis tabell'}
                </button>

                {visDetaljer && beregninger.arligData.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>År</th><th>Portefølje</th><th>Avkastning</th><th>Rentekost.</th><th>Akk. rente</th><th>Netto</th><th>LTV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beregninger.arligData.filter(d => d.ar > 0).map(d => (
                          <tr key={d.ar}>
                            <td>{d.label}</td>
                            <td>{formatNOK(d.portefoljeVerdi)}</td>
                            <td className="positive">+{formatNOK(d.avkastning)}</td>
                            <td className="negative">−{formatNOK(d.rentekostnad)}</td>
                            <td className="negative">−{formatNOK(d.akkumulertRentekostnad)}</td>
                            <td className={d.nettoGevinst >= 0 ? 'positive' : 'negative'}>{d.nettoGevinst >= 0 ? '+' : ''}{formatNOK(d.nettoGevinst)}</td>
                            <td>{formatProsent(d.effektivLTV)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* KONTANTUTTAK */}
            {modus === 'kontantuttak' && (
              <div className="pensum-card" style={{ marginBottom: '16px' }}>
                <h2 className="section-title">💵 Kontantuttaksanalyse</h2>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px', padding: '8px 12px', background: colors.lightGray, borderRadius: '5px' }}>
                  Tar ut {formatNOK(beregninger.kontantUttak)} kontant (brukes til annet). Pantet på {formatNOK(portefoljeBeregning.totalVerdi)} forblir investert. 
                  Rentekostnader trekkes fra pantekontoen. Simulering over {tidshorisont} år.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  <div className="result-box highlight">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Kontantuttak</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.accent }}>{formatNOK(beregninger.kontantUttak)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>Tatt ut ved start</div>
                  </div>
                  <div className="result-box success">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Brutto pant år {tidshorisont}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.success }}>{formatNOK(beregninger.sluttBruttoPant)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>+{formatNOK(beregninger.totalAvkastning)} avkastning</div>
                  </div>
                  <div className="result-box danger">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Rentekostnad ({tidshorisont} år)</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.danger }}>{formatNOK(beregninger.totalRentekostnad)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>{formatNOK(beregninger.rentekostnadArlig)}/år</div>
                  </div>
                  <div className="result-box">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Netto pant år {tidshorisont}</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{formatNOK(beregninger.sluttNettoPant)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>Etter rentekostnader</div>
                  </div>
                </div>

                {beregninger.initieltLan > 0 && (
                  <div style={{ background: colors.lightGray, borderRadius: '6px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '10px', color: colors.textMuted, textTransform: 'uppercase' }}>Oppsummering etter {tidshorisont} år</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Kontant (ute)</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: colors.accent }}>{formatNOK(beregninger.kontantUttak)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Avkastning pant</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: colors.success }}>+{formatNOK(beregninger.totalAvkastning)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Rentekostnader</div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: colors.danger }}>−{formatNOK(beregninger.totalRentekostnad)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', color: colors.textMuted }}>Netto gevinst pant</div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: beregninger.nettoResultat > 0 ? colors.success : colors.danger }}>
                          {beregninger.nettoResultat > 0 ? '+' : ''}{formatNOK(beregninger.nettoResultat)}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: `1px dashed ${colors.mediumGray}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600' }}>Total formue (netto pant + kontant)</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: colors.primary }}>{formatNOK(beregninger.totalFormue)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Graf */}
                {beregninger.arligData.length > 0 && (
                  <div style={{ height: '240px', marginBottom: '14px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={beregninger.arligData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPant" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={colors.success} stopOpacity={0.15}/>
                            <stop offset="95%" stopColor={colors.success} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.mediumGray} />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: colors.textMuted }} />
                        <YAxis tickFormatter={formatNOKShort} tick={{ fontSize: 9, fill: colors.textMuted }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area type="monotone" dataKey="bruttoPantVerdi" name="Brutto pant" stroke={colors.success} strokeWidth={2} fill="url(#colorPant)" />
                        <Line type="monotone" dataKey="nettoPantVerdi" name="Netto pant" stroke={colors.primary} strokeWidth={2} dot={false} />
                        <Bar dataKey="akkumulertRente" name="Akk. rentekost." fill={colors.danger} opacity={0.5} radius={[2, 2, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <button onClick={() => setVisDetaljer(!visDetaljer)} style={{ background: 'none', border: `1px solid ${colors.primary}`, borderRadius: '4px', padding: '6px 12px', color: colors.primary, cursor: 'pointer', fontSize: '10px', fontWeight: '600', marginBottom: visDetaljer ? '10px' : 0 }}>
                  {visDetaljer ? '▼ Skjul tabell' : '▶ Vis tabell'}
                </button>

                {visDetaljer && beregninger.arligData.length > 0 && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>År</th><th>Brutto pant</th><th>Avkastning</th><th>Rentekost.</th><th>Akk. rente</th><th>Netto pant</th><th>Eff. LTV</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beregninger.arligData.filter(d => d.ar > 0).map(d => (
                          <tr key={d.ar}>
                            <td>{d.label}</td>
                            <td>{formatNOK(d.bruttoPantVerdi)}</td>
                            <td className="positive">+{formatNOK(d.avkastning)}</td>
                            <td className="negative">−{formatNOK(d.rentekostnad)}</td>
                            <td className="negative">−{formatNOK(d.akkumulertRente)}</td>
                            <td style={{ fontWeight: '500' }}>{formatNOK(d.nettoPantVerdi)}</td>
                            <td>{formatProsent(d.effektivLTV)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Investeringsscenario */}
                {beregninger.initieltLan > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <button 
                      onClick={() => setVisInvesteringsscenario(!visInvesteringsscenario)}
                      style={{
                        width: '100%', padding: '12px 16px', 
                        background: visInvesteringsscenario ? `${colors.accent}15` : colors.lightGray,
                        border: `2px solid ${visInvesteringsscenario ? colors.accent : colors.mediumGray}`,
                        borderRadius: '8px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontFamily: 'Open Sans', fontSize: '13px', fontWeight: '600', color: colors.primary
                      }}
                    >
                      <span>🏠 Investeringsscenario: Hva om kontantuttaket investeres?</span>
                      <span style={{ fontSize: '18px' }}>{visInvesteringsscenario ? '−' : '+'}</span>
                    </button>
                    
                    {visInvesteringsscenario && (() => {
                      // Beregn investeringsscenario
                      const kontant = beregninger.kontantUttak;
                      const invAvk = investeringAvkastning / 100;
                      const sluttVerdiInvestering = kontant * Math.pow(1 + invAvk, tidshorisont);
                      const avkastningInvestering = sluttVerdiInvestering - kontant;
                      
                      // Total formue med investering
                      const totalFormueMedInvestering = beregninger.sluttNettoPant + sluttVerdiInvestering;
                      const totalFormueUtenInvestering = beregninger.totalFormue; // netto pant + kontant (ubrukt)
                      const merverdiInvestering = totalFormueMedInvestering - totalFormueUtenInvestering;
                      
                      // Årlig data for investering
                      const investeringData = [];
                      let invVerdi = kontant;
                      for (let ar = 0; ar <= tidshorisont; ar++) {
                        investeringData.push({
                          ar,
                          label: ar === 0 ? 'Start' : `År ${ar}`,
                          investering: invVerdi,
                          pant: beregninger.arligData[ar]?.nettoPantVerdi || 0,
                          totalFormue: invVerdi + (beregninger.arligData[ar]?.nettoPantVerdi || 0)
                        });
                        if (ar < tidshorisont) {
                          invVerdi = invVerdi * (1 + invAvk);
                        }
                      }
                      
                      return (
                        <div style={{ marginTop: '12px', padding: '16px', background: `${colors.accent}08`, borderRadius: '8px', border: `1px solid ${colors.accent}30` }}>
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: colors.primary, marginBottom: '10px' }}>
                              Velg investeringstype og forventet avkastning
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <button
                                onClick={() => { setInvesteringstype('eiendom'); setInvesteringAvkastning(12); }}
                                style={{
                                  flex: 1, padding: '10px', border: `2px solid ${investeringstype === 'eiendom' ? colors.accent : colors.mediumGray}`,
                                  borderRadius: '6px', background: investeringstype === 'eiendom' ? `${colors.accent}15` : colors.white,
                                  cursor: 'pointer', textAlign: 'center'
                                }}
                              >
                                <div style={{ fontSize: '16px', marginBottom: '2px' }}>🏠</div>
                                <div style={{ fontSize: '11px', fontWeight: '600' }}>Eiendom</div>
                                <div style={{ fontSize: '9px', color: colors.textMuted }}>Typisk 8-15% p.a.</div>
                              </button>
                              <button
                                onClick={() => { setInvesteringstype('pe'); setInvesteringAvkastning(15); }}
                                style={{
                                  flex: 1, padding: '10px', border: `2px solid ${investeringstype === 'pe' ? colors.accent : colors.mediumGray}`,
                                  borderRadius: '6px', background: investeringstype === 'pe' ? `${colors.accent}15` : colors.white,
                                  cursor: 'pointer', textAlign: 'center'
                                }}
                              >
                                <div style={{ fontSize: '16px', marginBottom: '2px' }}>📈</div>
                                <div style={{ fontSize: '11px', fontWeight: '600' }}>Private Equity</div>
                                <div style={{ fontSize: '9px', color: colors.textMuted }}>Typisk 12-20% p.a.</div>
                              </button>
                            </div>
                            
                            <div>
                              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', color: colors.textMuted }}>Forventet avkastning {investeringstype === 'eiendom' ? 'eiendom' : 'PE'}</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: colors.accent }}>{investeringAvkastning}%</span>
                              </label>
                              <input 
                                type="range" min="5" max="25" step="0.5" 
                                value={investeringAvkastning} 
                                onChange={(e) => setInvesteringAvkastning(Number(e.target.value))}
                                style={{ width: '100%' }}
                              />
                            </div>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ background: colors.white, padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '2px' }}>INVESTERT BELØP</div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: colors.primary }}>{formatNOK(kontant)}</div>
                            </div>
                            <div style={{ background: colors.white, padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '2px' }}>VERDI ETTER {tidshorisont} ÅR</div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: colors.success }}>{formatNOK(sluttVerdiInvestering)}</div>
                            </div>
                            <div style={{ background: colors.white, padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '2px' }}>AVKASTNING</div>
                              <div style={{ fontSize: '15px', fontWeight: '700', color: colors.success }}>+{formatNOK(avkastningInvestering)}</div>
                            </div>
                          </div>
                          
                          <div style={{ background: colors.white, padding: '14px', borderRadius: '6px', marginBottom: '14px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: colors.textMuted, marginBottom: '10px' }}>TOTAL FORMUE ETTER {tidshorisont} ÅR</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <div>
                                <div style={{ fontSize: '10px', color: colors.textMuted }}>Netto pant (fond)</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>{formatNOK(beregninger.sluttNettoPant)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '10px', color: colors.textMuted }}>{investeringstype === 'eiendom' ? 'Eiendomsverdi' : 'PE-verdi'}</div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.accent }}>{formatNOK(sluttVerdiInvestering)}</div>
                              </div>
                            </div>
                            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: `2px solid ${colors.accent}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700' }}>Total formue</span>
                                <span style={{ fontSize: '20px', fontWeight: '700', color: colors.accent }}>{formatNOK(totalFormueMedInvestering)}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                <span style={{ fontSize: '10px', color: colors.textMuted }}>vs. kontant ubrukt ({formatNOK(totalFormueUtenInvestering)})</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: merverdiInvestering > 0 ? colors.success : colors.danger }}>
                                  {merverdiInvestering > 0 ? '+' : ''}{formatNOK(merverdiInvestering)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Mini-tabell */}
                          <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ fontSize: '10px' }}>
                              <thead>
                                <tr>
                                  <th>År</th>
                                  <th>Netto pant</th>
                                  <th>{investeringstype === 'eiendom' ? 'Eiendom' : 'PE'}</th>
                                  <th>Total formue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {investeringData.map(d => (
                                  <tr key={d.ar}>
                                    <td>{d.label}</td>
                                    <td>{formatNOK(d.pant)}</td>
                                    <td style={{ color: colors.accent }}>{formatNOK(d.investering)}</td>
                                    <td style={{ fontWeight: '600' }}>{formatNOK(d.totalFormue)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          
                          <div style={{ marginTop: '12px', padding: '10px', background: '#fef9e7', borderRadius: '6px', fontSize: '10px', color: colors.textMuted }}>
                            <strong>⚠️ Merk:</strong> {investeringstype === 'eiendom' 
                              ? 'Eiendomsavkastning inkluderer typisk leieinntekter og verdistigning. Tallene tar ikke hensyn til vedlikehold, skatt, eller illikviditet.' 
                              : 'PE-avkastning er ofte J-kurve-formet (negativ først, positiv senere). Tallene er forenklede og tar ikke hensyn til kapitalkall, distribusjoner, eller illikviditet.'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* MAKS BELÅNING MED REINVESTERING */}
            {visMaksBelaning && (
              <div className="pensum-card" style={{ marginBottom: '16px' }}>
                <h2 className="section-title">🚀 Maks belåning med reinvestering</h2>
                <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '14px', padding: '10px 14px', background: colors.lightGray, borderRadius: '5px', lineHeight: '1.5' }}>
                  <strong>Konsept:</strong> Du låner maks LTV, kjøper samme type aktiva, legger det nye kjøpet inn i pant, og kan dermed låne enda mer. 
                  Dette gjentas til gjeld og pant balanserer seg ved maks LTV.<br/><br/>
                  <strong>Formel:</strong> Maks gjeld = (LTV / (1−LTV)) × Egenkapital<br/>
                  <strong>Eksempel:</strong> Ved {formatProsent(maksBelaningBeregning.ltv)} LTV og {formatNOK(portefoljeBeregning.totalVerdi)} egenkapital → Maks gjeld = {formatNOK(maksBelaningBeregning.maksGjeld)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <div className="result-box">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Egenkapital (startpant)</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: colors.primary }}>{formatNOK(portefoljeBeregning.totalVerdi)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>Det du faktisk eier</div>
                  </div>
                  <div className="result-box highlight">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Maks gjeld</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: colors.accent }}>{formatNOK(maksBelaningBeregning.maksGjeld)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>Ved {formatProsent(maksBelaningBeregning.ltv)} LTV</div>
                  </div>
                  <div className="result-box success">
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Total eksponering</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: colors.success }}>{formatNOK(maksBelaningBeregning.totalEksponering)}</div>
                    <div style={{ fontSize: '9px', color: colors.textMuted }}>EK + Gjeld</div>
                  </div>
                </div>

                {/* Tabell - År for år utvikling */}
                <h3 style={{ fontSize: '13px', fontWeight: '600', color: colors.primary, marginBottom: '10px' }}>
                  Utvikling over tid (ved {reinvesteringAvkastning}% avkastning, {totalRente.toFixed(1)}% rente)
                </h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>År</th>
                        <th>Egenkapital</th>
                        <th>Gjeld</th>
                        <th>Total eksponering</th>
                        <th style={{ width: '70px' }}>LTV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maksBelaningBeregning.arligData.map(d => (
                        <tr key={d.ar}>
                          <td>{d.label}</td>
                          <td style={{ color: colors.primary, fontWeight: '500' }}>{formatNOK(d.egenkapital)}</td>
                          <td style={{ color: colors.danger }}>{formatNOK(d.gjeld)}</td>
                          <td style={{ color: colors.success, fontWeight: '500' }}>{formatNOK(d.totalEksponering)}</td>
                          <td>{formatProsent(d.ltv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="warning-box" style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span>⚠️</span>
                    <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: '1.5' }}>
                      <strong>Viktig:</strong> Dette er teoretisk maksimum. I praksis begrenses belåning av kredittramme, interne limits, konsentrasjonsgrenser og risikokrav. 
                      Høy belåning medfører betydelig risiko ved markedsnedgang (margin call).
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LTV-oversikt */}
            <div className="pensum-card">
              <h3 className="section-title" style={{ marginBottom: '10px' }}>Maks LTV per aktivaklasse</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {Object.entries(aktivaklasser).map(([key, value]) => (
                  <div key={key} style={{ textAlign: 'center', padding: '8px 4px', background: colors.lightGray, borderRadius: '5px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: value.farge }}>{value.maksLTV}%</div>
                    <div style={{ fontSize: '8px', color: colors.textMuted }}>{value.navn}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '9px', color: colors.textMuted, fontStyle: 'italic' }}>
                * Enkeltaksjer: 20% konsentrert / 50% diversifisert (maks 20% per aksje)
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '12px 14px', background: colors.white, borderRadius: '6px', fontSize: '9px', color: colors.textMuted, lineHeight: '1.4', border: `1px solid ${colors.mediumGray}` }}>
              <strong>Forutsetninger:</strong> Konstant LTV (ingen rebalansering), lineær avkastning, ingen skatt/gebyrer/valutaeffekter. 
              Baserenter er veiledende. Kontakt Pensum Asset Management for fullstendig analyse.
            </div>
          </div>
        </div>

        {/* ====== VALUTAHEDGE ====== */}
        <ValutaHedgeSlide
          colors={colors}
          valuta={valuta}
          baserenter={baserenter}
          lanebelop={beregninger.initieltLan || portefoljeBeregning.faktiskLanebelop}
          totalRente={totalRente}
          rentepaaslag={rentepaaslag}
          tidshorisont={tidshorisont}
          formatNOK={formatNOK}
          formatProsent={formatProsent}
        />

        <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: `1px solid ${colors.mediumGray}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: colors.textMuted, flexWrap: 'wrap', gap: '10px' }}>
          <div>© {new Date().getFullYear()} Pensum Asset Management AS — Belåningsverktøy</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Kilde: <a href="https://github.com/magnuslangberg-lgtm/Modell-for-Verdipapirbel-ning" target="_blank" rel="noopener noreferrer" style={{ color: colors.primaryLight }}>Modell-for-Verdipapirbelåning</a></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== VALUTAHEDGE-SEKSJON =====
// Viser effekten av valutahedge på et lån i fremmed valuta
// Historisk årlig volatilitet (illustrative tall) for hovedvalutaer mot NOK,
// brukt i anbefalingsmotor og forventet bevegelse-tabeller.
const FX_VOL_VS_NOK = {
  EUR: 7,   // EUR/NOK årlig volatilitet, %
  USD: 11,  // USD/NOK
  SEK: 5,   // SEK/NOK
  GBP: 9,
  CHF: 9,
  JPY: 12
};

const ValutaHedgeSlide = ({ colors, valuta, baserenter, lanebelop = 0, totalRente, rentepaaslag, tidshorisont, formatNOK, formatProsent }) => {
  const [hedgeRatio, setHedgeRatio] = useState(100); // 0-100 % hedge
  const [hedgeKostnad, setHedgeKostnad] = useState(0.5); // hedgekost p.a. i prosent
  const [valutaSensitivitet, setValutaSensitivitet] = useState(10);
  const [inkluderISlide, setInkluderISlide] = useState(false);

  const baseRente = baserenter[valuta]?.rate || 0;
  const NOKRente = baserenter['NOK']?.rate || 0;
  const renteForskjell = NOKRente - baseRente; // Positivt: NOK høyere rente, negativ carry å hedge inn til NOK
  // Implied carry-cost / -gevinst ved å "låse inn" NOK-vekslingskurs
  const carryEstimat = renteForskjell;
  const effektivRenteHedget = totalRente + (hedgeRatio / 100) * (hedgeKostnad + Math.max(0, renteForskjell - hedgeKostnad));

  // Forventet historisk FX-volatilitet
  const fxVol = FX_VOL_VS_NOK[valuta] || 8;
  // Break-even FX-bevegelse: FX-bevegelse som tilsvarer hedge-kostnaden over tidshorisonten
  const totalHedgeCostPct = hedgeKostnad * tidshorisont;
  const breakEvenFX = totalHedgeCostPct;

  // Risiko-/kostnadsbilde — beskriver forholdet mellom volatilitet og hedgekostnad,
  // uten å gi konkrete anbefalinger. Rådgiver må selv vurdere kunden sin situasjon.
  const risikoBilde = useMemo(() => {
    if (valuta === 'NOK' || lanebelop <= 0) return null;
    const forventetTap1Sigma = lanebelop * (fxVol / 100);
    const arligHedgeKost = lanebelop * (hedgeKostnad / 100);
    const ratio = forventetTap1Sigma / Math.max(arligHedgeKost, 1);
    if (ratio >= 6) return {
      tittel: 'Høy FX-volatilitet relativt til hedgekostnad', farge: colors.primary,
      tekst: `Historisk volatilitet i ${valuta}/NOK (~${fxVol}% p.a.) er betydelig høyere enn årlig hedgekostnad. Dette er en faktor som taler for å vurdere hedge — men endelig valg avhenger av kundens risikoevne, horisont og syn på valutautvikling.`
    };
    if (ratio >= 3) return {
      tittel: 'Moderat forhold mellom risiko og kostnad', farge: colors.accent,
      tekst: `FX-volatiliteten og hedgekostnaden er i samme størrelsesorden. Delvis hedge er én tilnærming for å redusere halerisiko samtidig som man beholder noe oppside. Vurder kundens preferanser og horisont.`
    };
    return {
      tittel: 'Hedgekostnad høy relativt til forventet FX-bevegelse', farge: colors.primaryLight,
      tekst: `Hedgekostnad (${hedgeKostnad.toFixed(2)}% p.a.) er høy sammenlignet med historisk volatilitet i ${valuta}/NOK. Hedge gir lavere forventet avkastning, men kan likevel være aktuelt for kunder med lav risikoevne eller behov for forutsigbarhet.`
    };
  }, [valuta, lanebelop, fxVol, hedgeKostnad, colors]);

  if (valuta === 'NOK' || lanebelop <= 0) {
    return (
      <div className="pensum-card" style={{ marginTop: '20px', borderTop: `4px solid ${colors.accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: colors.primary, margin: 0, letterSpacing: '0.5px' }}>🌍 Valutahedge — analyse for rådgiver</h2>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Vurder effekten av FX-hedge på lån i fremmed valuta</div>
          </div>
          <div style={{ fontSize: '10px', color: colors.accent, padding: '4px 10px', background: `${colors.accent}15`, borderRadius: '4px', fontWeight: 700 }}>
            INAKTIV
          </div>
        </div>
        <div style={{ fontSize: '13px', color: colors.textDark, padding: '16px 18px', background: colors.lightGray, borderRadius: '6px', borderLeft: `4px solid ${colors.primary}` }}>
          {valuta === 'NOK'
            ? <>
                <strong>Lånet er i NOK</strong> — ingen valutaeksponering eller hedge er nødvendig.<br/><br/>
                <span style={{ color: colors.textMuted, fontSize: '12px' }}>For å se verktøyet for valutahedge, bytt valuta i <strong>"Lånerente"-seksjonen</strong> over (EUR, USD eller SEK). Da får du tilgang til full hedge-analyse med risikobilde, scenarioer og slide-grunnlag for kunderapport.</span>
              </>
            : <>
                <strong>Velg en aktivaklasse og en LTV &gt; 0</strong> for å se valutahedge-analyse.
              </>
          }
        </div>
      </div>
    );
  }

  // Time-series: lån i NOK over tid under tre FX-scenarier (med vs uten hedge)
  const tidsSerie = [];
  for (let ar = 0; ar <= tidshorisont; ar++) {
    // Skaler FX-bevegelse over tid (cumulative, scaled by tidshorisont)
    const skalering = ar / tidshorisont;
    const styrkesFX = valutaSensitivitet * skalering;
    const svekkesFX = -valutaSensitivitet * skalering;
    // Akkumulert hedge-kostnad
    const hedgeKostAkk = lanebelop * (hedgeKostnad / 100) * ar;

    tidsSerie.push({
      ar,
      label: ar === 0 ? 'Start' : `År ${ar}`,
      utenHedgeStyrkes: lanebelop * (1 + styrkesFX / 100),
      utenHedgeUendret: lanebelop,
      utenHedgeSvekkes: lanebelop * (1 + svekkesFX / 100),
      // Med hedge: lånet i NOK uendret av FX, men hedge-kost trekkes
      medHedge: lanebelop + (hedgeRatio / 100) * hedgeKostAkk,
      // Med delvis hedge: hedgeRatio * fast NOK + (1-ratio) * FX-eksponert ved styrkes
      medHedgeStyrkes: lanebelop * (hedgeRatio / 100) + lanebelop * (1 - hedgeRatio / 100) * (1 + styrkesFX / 100) + (hedgeRatio / 100) * hedgeKostAkk
    });
  }

  // Sensitivitet: matrix av FX-bevegelse × tid
  const fxSteps = [-20, -10, -5, 0, 5, 10, 20];
  const sensitivitetData = fxSteps.map(fx => {
    const utenHedge = lanebelop * (fx / 100); // tap eller gevinst i NOK
    const medHedge = -lanebelop * (hedgeRatio / 100) * (hedgeKostnad / 100) * tidshorisont; // hedge-kostnad over horisonten
    const medHedgeRest = lanebelop * (1 - hedgeRatio / 100) * (fx / 100); // ikke-hedget del eksponert
    const medHedgeNetto = medHedge + medHedgeRest;
    return { fx, utenHedge, medHedge: medHedgeNetto, diff: medHedgeNetto - utenHedge };
  });

  return (
    <div id="valutahedge-slide" className="pensum-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', paddingBottom: '10px', borderBottom: `2px solid ${colors.mediumGray}` }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: colors.primary, margin: 0, letterSpacing: '0.5px' }}>🌍 Valutahedge — illustrativ analyse</h2>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px' }}>Lån i {valuta} ({baserenter[valuta]?.navn}) — illustrativ effekt av FX-hedge mot NOK. Tallene er beregningsgrunnlag, ikke anbefalinger.</div>
        </div>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '11px', color: colors.primary, padding: '6px 10px', background: inkluderISlide ? `${colors.accent}15` : colors.lightGray, border: `1px solid ${inkluderISlide ? colors.accent : colors.mediumGray}`, borderRadius: '6px' }}>
          <input type="checkbox" checked={inkluderISlide} onChange={(e) => setInkluderISlide(e.target.checked)} style={{ width: '14px', height: '14px', accentColor: colors.accent }} />
          <span>Inkluder som slide i investeringsforslag</span>
        </label>
      </div>

      {/* Klientvenlig forklaring */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '12px', background: colors.lightGray, borderRadius: '6px', borderLeft: `3px solid ${colors.primary}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, marginBottom: '4px' }}>Hva er valutahedge?</div>
          <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>Et finansielt instrument (FX-forward eller cross-currency swap) som låser fremtidig vekslingskurs og fjerner usikkerheten om hva lånet vil koste i NOK.</div>
        </div>
        <div style={{ padding: '12px', background: colors.lightGray, borderRadius: '6px', borderLeft: `3px solid ${colors.accent}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.accent, marginBottom: '4px' }}>Hva koster det?</div>
          <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>Hedge-kostnad reflekterer renteforskjellen mellom NOK og lånevalutaen + en likviditetspremie. Typisk 0.3–1.5% p.a.</div>
        </div>
        <div style={{ padding: '12px', background: colors.lightGray, borderRadius: '6px', borderLeft: `3px solid ${colors.success}` }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: colors.success, marginBottom: '4px' }}>Hvorfor velge hedge?</div>
          <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>For å fjerne valutarisikoen i lånet — viktig hvis kunden ønsker forutsigbarhet eller har begrenset risikoevne på FX-svingninger.</div>
        </div>
      </div>

      {/* Risiko-/kostnadsbilde — beskrivende, ikke en anbefaling */}
      {risikoBilde && (
        <div style={{ marginBottom: '16px', padding: '14px 16px', background: `${risikoBilde.farge}10`, border: `1px solid ${risikoBilde.farge}40`, borderLeft: `4px solid ${risikoBilde.farge}`, borderRadius: '6px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.textMuted, marginBottom: '4px' }}>Til vurdering</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: risikoBilde.farge, marginBottom: '4px' }}>{risikoBilde.tittel}</div>
          <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5 }}>{risikoBilde.tekst}</div>
        </div>
      )}

      {/* Nøkkeltall */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div className="result-box">
          <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Lånebeløp</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: colors.primary }}>{formatNOK(lanebelop)}</div>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>i {valuta}</div>
        </div>
        <div className="result-box highlight">
          <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Effektiv rente m/{hedgeRatio}% hedge</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: colors.accent }}>{effektivRenteHedget.toFixed(2)}%</div>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>Uten hedge: {totalRente.toFixed(2)}%</div>
        </div>
        <div className="result-box">
          <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Hist. FX-vol {valuta}/NOK</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: colors.primary }}>~{fxVol}%</div>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>1-sigma p.a. årlig</div>
        </div>
        <div className="result-box">
          <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '3px', textTransform: 'uppercase' }}>Break-even FX-bevegelse</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: colors.primary }}>±{breakEvenFX.toFixed(1)}%</div>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>Over {tidshorisont} år ved {hedgeKostnad.toFixed(2)}%/år</div>
        </div>
      </div>

      {/* Kontroller — hedge-ratio + kost + scenario */}
      <div style={{ background: colors.lightGray, padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Justér parametre</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label-text">Hedge-andel</span>
              <span className="value-text">{hedgeRatio}%</span>
            </label>
            <input type="range" min="0" max="100" step="5" value={hedgeRatio} onChange={(e) => setHedgeRatio(Number(e.target.value))} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: colors.textMuted }}>
              <span>Ingen</span><span>Delvis</span><span>Full</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label-text">Hedgekostnad p.a.</span>
              <span className="value-text">{hedgeKostnad.toFixed(2)}%</span>
            </label>
            <input type="range" min="0" max="3" step="0.05" value={hedgeKostnad} onChange={(e) => setHedgeKostnad(Number(e.target.value))} />
          </div>
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="label-text">Stress-scenario (±%)</span>
              <span className="value-text">±{valutaSensitivitet}%</span>
            </label>
            <input type="range" min="2" max="30" step="1" value={valutaSensitivitet} onChange={(e) => setValutaSensitivitet(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Time-series graf */}
      <h3 style={{ fontSize: '13px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>Lånets verdi i NOK over tid — med vs. uten hedge</h3>
      <div style={{ height: '260px', marginBottom: '14px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tidsSerie} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.mediumGray} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: colors.textMuted }} />
            <YAxis tickFormatter={(v) => (v / 1000000).toFixed(1) + 'M'} tick={{ fontSize: 10, fill: colors.textMuted }} domain={['auto', 'auto']} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div style={{ background: 'white', border: `1px solid ${colors.mediumGray}`, borderRadius: '6px', padding: '10px 12px', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: colors.primary }}>{label}</div>
                    {payload.map((p, i) => (
                      <div key={i} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span>{p.name}</span><span style={{ fontWeight: 600 }}>{formatNOK(p.value)}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} iconType="line" />
            <Line type="monotone" dataKey="utenHedgeStyrkes" name={`Uten hedge — ${valuta} styrkes ${valutaSensitivitet}%`} stroke={colors.danger} strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="utenHedgeSvekkes" name={`Uten hedge — ${valuta} svekkes ${valutaSensitivitet}%`} stroke={colors.success} strokeWidth={2} dot={false} strokeDasharray="6 3" />
            <Line type="monotone" dataKey="utenHedgeUendret" name="Uten hedge — uendret" stroke={colors.textMuted} strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
            <Line type="monotone" dataKey="medHedge" name={`Med ${hedgeRatio}% hedge`} stroke={colors.primary} strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sensitivitetsmatrix */}
      <h3 style={{ fontSize: '13px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>Sensitivitet — netto NOK-effekt over {tidshorisont} år</h3>
      <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>{valuta}/NOK-bevegelse</th>
              <th>Uten hedge (FX-effekt)</th>
              <th>Med {hedgeRatio}% hedge</th>
              <th>Differanse</th>
              <th>Hedge lønner seg?</th>
            </tr>
          </thead>
          <tbody>
            {sensitivitetData.map((d, idx) => {
              const lonner = d.medHedge > d.utenHedge; // mindre tap eller mer gevinst med hedge = lønner seg
              return (
                <tr key={idx} style={{ background: d.fx === 0 ? colors.lightGray : undefined }}>
                  <td style={{ fontWeight: d.fx === 0 ? 700 : 500 }}>{d.fx > 0 ? `+${d.fx}%` : `${d.fx}%`}{d.fx === 0 && <span style={{ fontSize: '9px', color: colors.textMuted }}> (uendret)</span>}</td>
                  <td className={d.utenHedge < 0 ? 'negative' : (d.utenHedge > 0 ? 'positive' : '')}>{d.utenHedge >= 0 ? '+' : ''}{formatNOK(d.utenHedge)}</td>
                  <td className={d.medHedge < 0 ? 'negative' : (d.medHedge > 0 ? 'positive' : '')}>{d.medHedge >= 0 ? '+' : ''}{formatNOK(d.medHedge)}</td>
                  <td style={{ fontWeight: 600, color: d.diff > 0 ? colors.success : (d.diff < 0 ? colors.danger : colors.textMuted) }}>{d.diff > 0 ? '+' : ''}{formatNOK(d.diff)}</td>
                  <td style={{ textAlign: 'center', fontSize: '14px' }}>{lonner ? '✓' : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Carry-analyse */}
      <div style={{ background: carryEstimat > 0 ? `${colors.danger}10` : `${colors.success}10`, padding: '12px 14px', borderRadius: '6px', border: `1px solid ${carryEstimat > 0 ? colors.danger : colors.success}30`, marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, marginBottom: '6px' }}>Carry-analyse</div>
        <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: 1.5 }}>
          NOK ({baserenter['NOK']?.navn}: {NOKRente.toFixed(2)}%) vs {valuta} ({baserenter[valuta]?.navn}: {baseRente.toFixed(2)}%) — renteforskjell <strong style={{ color: carryEstimat > 0 ? colors.danger : colors.success }}>{carryEstimat >= 0 ? '+' : ''}{carryEstimat.toFixed(2)}%</strong>.{' '}
          {carryEstimat > 0
            ? `Du betaler "negativ carry" på hedge — markedet priser inn at NOK skal svekkes (eller at hedge-tilbyder skal ha forskjellen).`
            : `Du mottar "positiv carry" på hedge — det er teoretisk gratis å hedge inn til NOK fordi NOK har lavere rente.`}
        </div>
      </div>

      {/* Kunderapport-summary (vises hvis "inkluder slide" er huket av) */}
      {inkluderISlide && (
        <div style={{ marginTop: '20px', padding: '20px', background: 'white', border: `2px dashed ${colors.accent}`, borderRadius: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Slide-grunnlag for kunderapport</div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: colors.primary, margin: 0, marginBottom: '12px' }}>Valutahedge: {hedgeRatio}% hedge på {valuta}-lån</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Lånebeløp i {valuta}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.primary }}>{formatNOK(lanebelop)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>Effektiv lånerente m/hedge</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.accent }}>{effektivRenteHedget.toFixed(2)}%</div>
            </div>
          </div>
          <ul style={{ fontSize: '12px', color: colors.textMuted, lineHeight: 1.7, paddingLeft: '20px', margin: 0 }}>
            <li><strong>Hedge-kostnad:</strong> {hedgeKostnad.toFixed(2)}% p.a. ({formatNOK(lanebelop * (hedgeRatio/100) * (hedgeKostnad/100))} per år ved {hedgeRatio}% hedge)</li>
            <li><strong>Forventet FX-volatilitet:</strong> ~{fxVol}% p.a. for {valuta}/NOK</li>
            <li><strong>Break-even:</strong> Hedge lønner seg hvis valutaen beveger seg mer enn ±{breakEvenFX.toFixed(1)}% over horisonten</li>
            <li><strong>Til vurdering:</strong> {risikoBilde?.tittel}</li>
            <li>Carry-effekt: {carryEstimat >= 0 ? `negativ ${carryEstimat.toFixed(2)}% (kostnad)` : `positiv ${Math.abs(carryEstimat).toFixed(2)}% (gevinst)`}</li>
          </ul>
        </div>
      )}

      <div className="info-box" style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '10px', color: colors.textMuted, lineHeight: 1.5 }}>
          <strong>Forutsetninger:</strong> Historisk volatilitet er illustrative tall basert på siste 5 års data. Hedge-kostnaden settes manuelt — Pensum kan tilby konkrete priser basert på dagens markedssituasjon.
          Beregningene tar ikke hensyn til skatt, gebyrer, eller forskjeller mellom forwards og swaps. Pensum kan tilby strukturerte løsninger for delvis hedge (f.eks. 50% hedge ratio) og rullende hedge-strategier.
        </div>
      </div>
    </div>
  );
};

export default PensumBelaning;
