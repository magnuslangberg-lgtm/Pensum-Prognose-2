// ============================================================================
// Fondsdatabase — norske og nordiske fond tilgjengelig for kundenes
// eksisterende porteføljer. Brukes til oppslag, sammenligning og analyse.
//
// Data er illustrativt og basert på offentlig tilgjengelig informasjon.
// Avkastningstall er omtrentlige og oppdateres manuelt.
// ============================================================================

const fondDatabase = [
  // ── NORDEA ────────────────────────────────────────────────────────────────
  { isin: 'NO0010081841', navn: 'Nordea Gambak', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Norge', ter: 1.80, avk1y: 8.2, avk3y: 10.5, avk5y: 12.1, volatilitet: 18.5, valuta: 'NOK' },
  { isin: 'LU0772958525', navn: 'Nordea Emerging Markets Equities', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Emerging Markets', ter: 1.79, avk1y: 5.1, avk3y: 2.8, avk5y: 4.2, volatilitet: 16.8, valuta: 'NOK' },
  { isin: 'LU0634509953', navn: 'Nordea European Enhanced BP', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Europa', ter: 0.85, avk1y: 12.3, avk3y: 8.1, avk5y: 9.4, volatilitet: 14.2, valuta: 'EUR' },
  { isin: 'NO0010884851', navn: 'Nordea FRN Kredit', forvalter: 'Nordea', kategori: 'rente', geografi: 'Norden', ter: 0.45, avk1y: 5.8, avk3y: 4.2, avk5y: 3.8, volatilitet: 2.1, valuta: 'NOK' },
  { isin: 'LU0607983896', navn: 'Nordea Global Enhanced A', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Global', ter: 0.85, avk1y: 18.5, avk3y: 11.2, avk5y: 13.8, volatilitet: 14.8, valuta: 'NOK' },
  { isin: 'LU0607984191', navn: 'Nordea Global Enhanced HBN USD', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Global', ter: 0.85, avk1y: 20.1, avk3y: 12.5, avk5y: 14.2, volatilitet: 15.2, valuta: 'USD' },
  { isin: 'NO0010325962', navn: 'Nordea Nordic Small Cap A', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Norden', ter: 1.50, avk1y: 6.8, avk3y: 5.2, avk5y: 8.9, volatilitet: 19.5, valuta: 'NOK' },
  { isin: 'LU0985320562', navn: 'Nordea Stabile Aksjer Global valutasikret', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Global', ter: 1.79, avk1y: 10.2, avk3y: 7.8, avk5y: 9.1, volatilitet: 11.5, valuta: 'NOK' },
  { isin: 'NO0010050846', navn: 'Nordea Avkastning', forvalter: 'Nordea', kategori: 'blandet', geografi: 'Global', ter: 1.40, avk1y: 9.5, avk3y: 6.2, avk5y: 7.4, volatilitet: 9.8, valuta: 'NOK' },
  { isin: 'NO0010653883', navn: 'Nordea Kredittobligasjon', forvalter: 'Nordea', kategori: 'rente', geografi: 'Norden', ter: 0.75, avk1y: 6.2, avk3y: 3.8, avk5y: 3.5, volatilitet: 3.2, valuta: 'NOK' },
  { isin: 'NO0010044500', navn: 'Nordea Norge Verdi', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Norge', ter: 1.50, avk1y: 10.5, avk3y: 9.8, avk5y: 11.2, volatilitet: 17.8, valuta: 'NOK' },
  { isin: 'NO0010036498', navn: 'Nordea Kapital', forvalter: 'Nordea', kategori: 'rente', geografi: 'Norge', ter: 0.50, avk1y: 4.8, avk3y: 3.1, avk5y: 2.6, volatilitet: 1.8, valuta: 'NOK' },
  { isin: 'LU2536413498', navn: 'Nordea Global Climate and Environment', forvalter: 'Nordea', kategori: 'aksje', geografi: 'Global', ter: 1.79, avk1y: 4.5, avk3y: 3.2, avk5y: 10.8, volatilitet: 16.5, valuta: 'NOK' },

  // ── DNB ───────────────────────────────────────────────────────────────────
  { isin: 'NO0010307562', navn: 'DNB Teknologi', forvalter: 'DNB', kategori: 'aksje', geografi: 'Global', ter: 1.50, avk1y: 28.5, avk3y: 18.2, avk5y: 20.5, volatilitet: 20.2, valuta: 'NOK' },
  { isin: 'NO0010337678', navn: 'DNB Global Indeks', forvalter: 'DNB', kategori: 'aksje', geografi: 'Global', ter: 0.30, avk1y: 19.2, avk3y: 12.1, avk5y: 14.5, volatilitet: 14.5, valuta: 'NOK' },
  { isin: 'NO0010352400', navn: 'DNB Norge Indeks', forvalter: 'DNB', kategori: 'aksje', geografi: 'Norge', ter: 0.30, avk1y: 9.8, avk3y: 10.2, avk5y: 11.5, volatilitet: 17.2, valuta: 'NOK' },
  { isin: 'NO0010002267', navn: 'DNB Norge', forvalter: 'DNB', kategori: 'aksje', geografi: 'Norge', ter: 1.40, avk1y: 10.8, avk3y: 11.5, avk5y: 12.8, volatilitet: 18.2, valuta: 'NOK' },
  { isin: 'NO0010003999', navn: 'DNB Obligasjon 20', forvalter: 'DNB', kategori: 'rente', geografi: 'Norge', ter: 0.50, avk1y: 3.2, avk3y: 0.8, avk5y: 1.2, volatilitet: 4.5, valuta: 'NOK' },
  { isin: 'NO0010654311', navn: 'DNB High Yield', forvalter: 'DNB', kategori: 'rente', geografi: 'Norden', ter: 0.75, avk1y: 7.5, avk3y: 5.2, avk5y: 5.8, volatilitet: 4.8, valuta: 'NOK' },
  { isin: 'NO0010012783', navn: 'DNB Finans', forvalter: 'DNB', kategori: 'aksje', geografi: 'Global', ter: 1.50, avk1y: 22.5, avk3y: 14.8, avk5y: 15.2, volatilitet: 19.8, valuta: 'NOK' },
  { isin: 'NO0010735756', navn: 'DNB Barnefond', forvalter: 'DNB', kategori: 'aksje', geografi: 'Global', ter: 0.75, avk1y: 17.2, avk3y: 11.5, avk5y: 13.2, volatilitet: 14.2, valuta: 'NOK' },
  { isin: 'NO0010337652', navn: 'DNB Aktiv 80', forvalter: 'DNB', kategori: 'blandet', geografi: 'Global', ter: 0.80, avk1y: 14.5, avk3y: 9.2, avk5y: 11.0, volatilitet: 11.8, valuta: 'NOK' },

  // ── STOREBRAND ────────────────────────────────────────────────────────────
  { isin: 'NO0010841588', navn: 'Storebrand Global Indeks', forvalter: 'Storebrand', kategori: 'aksje', geografi: 'Global', ter: 0.20, avk1y: 19.5, avk3y: 12.5, avk5y: 14.8, volatilitet: 14.2, valuta: 'NOK' },
  { isin: 'NO0010841596', navn: 'Storebrand Norge Indeks', forvalter: 'Storebrand', kategori: 'aksje', geografi: 'Norge', ter: 0.20, avk1y: 10.2, avk3y: 10.8, avk5y: 11.8, volatilitet: 17.0, valuta: 'NOK' },
  { isin: 'NO0010904584', navn: 'Storebrand Global ESG Plus', forvalter: 'Storebrand', kategori: 'aksje', geografi: 'Global', ter: 0.20, avk1y: 18.8, avk3y: 11.8, avk5y: 14.2, volatilitet: 14.0, valuta: 'NOK' },
  { isin: 'NO0010259100', navn: 'Storebrand Global Multifaktor', forvalter: 'Storebrand', kategori: 'aksje', geografi: 'Global', ter: 0.75, avk1y: 15.2, avk3y: 9.5, avk5y: 11.5, volatilitet: 13.5, valuta: 'NOK' },
  { isin: 'NO0010689358', navn: 'Storebrand Norsk Kreditt IG', forvalter: 'Storebrand', kategori: 'rente', geografi: 'Norge', ter: 0.40, avk1y: 5.5, avk3y: 3.5, avk5y: 3.2, volatilitet: 2.0, valuta: 'NOK' },
  { isin: 'NO0010814361', navn: 'Storebrand Rente+', forvalter: 'Storebrand', kategori: 'rente', geografi: 'Norge', ter: 0.30, avk1y: 5.2, avk3y: 3.2, avk5y: 2.8, volatilitet: 1.5, valuta: 'NOK' },

  // ── KLP ───────────────────────────────────────────────────────────────────
  { isin: 'NO0010670653', navn: 'KLP AksjeGlobal Indeks', forvalter: 'KLP', kategori: 'aksje', geografi: 'Global', ter: 0.18, avk1y: 19.8, avk3y: 12.8, avk5y: 15.0, volatilitet: 14.5, valuta: 'NOK' },
  { isin: 'NO0010670661', navn: 'KLP AksjeNorge Indeks', forvalter: 'KLP', kategori: 'aksje', geografi: 'Norge', ter: 0.18, avk1y: 10.5, avk3y: 11.0, avk5y: 12.0, volatilitet: 17.5, valuta: 'NOK' },
  { isin: 'NO0010670679', navn: 'KLP Obligasjon Global', forvalter: 'KLP', kategori: 'rente', geografi: 'Global', ter: 0.20, avk1y: 3.8, avk3y: 1.2, avk5y: 1.5, volatilitet: 4.2, valuta: 'NOK' },
  { isin: 'NO0010815350', navn: 'KLP Pengemarked', forvalter: 'KLP', kategori: 'rente', geografi: 'Norge', ter: 0.10, avk1y: 4.5, avk3y: 2.8, avk5y: 2.2, volatilitet: 0.5, valuta: 'NOK' },

  // ── ODIN ──────────────────────────────────────────────────────────────────
  { isin: 'NO0010317050', navn: 'ODIN Norge', forvalter: 'ODIN', kategori: 'aksje', geografi: 'Norge', ter: 2.00, avk1y: 12.5, avk3y: 12.8, avk5y: 14.5, volatilitet: 19.5, valuta: 'NOK' },
  { isin: 'NO0010317068', navn: 'ODIN Global', forvalter: 'ODIN', kategori: 'aksje', geografi: 'Global', ter: 2.00, avk1y: 16.8, avk3y: 10.5, avk5y: 12.5, volatilitet: 15.2, valuta: 'NOK' },
  { isin: 'NO0010317076', navn: 'ODIN Europa', forvalter: 'ODIN', kategori: 'aksje', geografi: 'Europa', ter: 2.00, avk1y: 14.2, avk3y: 8.5, avk5y: 10.8, volatilitet: 15.8, valuta: 'EUR' },
  { isin: 'NO0010317084', navn: 'ODIN Norden', forvalter: 'ODIN', kategori: 'aksje', geografi: 'Norden', ter: 2.00, avk1y: 11.5, avk3y: 9.8, avk5y: 11.8, volatilitet: 16.5, valuta: 'NOK' },
  { isin: 'NO0010842032', navn: 'ODIN Small Cap', forvalter: 'ODIN', kategori: 'aksje', geografi: 'Norden', ter: 2.00, avk1y: 8.5, avk3y: 6.2, avk5y: 9.5, volatilitet: 20.2, valuta: 'NOK' },

  // ── HOLBERG ───────────────────────────────────────────────────────────────
  { isin: 'NO0010072543', navn: 'Holberg Norge', forvalter: 'Holberg', kategori: 'aksje', geografi: 'Norge', ter: 1.50, avk1y: 11.2, avk3y: 11.5, avk5y: 13.2, volatilitet: 18.8, valuta: 'NOK' },
  { isin: 'NO0010072550', navn: 'Holberg Norden', forvalter: 'Holberg', kategori: 'aksje', geografi: 'Norden', ter: 1.50, avk1y: 10.8, avk3y: 9.2, avk5y: 11.0, volatilitet: 16.2, valuta: 'NOK' },
  { isin: 'NO0010072568', navn: 'Holberg Global', forvalter: 'Holberg', kategori: 'aksje', geografi: 'Global', ter: 1.50, avk1y: 18.2, avk3y: 11.8, avk5y: 13.5, volatilitet: 15.0, valuta: 'NOK' },
  { isin: 'NO0010072576', navn: 'Holberg Kreditt', forvalter: 'Holberg', kategori: 'rente', geografi: 'Norden', ter: 0.75, avk1y: 7.8, avk3y: 5.5, avk5y: 5.2, volatilitet: 3.8, valuta: 'NOK' },
  { isin: 'NO0010072584', navn: 'Holberg Likviditet', forvalter: 'Holberg', kategori: 'rente', geografi: 'Norge', ter: 0.30, avk1y: 4.8, avk3y: 2.8, avk5y: 2.2, volatilitet: 0.8, valuta: 'NOK' },

  // ── ALFRED BERG ───────────────────────────────────────────────────────────
  { isin: 'NO0008000445', navn: 'Alfred Berg Gambak', forvalter: 'Alfred Berg', kategori: 'aksje', geografi: 'Norge', ter: 1.80, avk1y: 12.8, avk3y: 12.2, avk5y: 14.2, volatilitet: 19.2, valuta: 'NOK' },
  { isin: 'NO0010088192', navn: 'Alfred Berg Nordic Investment Grade', forvalter: 'Alfred Berg', kategori: 'rente', geografi: 'Norden', ter: 0.50, avk1y: 5.2, avk3y: 3.2, avk5y: 2.8, volatilitet: 2.2, valuta: 'NOK' },
  { isin: 'NO0010810559', navn: 'Alfred Berg Nordisk Likviditet Pluss', forvalter: 'Alfred Berg', kategori: 'rente', geografi: 'Norden', ter: 0.40, avk1y: 5.0, avk3y: 3.0, avk5y: 2.5, volatilitet: 1.2, valuta: 'NOK' },

  // ── PARETO ────────────────────────────────────────────────────────────────
  { isin: 'NO0010040504', navn: 'Pareto Aksje Norge', forvalter: 'Pareto', kategori: 'aksje', geografi: 'Norge', ter: 1.80, avk1y: 11.5, avk3y: 12.0, avk5y: 13.8, volatilitet: 19.0, valuta: 'NOK' },
  { isin: 'NO0010735764', navn: 'Pareto Global', forvalter: 'Pareto', kategori: 'aksje', geografi: 'Global', ter: 1.50, avk1y: 17.5, avk3y: 10.8, avk5y: 12.8, volatilitet: 14.8, valuta: 'NOK' },
  { isin: 'NO0010735772', navn: 'Pareto Nordic Corporate Bond', forvalter: 'Pareto', kategori: 'rente', geografi: 'Norden', ter: 0.75, avk1y: 8.2, avk3y: 5.8, avk5y: 5.5, volatilitet: 4.2, valuta: 'NOK' },

  // ── SKAGEN ────────────────────────────────────────────────────────────────
  { isin: 'NO0010735335', navn: 'SKAGEN Global', forvalter: 'SKAGEN', kategori: 'aksje', geografi: 'Global', ter: 1.60, avk1y: 16.5, avk3y: 10.2, avk5y: 12.2, volatilitet: 14.5, valuta: 'NOK' },
  { isin: 'NO0010735343', navn: 'SKAGEN Kon-Tiki', forvalter: 'SKAGEN', kategori: 'aksje', geografi: 'Emerging Markets', ter: 1.60, avk1y: 7.8, avk3y: 4.5, avk5y: 6.2, volatilitet: 17.5, valuta: 'NOK' },
  { isin: 'NO0010735350', navn: 'SKAGEN Vekst', forvalter: 'SKAGEN', kategori: 'aksje', geografi: 'Norge', ter: 1.60, avk1y: 10.2, avk3y: 10.5, avk5y: 12.0, volatilitet: 18.0, valuta: 'NOK' },

  // ── DANSKE ────────────────────────────────────────────────────────────────
  { isin: 'NO0010304783', navn: 'Danske Invest Norge I', forvalter: 'Danske', kategori: 'aksje', geografi: 'Norge', ter: 1.25, avk1y: 10.5, avk3y: 10.8, avk5y: 11.8, volatilitet: 17.5, valuta: 'NOK' },
  { isin: 'NO0010304791', navn: 'Danske Invest Norsk Obligasjon Inst', forvalter: 'Danske', kategori: 'rente', geografi: 'Norge', ter: 0.35, avk1y: 4.2, avk3y: 1.8, avk5y: 1.5, volatilitet: 3.5, valuta: 'NOK' },
  { isin: 'LU0012050729', navn: 'Danske Invest Global Indeks', forvalter: 'Danske', kategori: 'aksje', geografi: 'Global', ter: 0.40, avk1y: 18.8, avk3y: 11.5, avk5y: 13.8, volatilitet: 14.2, valuta: 'NOK' },

  // ── HANDELSBANKEN ─────────────────────────────────────────────────────────
  { isin: 'NO0010090305', navn: 'Handelsbanken Norge', forvalter: 'Handelsbanken', kategori: 'aksje', geografi: 'Norge', ter: 1.50, avk1y: 10.2, avk3y: 10.5, avk5y: 11.5, volatilitet: 17.2, valuta: 'NOK' },
  { isin: 'SE0014704423', navn: 'Handelsbanken Global Index Criteria', forvalter: 'Handelsbanken', kategori: 'aksje', geografi: 'Global', ter: 0.30, avk1y: 18.5, avk3y: 11.8, avk5y: 13.5, volatilitet: 14.0, valuta: 'SEK' },

  // ── ARCTIC ────────────────────────────────────────────────────────────────
  { isin: 'NO0010735780', navn: 'Arctic Norwegian Equities', forvalter: 'Arctic', kategori: 'aksje', geografi: 'Norge', ter: 1.50, avk1y: 12.2, avk3y: 12.5, avk5y: 14.0, volatilitet: 18.5, valuta: 'NOK' },
  { isin: 'NO0010735798', navn: 'Arctic Nordic Equities', forvalter: 'Arctic', kategori: 'aksje', geografi: 'Norden', ter: 1.50, avk1y: 11.8, avk3y: 10.2, avk5y: 12.2, volatilitet: 16.8, valuta: 'NOK' },
  { isin: 'NO0010735806', navn: 'Arctic Return', forvalter: 'Arctic', kategori: 'rente', geografi: 'Norden', ter: 0.60, avk1y: 6.8, avk3y: 4.5, avk5y: 4.2, volatilitet: 3.0, valuta: 'NOK' },

  // ── FONDSFINANS ───────────────────────────────────────────────────────────
  { isin: 'NO0010087731', navn: 'Fondsfinans Norge', forvalter: 'Fondsfinans', kategori: 'aksje', geografi: 'Norge', ter: 1.80, avk1y: 13.5, avk3y: 13.0, avk5y: 15.2, volatilitet: 20.5, valuta: 'NOK' },

  // ── FIRST ─────────────────────────────────────────────────────────────────
  { isin: 'NO0010004441', navn: 'First Veritas', forvalter: 'First', kategori: 'blandet', geografi: 'Global', ter: 1.40, avk1y: 12.8, avk3y: 8.5, avk5y: 10.2, volatilitet: 10.5, valuta: 'NOK' },
  { isin: 'NO0010811250', navn: 'First Global Fokus', forvalter: 'First', kategori: 'aksje', geografi: 'Global', ter: 1.80, avk1y: 20.5, avk3y: 14.2, avk5y: 16.0, volatilitet: 16.5, valuta: 'NOK' },

  // ── DELPHI ────────────────────────────────────────────────────────────────
  { isin: 'NO0008000189', navn: 'Delphi Norge', forvalter: 'Delphi', kategori: 'aksje', geografi: 'Norge', ter: 2.00, avk1y: 14.5, avk3y: 14.2, avk5y: 16.5, volatilitet: 21.0, valuta: 'NOK' },
  { isin: 'NO0010735814', navn: 'Delphi Global', forvalter: 'Delphi', kategori: 'aksje', geografi: 'Global', ter: 2.00, avk1y: 22.5, avk3y: 15.5, avk5y: 17.8, volatilitet: 17.2, valuta: 'NOK' },

  // ── SPAREBANK 1 ───────────────────────────────────────────────────────────
  { isin: 'NO0010040421', navn: 'SpareBank 1 Nordnorsk Vekst', forvalter: 'SpareBank 1', kategori: 'aksje', geografi: 'Norge', ter: 1.80, avk1y: 9.5, avk3y: 9.2, avk5y: 10.8, volatilitet: 18.0, valuta: 'NOK' },

  // ── FIDELITY ──────────────────────────────────────────────────────────────
  { isin: 'LU0115773425', navn: 'Fidelity Global Technology', forvalter: 'Fidelity', kategori: 'aksje', geografi: 'Global', ter: 1.89, avk1y: 30.2, avk3y: 19.5, avk5y: 22.0, volatilitet: 19.8, valuta: 'USD' },
  { isin: 'LU0261950470', navn: 'Fidelity European Growth', forvalter: 'Fidelity', kategori: 'aksje', geografi: 'Europa', ter: 1.89, avk1y: 13.5, avk3y: 8.2, avk5y: 10.0, volatilitet: 15.0, valuta: 'EUR' },
];

// Hjelpefunksjon: søk i fondsdatabasen
export function sokFond(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return fondDatabase.filter(f =>
    f.navn.toLowerCase().includes(q) ||
    f.isin.toLowerCase().includes(q) ||
    f.forvalter.toLowerCase().includes(q)
  ).slice(0, 15);
}

// Hjelpefunksjon: finn fond basert på eksakt ISIN
export function finnFondISIN(isin) {
  return fondDatabase.find(f => f.isin === isin) || null;
}

// Hjelpefunksjon: finn fond basert på nærmeste navnmatch
export function finnFondNavn(navn) {
  if (!navn) return null;
  const q = navn.toLowerCase().trim();
  // Eksakt match først
  const eksakt = fondDatabase.find(f => f.navn.toLowerCase() === q);
  if (eksakt) return eksakt;
  // Delvis match
  return fondDatabase.find(f => f.navn.toLowerCase().includes(q) || q.includes(f.navn.toLowerCase())) || null;
}

export default fondDatabase;
