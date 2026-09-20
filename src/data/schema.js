// Admin form definitions. Field types: text | textarea | lines | image | select | boolean | date | repeater

const LINES = 'One item per line.'
const TITLED = 'One item per line, format: Title: text.'
const TABLE = 'One row per line; separate columns with | (vertical bar).'

export const SITE_GROUPS = [
  {
    id: 'brand',
    title: 'Identity & Hero',
    desc: 'Organization name, logo and the main text of the home page.',
    fields: [
      { key: 'orgName', label: 'Organization name', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'tagline', label: 'Tagline', type: 'text' },
      { key: 'logo', label: 'Logo (if empty, the default logo is shown)', type: 'image', folder: 'brand', png: true },
      { key: 'heroTitle', label: 'Hero title', type: 'text' },
      { key: 'heroText', label: 'Hero text', type: 'textarea', rows: 3 },
      { key: 'summary', label: 'Executive summary', type: 'textarea', rows: 8, help: 'Shown on the home page. Separate paragraphs with a blank line.' },
      { key: 'glance', label: 'RDA at a Glance', type: 'lines', rows: 6, help: TABLE + ' Example: Headquarters | Mogadishu' },
      { key: 'stats', label: 'Home page numbers (count-up)', type: 'lines', rows: 5, help: 'One number per line, format: Number | Label. Example: 4 | Thematic pillars. Leave empty to hide.' },
    ],
  },
  {
    id: 'contact',
    title: 'Contact & Social',
    desc: 'Phone numbers, email, address and social media links.',
    fields: [
      { key: 'phones', label: 'Phone numbers', type: 'lines', rows: 4, help: 'One number per line.' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'website', label: 'Website', type: 'text' },
      { key: 'address', label: 'Address', type: 'text' },
      { key: 'executiveDirector', label: 'Executive Director', type: 'text' },
      { key: 'contactIntro', label: 'Contact page intro text', type: 'textarea', rows: 3 },
      { key: 'facebook', label: 'Facebook (URL)', type: 'text' },
      { key: 'twitter', label: 'X / Twitter (URL)', type: 'text' },
      { key: 'linkedin', label: 'LinkedIn (URL)', type: 'text' },
      { key: 'instagram', label: 'Instagram (URL)', type: 'text' },
      { key: 'youtube', label: 'YouTube (URL)', type: 'text' },
    ],
  },
  {
    id: 'about',
    title: 'About',
    desc: 'Texts of the About page: who we are, vision, mission and strategy.',
    fields: [
      { key: 'aboutImage', label: 'About page image', type: 'image', folder: 'about' },
      { key: 'whoWeAre', label: 'Who we are', type: 'textarea', rows: 10, help: 'Separate paragraphs with a blank line.' },
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
    title: 'Programs page texts',
    desc: 'Core services, cross-cutting, methodology, MEAL, climate and policy.',
    fields: [
      { key: 'coreServices', label: 'Core service lines', type: 'lines', rows: 5, help: TITLED },
      { key: 'crossCutting', label: 'Cross-cutting commitments', type: 'lines', rows: 5, help: TITLED },
      { key: 'methodology', label: 'Implementation methodology', type: 'textarea', rows: 5 },
      { key: 'meal', label: 'MEAL', type: 'textarea', rows: 8, help: 'Separate paragraphs with a blank line.' },
      { key: 'climate', label: 'Climate & environmental resilience', type: 'textarea', rows: 5 },
      { key: 'policy', label: 'Policy engagement & knowledge', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'where',
    title: 'Where We Work',
    desc: 'Intro text of the Where we work page.',
    fields: [{ key: 'geographicIntro', label: 'Geographic footprint (intro)', type: 'textarea', rows: 4 }],
  },
  {
    id: 'leadership',
    title: 'Leadership, Board & Governance',
    desc: 'Texts of the Leadership page.',
    fields: [
      { key: 'leadershipIntro', label: 'Leadership intro', type: 'textarea', rows: 4 },
      { key: 'boardText', label: 'Board of Directors', type: 'textarea', rows: 8, help: 'Separate paragraphs with a blank line.' },
      { key: 'governanceText', label: 'Governance structure', type: 'textarea', rows: 7 },
      { key: 'orgChartImage', label: 'Organizational structure image (if empty, the default is used)', type: 'image', folder: 'about' },
      { key: 'staffing', label: 'Staffing & professional development', type: 'textarea', rows: 4 },
      { key: 'safeguarding', label: 'Code of conduct & safeguarding', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'impact',
    title: 'Impact & Priorities',
    desc: 'Track record, sector impact and strategic priorities.',
    fields: [
      { key: 'trackRecord', label: 'Track record', type: 'lines', rows: 6, help: TITLED },
      { key: 'impactSectors', label: 'Illustrative impact by sector', type: 'lines', rows: 7, help: TABLE + ' Format: Sector | Intervention | Approach' },
      { key: 'priorities', label: 'Strategic priorities: looking ahead', type: 'lines', rows: 7, help: TITLED },
    ],
  },
  {
    id: 'partner',
    title: 'Partner with RDA',
    desc: 'Why partner, compliance, finance, audit and risk.',
    fields: [
      { key: 'whyPartner', label: 'Why partner with RDA', type: 'lines', rows: 7, help: TITLED },
      { key: 'offers', label: 'What we offer our partners', type: 'lines', rows: 4, help: LINES },
      { key: 'partnerships', label: 'Partnerships & coordination', type: 'textarea', rows: 6 },
      { key: 'financeText', label: 'Financial systems & procurement', type: 'textarea', rows: 5 },
      { key: 'auditText', label: 'Audit', type: 'textarea', rows: 3 },
      { key: 'riskText', label: 'Risk management', type: 'textarea', rows: 4 },
      { key: 'compliance', label: 'Donor compliance table', type: 'lines', rows: 5, help: TABLE + ' Format: Donor category | Compliance focus' },
    ],
  },
]

export const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'indigo', label: 'Indigo (purple-blue)' },
]

export const ICON_OPTIONS = [
  { value: 'heart', label: 'Heart (Health)' },
  { value: 'shield', label: 'Shield (Protection)' },
  { value: 'leaf', label: 'Leaf (Environment)' },
  { value: 'landmark', label: 'Landmark (Governance)' },
  { value: 'droplets', label: 'Droplets (WASH)' },
  { value: 'book', label: 'Book (Education)' },
]

export const NEWS_CATEGORIES = ['News', 'Press release', 'Project update', 'Story', 'Event', 'Report', 'Announcement']

// ---- CRUD collections ----
export const HERO_FIELDS = [
  { key: 'image', label: 'Hero image (appears on the home page right away)', type: 'image', folder: 'hero', required: true },
  { key: 'caption', label: 'Caption (shown inside the image; if empty, the Hero title is used)', type: 'text' },
  { key: 'link', label: 'Link (optional) — where the caption goes when clicked', type: 'text', help: 'Example: /news or https://…' },
]

export const PROGRAM_FIELDS = [
  { key: 'title', label: 'Program title', type: 'text', required: true },
  { key: 'subtitle', label: 'Subtitle (example: Health · Nutrition · Education)', type: 'text' },
  { key: 'description', label: 'Short description', type: 'textarea', rows: 3 },
  { key: 'color', label: 'Color', type: 'select', options: COLOR_OPTIONS },
  { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS },
  { key: 'image', label: 'Image', type: 'image', folder: 'programs' },
  {
    key: 'sectors',
    label: 'Sub-sectors',
    type: 'repeater',
    addLabel: 'Add sub-sector',
    fields: [
      { key: 'name', label: 'Sub-sector name', type: 'text' },
      { key: 'interventions', label: 'Interventions (one per line)', type: 'textarea', rows: 4 },
    ],
  },
]

export const REGION_FIELDS = [
  { key: 'name', label: 'Location name', type: 'text', required: true },
  { key: 'kind', label: 'Type of presence (Head Office, Regional office, Field presence)', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Image', type: 'image', folder: 'regions' },
]

export const TEAM_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'position', label: 'Position', type: 'text', required: true },
  { key: 'specialty', label: 'Specialty', type: 'text' },
  {
    key: 'group',
    label: 'Group',
    type: 'select',
    options: [
      { value: 'leadership', label: 'Senior Leadership' },
      { value: 'board', label: 'Board of Directors' },
    ],
  },
  { key: 'photo', label: 'Photo', type: 'image', folder: 'team' },
  { key: 'bio', label: 'Bio', type: 'textarea', rows: 7 },
]

export const NEWS_FIELDS = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'category', label: 'Category', type: 'select', options: NEWS_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'image', label: 'Main image', type: 'image', folder: 'news' },
  { key: 'excerpt', label: 'Short summary', type: 'textarea', rows: 2 },
  { key: 'body', label: 'Full text', type: 'textarea', rows: 12, help: 'Separate paragraphs with a blank line.', required: true },
  { key: 'published', label: 'Published (visible on the website)', type: 'boolean' },
]

export const PARTNER_FIELDS = [
  { key: 'name', label: 'Partner name', type: 'text', required: true },
  { key: 'logo', label: 'Logo', type: 'image', folder: 'partners', png: true },
  { key: 'url', label: 'Website (optional)', type: 'text' },
]

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard', path: '', icon: 'dashboard', always: true },
  { key: 'hero', label: 'Hero Images', path: 'hero', icon: 'image' },
  { key: 'site', label: 'Website Info', path: 'site', icon: 'globe' },
  { key: 'content', label: 'Page Content', path: 'content', icon: 'file' },
  { key: 'menu', label: 'Navbar & Dropdowns', path: 'menu', icon: 'menu' },
  { key: 'programs', label: 'Programs', path: 'programs', icon: 'layers' },
  { key: 'regions', label: 'Where We Work', path: 'regions', icon: 'map' },
  { key: 'team', label: 'Leadership & Board', path: 'team', icon: 'users' },
  { key: 'news', label: 'News', path: 'news', icon: 'news' },
  { key: 'gallery', label: 'Gallery', path: 'gallery', icon: 'gallery' },
  { key: 'partners', label: 'Partners', path: 'partners', icon: 'handshake' },
  { key: 'messages', label: 'Messages', path: 'messages', icon: 'inbox' },
  { key: 'admins', label: 'Sub Admins', path: 'admins', icon: 'usercog', superOnly: true },
  { key: 'account', label: 'Account Settings', path: 'account', icon: 'settings', always: true },
]