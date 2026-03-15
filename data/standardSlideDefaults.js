/**
 * Standard Slide Defaults – Pensum Asset Management
 *
 * Default content for fixed/standard slides used across generators.
 * On-disk fallback; later overridable from Admin panel.
 *
 * Each slide has:
 *   id           – unique key
 *   title        – slide headline
 *   subtitle     – subheadline
 *   textBlocks   – array of { heading, body } pairs
 *   kpis         – optional KPI array [{ label, value, color? }]
 *   bulletItems  – optional bullet list
 *   contactInfo  – optional contact block
 *   teamMembers  – optional for team slides
 *   version      – content version string
 *   active       – whether to include by default
 *   variants     – ['kort', 'full'] which generators may use it
 */

export const STANDARD_SLIDE_DEFAULTS = {
  'om-oss': {
    id: 'om-oss',
    title: 'Om Pensum Asset Management',
    subtitle: 'Uavhengig kapitalforvaltning med fokus på langsiktig verdiskaping',
    textBlocks: [
      {
        heading: 'Hvem vi er',
        body: 'Pensum Asset Management AS er et uavhengig verdipapirforetak med konsesjon fra Finanstilsynet til å drive investeringsrådgivning og aktiv porteføljeforvaltning. Vi forvalter kapital for privatpersoner, selskaper og stiftelser.',
      },
      {
        heading: 'Vår filosofi',
        body: 'Vi tror på disiplinert, langsiktig forvaltning med tydelig risikostyring. Våre porteføljer bygges med en kombinasjon av kjerneprodukter, stabilisatorer og satellitter – tilpasset hver kundes mål og risikovillighet.',
      },
      {
        heading: 'Uavhengighet',
        body: 'Vi er ikke tilknyttet noen bank eller forsikringsselskap. Det betyr at vi velger de beste produktene og forvalterne uavhengig av eierskap – alltid med kundens beste interesse i sentrum.',
      },
    ],
    kpis: [
      { label: 'Forvaltningskapital', value: '~2 mrd NOK', color: '0D2841' },
      { label: 'Etablert', value: '2019', color: '6B9DB8' },
      { label: 'Konsesjon', value: 'Finanstilsynet', color: 'C4967E' },
      { label: 'Kunder', value: '100+', color: '2D6A6A' },
    ],
    version: '2026-03',
    active: true,
    variants: ['kort', 'full'],
  },

  'forvaltningsteamet': {
    id: 'forvaltningsteamet',
    title: 'Forvaltning og menneskene bak',
    subtitle: 'Hvem som følger opp porteføljen din',
    teamMembers: [
      {
        name: 'Lars Kirkeby-Garstad',
        rolle: 'CEO / Porteføljeforvalter',
        area: 'Overordnet porteføljestyring og kunderelasjoner',
        bg: 'Bred erfaring fra finans og kapitalforvaltning',
      },
      {
        name: 'Lars Erik Moen',
        rolle: 'CIO / Porteføljeforvalter',
        area: 'Aksjeforvaltning og fondsseleksjon',
        bg: 'Tidligere erfaring fra aksjeforvaltning og analyse',
      },
      {
        name: 'Petter Bakken',
        rolle: 'Porteføljeforvalter',
        area: 'Renteforvaltning og kredittanalyse',
        bg: 'Spesialisert på rentemarkedene og kredittseleksjon',
      },
      {
        name: 'Mads Opsahl',
        rolle: 'Porteføljeforvalter / analytiker',
        area: 'Analyse og spesialmandater',
        bg: 'Erfaring fra investeringsanalyse og kapitalforvaltning',
      },
    ],
    textBlocks: [
      {
        heading: 'Investeringsprosess',
        body: 'Alle porteføljebeslutninger fattes i investeringskomitéen. Porteføljene rebalanseres regelmessig, med løpende overvåking av risiko, eksponering og markedsutsikter.',
      },
    ],
    version: '2026-03',
    active: true,
    variants: ['kort', 'full'],
  },

  'rapportering': {
    id: 'rapportering',
    title: 'Oppfølging og rapportering',
    subtitle: 'Hva du får tilgang til etter at pengene er investert',
    textBlocks: [],
    features: [
      { title: 'Daglig porteføljeoversikt', desc: 'Logg inn med BankID og se porteføljens utvikling i sanntid – alltid oppdatert med netto avkastning etter alle kostnader.', accent: '6B9DB8' },
      { title: 'Transaksjoner og bevegelser', desc: 'Full oversikt over alle kjøp, salg, rebalanseringer og utbytter. Alt dokumentert og sporbart.', accent: 'C4967E' },
      { title: 'Allokering og mandatetterlevelse', desc: 'Løpende visning av aktivafordeling og produktvekter relativt til mandatet. Avvik flagges og følges opp.', accent: '2D6A6A' },
      { title: 'Samlet kundevisning', desc: 'Se alle dine porteføljer, konti og kundeforhold samlet i ett grensesnitt med helhetlig oversikt.', accent: '0D2841' },
      { title: 'Skatterapportering', desc: 'Årlig skatterapport med oversikt over realisert gevinst, tap, utbytte og relevante beløp til selvangivelsen.', accent: 'A67B3D' },
      { title: 'Markedsbrev og oppdateringer', desc: 'Regelmessige markedskommentarer, porteføljegjennomganger og videooppdateringer fra forvalterteamet.', accent: '2D6A4F' },
    ],
    communicationItems: [
      { label: 'Oppstartsgjennomgang', desc: 'Detaljert gjennomgang av mandat, portefølje og forventninger ved oppstart' },
      { label: 'Kvartalsrapport', desc: 'Skriftlig oppsummering av utvikling, endringer og markedsutsikter' },
      { label: 'Årlig strategimøte', desc: 'Grundig gjennomgang av portefølje, mål, risiko og eventuelle tilpasninger' },
      { label: 'Løpende tilgjengelighet', desc: 'Din rådgiver er tilgjengelig for spørsmål og dialog gjennom året' },
    ],
    version: '2026-03',
    active: true,
    variants: ['kort', 'full'],
  },

  'neste-steg': {
    id: 'neste-steg',
    title: 'Neste steg',
    subtitle: 'Veien videre mot en ferdig investeringsløsning',
    steps: [
      { num: '1', title: 'Gjennomgang av forslaget', desc: 'Vi gjennomgår denne presentasjonen sammen og diskuterer dine mål, preferanser og eventuelle spørsmål.' },
      { num: '2', title: 'Tilpasning og justering', desc: 'Allokering, produktvalg, risikoprofil og horisont justeres etter samtale, slik at løsningen er skreddersydd for deg.' },
      { num: '3', title: 'Kundeetablering', desc: 'Formell prosess med egnethetsvurdering, KYC og avtaleverk i henhold til gjeldende regelverk. Alt håndteres digitalt.' },
      { num: '4', title: 'Implementering og oppstart', desc: 'Porteføljen settes opp, du får tilgang til løpende rapportering, og vi etablerer en fast kommunikasjonsrytme.' },
    ],
    disclaimers: [
      'Denne presentasjonen er en illustrativ investeringsskisse og utgjør ikke personlig investeringsråd eller en individuell egnethetsvurdering.',
      'Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan gå ned så vel som opp.',
      'Før kundeetablering gjennomføres en fullstendig egnethetsvurdering og KYC-prosess.',
      'Alle avkastningstall er oppgitt brutto med mindre annet er spesifisert.',
      'Pensum Asset Management AS har konsesjon fra Finanstilsynet til å drive investeringsrådgivning og aktiv porteføljeforvaltning.',
    ],
    contactInfo: {
      line1: 'Ta kontakt med din rådgiver i Pensum Asset Management for å komme i gang.',
      line2: 'www.pensumgroup.no  |  post@pensumgroup.no  |  +47 22 01 27 00',
    },
    version: '2026-03',
    active: true,
    variants: ['kort', 'full'],
  },

  'viktig-informasjon': {
    id: 'viktig-informasjon',
    title: 'Viktig informasjon',
    subtitle: 'Regulatoriske og juridiske forhold',
    textBlocks: [
      {
        heading: 'Om denne presentasjonen',
        body: 'Denne presentasjonen er utarbeidet av Pensum Asset Management AS og er ment som en illustrativ investeringsskisse. Den utgjør ikke personlig investeringsråd, en individuell egnethetsvurdering eller et tilbud om kjøp eller salg av finansielle instrumenter.',
      },
      {
        heading: 'Historisk avkastning',
        body: 'Historisk avkastning er ingen garanti for fremtidig avkastning. Verdien av investeringer kan gå ned så vel som opp, og investor kan tape hele eller deler av det investerte beløpet. Avkastningstall er oppgitt brutto med mindre annet er spesifisert.',
      },
      {
        heading: 'Risiko',
        body: 'Alle investeringer er forbundet med risiko. Risikonivået avhenger av type investering, markedsforhold og investeringshorisont. Investor bør sette seg grundig inn i risikoen knyttet til de aktuelle produktene og strategiene før en eventuell investering.',
      },
      {
        heading: 'Regulatorisk',
        body: 'Pensum Asset Management AS har konsesjon fra Finanstilsynet til å drive investeringsrådgivning og aktiv porteføljeforvaltning. Før kundeetablering gjennomføres en fullstendig egnethetsvurdering og KYC-prosess i henhold til gjeldende regelverk.',
      },
    ],
    version: '2026-03',
    active: true,
    variants: ['full'],
  },

  'hvorfor-pensum': {
    id: 'hvorfor-pensum',
    title: 'Hvorfor Pensum',
    subtitle: 'Det som gjør oss unike som kapitalforvalter',
    textBlocks: [
      {
        heading: 'Uavhengig rådgivning',
        body: 'Vi er ikke tilknyttet noen bank eller forsikringsselskap, og har ingen egeninteresse i å anbefale bestemte produkter. Våre anbefalinger er utelukkende basert på hva som er best for kunden.',
      },
      {
        heading: 'Institusjonstilgang for private',
        body: 'Vi gir privatpersoner tilgang til forvaltere og andelsklasser som normalt er forbeholdt institusjonelle investorer – med lavere kostnader og bedre vilkår.',
      },
      {
        heading: 'Transparent og digitalt',
        body: 'Full digital tilgang til porteføljeoversikt med BankID. Ingen skjulte kostnader. Tydelig rapportering og løpende dialog.',
      },
    ],
    kpis: [
      { label: 'Uavhengig', value: 'Ingen banktilknytning', color: '0D2841' },
      { label: 'Institusjonstilgang', value: 'Lave andelsklasser', color: '6B9DB8' },
      { label: 'Transparent', value: 'Null skjulte kostnader', color: 'C4967E' },
    ],
    version: '2026-03',
    active: true,
    variants: ['full'],
  },

  'aksjemarkedet-historisk': {
    id: 'aksjemarkedet-historisk',
    title: 'Aksjemarkedet – historisk utvikling',
    subtitle: 'Langsiktig verdiskaping og kortsiktige svingninger',
    textBlocks: [
      {
        heading: 'Langsiktighet lønner seg',
        body: 'Historisk har aksjer levert høyere avkastning enn andre aktivaklasser over tid, men med betydelige svingninger underveis. Investorer som har holdt seg til en langsiktig plan, har historisk blitt belønnet.',
      },
      {
        heading: 'Diversifisering reduserer risiko',
        body: 'En veldiversifisert portefølje med eksponering mot ulike regioner, sektorer og aktivaklasser har historisk gitt bedre risikojustert avkastning enn konsentrerte porteføljer.',
      },
    ],
    version: '2026-03',
    active: true,
    variants: ['full'],
  },
};

/**
 * Get standard slide content by ID.
 * Later: check Admin override first, then fall back to defaults.
 */
export function getStandardSlide(slideId) {
  // TODO: Check Admin API/store for overrides first
  // const adminOverride = await fetchAdminSlide(slideId);
  // if (adminOverride) return adminOverride;
  return STANDARD_SLIDE_DEFAULTS[slideId] || null;
}

/**
 * Get all active standard slides for a given variant ('kort' or 'full').
 */
export function getStandardSlidesForVariant(variant = 'kort') {
  return Object.values(STANDARD_SLIDE_DEFAULTS)
    .filter(s => s.active && s.variants.includes(variant));
}
