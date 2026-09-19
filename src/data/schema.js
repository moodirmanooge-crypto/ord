// Qeexitaanka foomamka admin-ka. Nooc kasta: text | textarea | lines | image | select | boolean | date | repeater

const LINES = 'Sadar kasta = hal shay.'
const TITLED = 'Sadar kasta = hal shay, qaabka: Cinwaan: qoraalka.'
const TABLE = 'Sadar kasta = hal safaf, tiirarka ku kala saar |  (xarafka toosan).'

export const SITE_GROUPS = [
  {
    id: 'brand',
    title: 'Aqoonsiga & Hero',
    desc: 'Magaca, logo-ga iyo qoraalka ugu weyn ee bogga hore.',
    fields: [
      { key: 'orgName', label: 'Magaca ururka', type: 'text' },
      { key: 'country', label: 'Dalka', type: 'text' },
      { key: 'tagline', label: 'Shiraaca (Tagline)', type: 'text' },
      { key: 'logo', label: 'Logo (haddii madhan yahay, logo-ga asalka ah ayaa muuqda)', type: 'image', folder: 'brand', png: true },
      { key: 'heroTitle', label: 'Cinwaanka Hero', type: 'text' },
      { key: 'heroText', label: 'Qoraalka Hero', type: 'textarea', rows: 3 },
      { key: 'summary', label: 'Soo koobid (Executive Summary)', type: 'textarea', rows: 8, help: 'Baro qoraalka bogga hore. Fal madhan ku kala saar paragraph-yada.' },
      { key: 'glance', label: 'RDA at a Glance', type: 'lines', rows: 6, help: TABLE + ' Tusaale: Headquarters | Mogadishu' },
    ],
  },
  {
    id: 'contact',
    title: 'Xiriirka & Bulshada',
    desc: 'Telefoonada, email-ka, cinwaanka iyo lifaaqyada bulshada.',
    fields: [
      { key: 'phones', label: 'Telefoonada', type: 'lines', rows: 4, help: 'Lambar kasta sadar u gaar ah.' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'website', label: 'Website', type: 'text' },
      { key: 'address', label: 'Cinwaanka', type: 'text' },
      { key: 'executiveDirector', label: 'Executive Director', type: 'text' },
      { key: 'contactIntro', label: 'Qoraalka bogga Contact', type: 'textarea', rows: 3 },
      { key: 'facebook', label: 'Facebook (URL)', type: 'text' },
      { key: 'twitter', label: 'X / Twitter (URL)', type: 'text' },
      { key: 'linkedin', label: 'LinkedIn (URL)', type: 'text' },
      { key: 'instagram', label: 'Instagram (URL)', type: 'text' },
      { key: 'youtube', label: 'YouTube (URL)', type: 'text' },
    ],
  },
  {
    id: 'about',
    title: 'Ku saabsan (About)',
    desc: 'Qoraallada bogga About: who we are, vision, mission, strategy.',
    fields: [
      { key: 'aboutImage', label: 'Sawirka bogga About', type: 'image', folder: 'about' },
      { key: 'whoWeAre', label: 'Who we are', type: 'textarea', rows: 10, help: 'Fal madhan ku kala saar paragraph-yada.' },
      { key: 'foundingRationale', label: 'Founding rationale', type: 'textarea', rows: 5 },
      { key: 'legalStatus', label: 'Legal status', type: 'textarea', rows: 4 },
      { key: 'vision', label: 'Vision', type: 'textarea', rows: 3 },
      { key: 'mission', label: 'Mission', type: 'textarea', rows: 3 },
      { key: 'values', label: 'Core values', type: 'lines', rows: 6, help: TITLED },
      { key: 'strategicGoal', label: 'Strategic goal', type: 'textarea', rows: 4 },
      { key: 'objectives', label: 'Objectives', type: 'lines', rows: 7, help: LINES },
      { key: 'theoryIf', label: 'Theory of Change — IF', type: 'textarea', rows: 3 },
      { key: 'theoryAndIf', label: 'Theory of Change — AND IF', type: 'textarea', rows: 3 },
      { key: 'theoryThen', label: 'Theory of Change — THEN', type: 'textarea', rows: 3 },
      { key: 'theoryBecause', label: 'Theory of Change — BECAUSE', type: 'textarea', rows: 3 },
      { key: 'alignment', label: 'Alignment with global & national frameworks', type: 'textarea', rows: 4 },
    ],
  },
]

export const CONTENT_GROUPS = [
  {
    id: 'programs-text',
    title: 'Qoraallada Barnaamijyada',
    desc: 'Core services, cross-cutting, methodology, MEAL, climate iyo policy.',
    fields: [
      { key: 'coreServices', label: 'Core service lines', type: 'lines', rows: 5, help: TITLED },
      { key: 'crossCutting', label: 'Cross-cutting commitments', type: 'lines', rows: 5, help: TITLED },
      { key: 'methodology', label: 'Implementation methodology', type: 'textarea', rows: 5 },
      { key: 'meal', label: 'MEAL', type: 'textarea', rows: 8, help: 'Fal madhan ku kala saar paragraph-yada.' },
      { key: 'climate', label: 'Climate & environmental resilience', type: 'textarea', rows: 5 },
      { key: 'policy', label: 'Policy engagement & knowledge', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'where',
    title: 'Goobaha Shaqada',
    desc: 'Qoraalka hordhaca ah ee bogga Where we work.',
    fields: [{ key: 'geographicIntro', label: 'Geographic footprint (hordhac)', type: 'textarea', rows: 4 }],
  },
  {
    id: 'leadership',
    title: 'Hoggaanka, Board & Governance',
    desc: 'Qoraallada bogga Leadership.',
    fields: [
      { key: 'leadershipIntro', label: 'Leadership hordhac', type: 'textarea', rows: 4 },
      { key: 'boardText', label: 'Board of Directors', type: 'textarea', rows: 8, help: 'Fal madhan ku kala saar paragraph-yada.' },
      { key: 'governanceText', label: 'Governance structure', type: 'textarea', rows: 7 },
      { key: 'orgChartImage', label: 'Sawirka Organizational Structure (haddii madhan, kan asalka ah)', type: 'image', folder: 'about' },
      { key: 'staffing', label: 'Staffing & professional development', type: 'textarea', rows: 4 },
      { key: 'safeguarding', label: 'Code of conduct & safeguarding', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'impact',
    title: 'Impact & Priorities',
    desc: 'Track record, sector impact iyo strategic priorities.',
    fields: [
      { key: 'trackRecord', label: 'Track record', type: 'lines', rows: 6, help: TITLED },
      { key: 'impactSectors', label: 'Illustrative impact by sector', type: 'lines', rows: 7, help: TABLE + ' Qaabka: Sector | Intervention | Approach' },
      { key: 'priorities', label: 'Strategic priorities: looking ahead', type: 'lines', rows: 7, help: TITLED },
    ],
  },
  {
    id: 'partner',
    title: 'Partner with RDA',
    desc: 'Why partner, compliance, finance, audit iyo risk.',
    fields: [
      { key: 'whyPartner', label: 'Why partner with RDA', type: 'lines', rows: 7, help: TITLED },
      { key: 'offers', label: 'What we offer our partners', type: 'lines', rows: 4, help: LINES },
      { key: 'partnerships', label: 'Partnerships & coordination', type: 'textarea', rows: 6 },
      { key: 'financeText', label: 'Financial systems & procurement', type: 'textarea', rows: 5 },
      { key: 'auditText', label: 'Audit', type: 'textarea', rows: 3 },
      { key: 'riskText', label: 'Risk management', type: 'textarea', rows: 4 },
      { key: 'compliance', label: 'Donor compliance table', type: 'lines', rows: 5, help: TABLE + ' Qaabka: Donor category | Compliance focus' },
    ],
  },
]

export const COLOR_OPTIONS = [
  { value: 'blue', label: 'Buluug' },
  { value: 'red', label: 'Casaan' },
  { value: 'green', label: 'Cagaar' },
  { value: 'indigo', label: 'Indigo (Guduud-buluug)' },
]

export const ICON_OPTIONS = [
  { value: 'heart', label: 'Wadne (Health)' },
  { value: 'shield', label: 'Gaashaan (Protection)' },
  { value: 'leaf', label: 'Caleen (Environment)' },
  { value: 'landmark', label: 'Dhisme (Governance)' },
  { value: 'droplets', label: 'Biyo (WASH)' },
  { value: 'book', label: 'Buug (Education)' },
]

export const NEWS_CATEGORIES = ['News', 'Press release', 'Project update', 'Story', 'Event', 'Report', 'Announcement']

// ---- CRUD collections ----
export const HERO_FIELDS = [
  { key: 'image', label: 'Sawirka Hero', type: 'image', folder: 'hero', required: true },
  { key: 'caption', label: 'Qoraal gaaban (ikhtiyaari)', type: 'text' },
]

export const PROGRAM_FIELDS = [
  { key: 'title', label: 'Cinwaanka barnaamijka', type: 'text', required: true },
  { key: 'subtitle', label: 'Cinwaan hoose (tusaale: Health · Nutrition · Education)', type: 'text' },
  { key: 'description', label: 'Sharaxaad gaaban', type: 'textarea', rows: 3 },
  { key: 'color', label: 'Midabka', type: 'select', options: COLOR_OPTIONS },
  { key: 'icon', label: 'Astaanta', type: 'select', options: ICON_OPTIONS },
  { key: 'image', label: 'Sawir', type: 'image', folder: 'programs' },
  {
    key: 'sectors',
    label: 'Qaybaha hoose (Sub-sectors)',
    type: 'repeater',
    addLabel: 'Ku dar qayb',
    fields: [
      { key: 'name', label: 'Magaca qaybta', type: 'text' },
      { key: 'interventions', label: 'Interventions (sadar kasta hal)', type: 'textarea', rows: 4 },
    ],
  },
]

export const REGION_FIELDS = [
  { key: 'name', label: 'Magaca goobta', type: 'text', required: true },
  { key: 'kind', label: 'Nooca joogitaanka (Head Office, Regional office, Field presence)', type: 'text' },
  { key: 'description', label: 'Sharaxaad', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Sawir', type: 'image', folder: 'regions' },
]

export const TEAM_FIELDS = [
  { key: 'name', label: 'Magaca', type: 'text', required: true },
  { key: 'position', label: 'Jagada', type: 'text', required: true },
  { key: 'specialty', label: 'Xirfadda / Specialty', type: 'text' },
  {
    key: 'group',
    label: 'Kooxda',
    type: 'select',
    options: [
      { value: 'leadership', label: 'Senior Leadership' },
      { value: 'board', label: 'Board of Directors' },
    ],
  },
  { key: 'photo', label: 'Sawirka', type: 'image', folder: 'team' },
  { key: 'bio', label: 'Bio', type: 'textarea', rows: 7 },
]

export const NEWS_FIELDS = [
  { key: 'title', label: 'Cinwaanka', type: 'text', required: true },
  { key: 'category', label: 'Nooca', type: 'select', options: NEWS_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'date', label: 'Taariikhda', type: 'date' },
  { key: 'image', label: 'Sawirka ugu weyn', type: 'image', folder: 'news' },
  { key: 'excerpt', label: 'Soo koobid gaaban', type: 'textarea', rows: 2 },
  { key: 'body', label: 'Qoraalka oo dhan', type: 'textarea', rows: 12, help: 'Fal madhan ku kala saar paragraph-yada.', required: true },
  { key: 'published', label: 'Daabac (muuji website-ka)', type: 'boolean' },
]

export const PARTNER_FIELDS = [
  { key: 'name', label: 'Magaca iskaashiga', type: 'text', required: true },
  { key: 'logo', label: 'Logo', type: 'image', folder: 'partners', png: true },
  { key: 'url', label: 'Website (ikhtiyaari)', type: 'text' },
]

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard', path: '', icon: 'dashboard', always: true },
  { key: 'hero', label: 'Hero Sawirada', path: 'hero', icon: 'image' },
  { key: 'site', label: 'Macluumaadka Website', path: 'site', icon: 'globe' },
  { key: 'content', label: 'Qoraallada Bogagga', path: 'content', icon: 'file' },
  { key: 'programs', label: 'Barnaamijyada', path: 'programs', icon: 'layers' },
  { key: 'regions', label: 'Goobaha Shaqada', path: 'regions', icon: 'map' },
  { key: 'team', label: 'Hoggaanka & Board', path: 'team', icon: 'users' },
  { key: 'news', label: 'Wararka', path: 'news', icon: 'news' },
  { key: 'gallery', label: 'Gallery', path: 'gallery', icon: 'gallery' },
  { key: 'partners', label: 'Iskaashatada', path: 'partners', icon: 'handshake' },
  { key: 'messages', label: 'Fariimaha', path: 'messages', icon: 'inbox' },
  { key: 'admins', label: 'Sub Admins', path: 'admins', icon: 'usercog', superOnly: true },
  { key: 'account', label: 'Habaynta Account-ka', path: 'account', icon: 'settings', always: true },
]
