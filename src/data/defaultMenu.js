// Menu-ka asalka ah ee website-ka (waa isla kii hore). Admin panel-ka ayaa wax walba ka beddeli kara.
// kind: 'route' = bog jira | 'page' = bog cusub (macluumaadkiisa admin ayaa qora) | 'url' = link | 'none' = magaca kaliya (dropdown)
export const DEFAULT_MENU = [
  { id: 'home', label: 'Home', type: 'link', kind: 'route', to: '/', slug: '', newTab: false, autoPrograms: false, visible: true, children: [] },
  {
    id: 'about',
    label: 'About',
    type: 'dropdown',
    kind: 'route',
    to: '/about',
    slug: '',
    newTab: false,
    autoPrograms: false,
    visible: true,
    children: [
      { id: 'about-who', label: 'Who we are', kind: 'route', to: '/about', slug: '', newTab: false, visible: true },
      { id: 'about-vision', label: 'Vision, mission & values', kind: 'route', to: '/about#vision', slug: '', newTab: false, visible: true },
      { id: 'about-strategy', label: 'Strategy & theory of change', kind: 'route', to: '/about#strategy', slug: '', newTab: false, visible: true },
      { id: 'about-leadership', label: 'Leadership & Board', kind: 'route', to: '/leadership', slug: '', newTab: false, visible: true },
    ],
  },
  { id: 'programs', label: 'Programs', type: 'dropdown', kind: 'route', to: '/programs', slug: '', newTab: false, autoPrograms: true, visible: true, children: [] },
  { id: 'where', label: 'Where we work', type: 'link', kind: 'route', to: '/where-we-work', slug: '', newTab: false, autoPrograms: false, visible: true, children: [] },
  { id: 'impact', label: 'Impact', type: 'link', kind: 'route', to: '/impact', slug: '', newTab: false, autoPrograms: false, visible: true, children: [] },
  {
    id: 'media',
    label: 'Media',
    type: 'dropdown',
    kind: 'route',
    to: '/news',
    slug: '',
    newTab: false,
    autoPrograms: false,
    visible: true,
    children: [
      { id: 'media-news', label: 'News & updates', kind: 'route', to: '/news', slug: '', newTab: false, visible: true },
      { id: 'media-gallery', label: 'Photo gallery', kind: 'route', to: '/gallery', slug: '', newTab: false, visible: true },
    ],
  },
  { id: 'contact', label: 'Contact', type: 'link', kind: 'route', to: '/contact', slug: '', newTab: false, autoPrograms: false, visible: true, children: [] },
]