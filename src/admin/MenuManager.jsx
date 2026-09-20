import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  ImagePlus,
  Images,
  Layers,
  Link2,
  MousePointerClick,
  Pencil,
  Plus,
  Route,
  Trash2,
  Video,
} from 'lucide-react'
import { db, COL } from '../firebase'
import { CONTENT_GROUPS, SITE_GROUPS } from '../data/schema'
import { useContent, useRawCollection, useSite } from '../lib/data'
import { uploadImage, uploadVideo } from '../lib/image'
import { MEDIA_COL, parseVideo } from '../lib/media'
import { buildNav, resolveTo } from '../lib/menu'
import { seedCollection, saveSite } from '../lib/seed'
import { slugify } from '../lib/text'
import { Loading, Modal, useLogo } from '../components/ui'
import { Field } from './fields'
import { useToast } from './toast'
import '../styles/menu-admin.css'
import '../styles/menu-media.css'

const rid = () => Math.random().toString(36).slice(2, 9)
const ACCENTS = ['blue', 'green', 'red', 'indigo']

const ROUTES = [
  ['/', 'Home'],
  ['/about', 'About — Who we are'],
  ['/about#vision', 'About — Vision, mission & values'],
  ['/about#strategy', 'About — Strategy & theory of change'],
  ['/leadership', 'Leadership & Board'],
  ['/programs', 'Programs (all)'],
  ['/where-we-work', 'Where we work'],
  ['/impact', 'Impact'],
  ['/partner', 'Partner with us'],
  ['/news', 'News & updates'],
  ['/gallery', 'Photo gallery'],
  ['/contact', 'Contact'],
]

const KINDS = [
  { value: 'route', label: 'Existing page', hint: 'A page that already exists on the website', icon: Route },
  { value: 'page', label: 'New page', hint: 'Create a new page and write its content', icon: FileText },
  { value: 'url', label: 'Link', hint: 'An external link or a custom path', icon: Link2 },
]
const KIND_NONE = { value: 'none', label: 'Name only', hint: 'It only opens the dropdown', icon: MousePointerClick }

// Which existing website texts each page shows — these are edited in the "Current content" tab.
const ROUTE_FIELDS = {
  '/': ['heroTitle', 'heroText', 'summary', 'glance', 'stats'],
  '/about': ['aboutImage', 'whoWeAre', 'foundingRationale', 'legalStatus'],
  '/about#vision': ['vision', 'mission', 'values'],
  '/about#strategy': ['strategicGoal', 'objectives', 'theoryIf', 'theoryAndIf', 'theoryThen', 'theoryBecause', 'alignment'],
  '/leadership': ['leadershipIntro', 'boardText', 'governanceText', 'orgChartImage', 'staffing', 'safeguarding'],
  '/programs': ['coreServices', 'crossCutting', 'methodology', 'meal', 'climate', 'policy'],
  '/where-we-work': ['geographicIntro'],
  '/impact': ['trackRecord', 'impactSectors', 'priorities'],
  '/partner': ['whyPartner', 'offers', 'partnerships', 'financeText', 'auditText', 'riskText', 'compliance'],
  '/contact': ['contactIntro', 'address', 'phones', 'email', 'website', 'executiveDirector'],
}
const FIELD_INDEX = Object.fromEntries([...SITE_GROUPS, ...CONTENT_GROUPS].flatMap((g) => g.fields.map((f) => [f.key, f])))

// Pages whose content also lives in another admin section
const managerFor = (to = '') => {
  if (to === '/news') return ['News', '/admin/news']
  if (to === '/gallery') return ['Gallery', '/admin/gallery']
  if (to === '/programs' || to.startsWith('/programs#')) return ['Programs', '/admin/programs']
  if (to === '/where-we-work') return ['Where We Work', '/admin/regions']
  if (to === '/leadership') return ['Leadership & Board', '/admin/team']
  return null
}

const PAGE_FIELDS = [
  { key: 'title', label: 'Page title', type: 'text', required: true },
  { key: 'intro', label: 'Short intro (shown under the title)', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Main image', type: 'image', folder: 'pages' },
  {
    key: 'sections',
    label: 'Page sections',
    type: 'repeater',
    addLabel: 'Add section',
    fields: [
      { key: 'heading', label: 'Section heading', type: 'text' },
      { key: 'text', label: 'Text', type: 'textarea', rows: 6, help: 'Separate paragraphs with a blank line. "## " = small heading, "- " = list.' },
      { key: 'image', label: 'Image (optional)', type: 'image', folder: 'pages' },
    ],
  },
  {
    key: 'gallery',
    label: 'Extra images (gallery)',
    type: 'repeater',
    addLabel: 'Add image',
    fields: [
      { key: 'image', label: 'Image', type: 'image', folder: 'pages' },
      { key: 'caption', label: 'Short caption', type: 'text' },
    ],
  },
  { key: 'ctaLabel', label: 'Button text (optional)', type: 'text' },
  { key: 'ctaUrl', label: 'Where the button goes', type: 'text', help: 'Example: /contact or https://…' },
  { key: 'published', label: 'Published (visible on the website)', type: 'boolean' },
]

const uniqueSlug = (label, pages) => {
  const base = slugify(label) || 'page'
  let s = base
  let n = 2
  while (pages.some((p) => p.slug === s || p.id === s)) s = `${base}-${n++}`
  return s
}

const destText = (it) => {
  if (it.kind === 'page') return it.slug ? `/p/${it.slug}` : 'New page'
  if (it.kind === 'none' || !resolveTo(it)) return 'No link — it only opens the dropdown'
  return resolveTo(it)
}
const kindMeta = (k) => [...KINDS, KIND_NONE].find((x) => x.value === k) || KINDS[0]

/* ------------------------------------------------------------------ */
/*  Photos & videos panel                                              */
/* ------------------------------------------------------------------ */
function MediaPanel({ draft, setDraft }) {
  const toast = useToast()
  const [jobs, setJobs] = useState([])
  const [showLink, setShowLink] = useState(false)
  const [link, setLink] = useState('')
  const imgInput = useRef(null)
  const vidInput = useRef(null)

  const job = (name, kind) => {
    const id = rid()
    setJobs((j) => [...j, { id, name, kind, progress: 0 }])
    return {
      progress: (p) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, progress: p } : x))),
      done: () => setJobs((j) => j.filter((x) => x.id !== id)),
    }
  }

  async function addImages(files) {
    for (const file of Array.from(files || [])) {
      const j = job(file.name, 'image')
      try {
        const url = await uploadImage(file, { folder: 'media', onProgress: j.progress })
        setDraft((d) => [...d, { type: 'image', url, caption: '', source: 'upload' }])
      } catch (e) {
        toast(e.message || 'The image could not be uploaded.', 'err')
      } finally {
        j.done()
      }
    }
  }

  async function addVideoFile(file) {
    if (!file) return
    const j = job(file.name, 'video')
    try {
      const url = await uploadVideo(file, { onProgress: j.progress })
      setDraft((d) => [...d, { type: 'video', url, caption: '', source: 'upload' }])
    } catch (e) {
      toast(e.message || 'The video could not be uploaded.', 'err')
    } finally {
      j.done()
    }
  }

  function addLink() {
    const u = link.trim()
    if (!/^https?:\/\//i.test(u)) return toast('Enter a full link that starts with https://', 'err')
    setDraft((d) => [...d, { type: 'video', url: u, caption: '', source: 'link' }])
    setLink('')
    setShowLink(false)
  }

  const setCaption = (i, caption) => setDraft((d) => d.map((x, k) => (k === i ? { ...x, caption } : x)))
  const remove = (i) => setDraft((d) => d.filter((_, k) => k !== i))
  const move = (i, dir) =>
    setDraft((d) => {
      const j = i + dir
      if (j < 0 || j >= d.length) return d
      const a = [...d]
      ;[a[i], a[j]] = [a[j], a[i]]
      return a
    })

  return (
    <div className="mp">
      <p className="mm-hint">
        Photos and videos added here appear at the bottom of the page this menu item opens. Add one image or many, and videos too. The order below is the order on the website.
      </p>

      <div className="mp-bar">
        <button type="button" className="btn-secondary" onClick={() => imgInput.current?.click()}>
          <ImagePlus size={18} /> Upload images
        </button>
        <button type="button" className="btn-secondary" onClick={() => vidInput.current?.click()}>
          <Video size={18} /> Upload video
        </button>
        <button type="button" className="btn-secondary" onClick={() => setShowLink((v) => !v)}>
          <Link2 size={18} /> Add video link
        </button>
        <input ref={imgInput} type="file" accept="image/*" multiple hidden onChange={(e) => (addImages(e.target.files), (e.target.value = ''))} />
        <input ref={vidInput} type="file" accept="video/*" hidden onChange={(e) => (addVideoFile(e.target.files?.[0]), (e.target.value = ''))} />
      </div>

      {showLink && (
        <div className="mp-link">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste a YouTube, Vimeo or direct video link (https://…)"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
            autoFocus
          />
          <button type="button" className="btn-primary" onClick={addLink}>
            Add
          </button>
        </div>
      )}

      {jobs.length > 0 && (
        <ul className="mp-jobs">
          {jobs.map((j) => (
            <li key={j.id}>
              <span>
                Uploading {j.kind}: {j.name}
              </span>
              <div className="progress">
                <span style={{ width: `${Math.max(j.progress, 6)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {draft.length === 0 && jobs.length === 0 ? (
        <div className="mp-empty">
          <Images size={30} />
          <p>No photos or videos yet.</p>
        </div>
      ) : (
        <ul className="mp-grid">
          {draft.map((d, i) => {
            const v = d.type === 'video' ? parseVideo(d.url) : null
            return (
              <li className="mp-tile" key={d.id || `${d.url.slice(-24)}-${i}`}>
                <div className="mp-thumb">
                  {d.type === 'image' ? (
                    <img src={d.url} alt="" />
                  ) : v.thumb ? (
                    <img src={v.thumb} alt="" />
                  ) : v.kind === 'file' ? (
                    <video src={`${d.url}#t=0.5`} preload="metadata" muted playsInline />
                  ) : (
                    <div className="mp-vph">
                      <Video size={34} />
                    </div>
                  )}
                  <span className={`mp-badge ${d.type}`}>{d.type === 'image' ? 'Image' : v.kind === 'youtube' ? 'YouTube' : v.kind === 'vimeo' ? 'Vimeo' : 'Video'}</span>
                </div>
                <input className="mp-cap" value={d.caption} onChange={(e) => setCaption(i, e.target.value)} placeholder="Caption (optional)" />
                <div className="mp-tools">
                  <button type="button" className="mm-ic" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">
                    <ChevronLeft size={17} />
                  </button>
                  <button type="button" className="mm-ic" onClick={() => move(i, 1)} disabled={i === draft.length - 1} aria-label="Move later">
                    <ChevronRight size={17} />
                  </button>
                  <button type="button" className="mm-ic danger" onClick={() => remove(i)} aria-label="Remove">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Editor: a top-level menu item or an item inside a dropdown         */
/* ------------------------------------------------------------------ */
function ItemEditor({ ctx, pages, mediaDocs, programs, onClose, onSave }) {
  const toast = useToast()
  const { site } = useSite()
  const isTop = ctx.mode === 'top'
  const [targetId] = useState(() => ctx.item?.id || (isTop ? doc(collection(db, COL.menu)).id : rid()))
  const [v, setV] = useState(() => ({
    label: '',
    type: isTop ? 'dropdown' : 'link',
    kind: isTop ? 'none' : 'page',
    to: '',
    slug: '',
    newTab: false,
    autoPrograms: false,
    visible: true,
    ...(ctx.item || {}),
  }))
  const existing = pages.find((p) => v.slug && (p.slug === v.slug || p.id === v.slug))
  const [p, setP] = useState(() => ({ title: '', intro: '', image: '', sections: [], gallery: [], ctaLabel: '', ctaUrl: '', published: true, ...(existing || {}) }))
  const original = useRef(
    mediaDocs
      .filter((m) => m.target === targetId)
      .map((m) => ({ id: m.id, type: m.type || 'image', url: m.url, caption: m.caption || '', source: m.source || 'upload' })),
  )
  const [draft, setDraft] = useState(() => original.current.map((m) => ({ ...m })))
  const [sv, setSv] = useState({}) // edited website texts (only the ones the admin touched)
  const [tab, setTab] = useState(ctx.tab || 'menu')
  const [saving, setSaving] = useState(false)
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }))
  const isDrop = isTop && v.type === 'dropdown'
  const kinds = isDrop ? [KIND_NONE, ...KINDS] : KINDS
  const hasPage = v.kind === 'route' || v.kind === 'page'

  // A direct link cannot be "name only"
  useEffect(() => {
    if (isTop && v.type === 'link' && v.kind === 'none') setV((s) => ({ ...s, kind: 'route' }))
  }, [isTop, v.type, v.kind])
  useEffect(() => {
    if (!hasPage && tab !== 'menu') setTab('menu')
  }, [hasPage, tab])

  const routeOptions = useMemo(() => {
    const opts = [...ROUTES, ...programs.map((pr) => [`/programs#${pr.slug || pr.id}`, `Programs — ${pr.title}`])]
    if (v.to && !opts.some(([val]) => val === v.to) && v.kind === 'route') opts.push([v.to, v.to])
    return opts
  }, [programs, v.to, v.kind])

  const routeKeys = v.kind === 'route' ? ROUTE_FIELDS[v.to] || [] : []
  const manager = v.kind === 'route' ? managerFor(v.to) : null

  async function submit(e) {
    e.preventDefault()
    const label = v.label.trim()
    if (!label) {
      setTab('menu')
      return toast('Enter the menu name.', 'err')
    }
    if (v.kind === 'route' && !v.to) return toast('Choose the page it opens.', 'err')
    if (v.kind === 'url' && !String(v.to).trim()) return toast('Enter the link.', 'err')
    if ((!isTop || v.type === 'link') && v.kind === 'none') return toast('Choose where it goes.', 'err')

    let slug = v.slug
    let page = null
    if (v.kind === 'page') {
      slug = slug || uniqueSlug(label, pages)
      const title = (p.title || label).trim()
      page = { ...p, title }
      delete page.id
      delete page.createdAt
      delete page.updatedAt
      delete page.slug
    }

    const values = {
      ...v,
      label,
      slug: v.kind === 'page' ? slug : '',
      to: v.kind === 'page' ? `/p/${slug}` : v.kind === 'none' ? '' : String(v.to).trim(),
    }

    // Website texts that were edited (existing pages only)
    const sitePatch = {}
    if (v.kind === 'route') routeKeys.forEach((k) => k in sv && (sitePatch[k] = sv[k]))

    // Photos & videos: what changed compared with what was loaded
    const ops = { add: [], update: [], remove: [] }
    if (hasPage) {
      draft.forEach((d, i) => {
        if (!d.id) ops.add.push({ ...d, order: i })
        else {
          const oi = original.current.findIndex((o) => o.id === d.id)
          const o = original.current[oi]
          if (!o || o.caption !== d.caption || oi !== i) ops.update.push({ id: d.id, caption: d.caption, order: i })
        }
      })
      original.current.forEach((o) => {
        if (!draft.some((d) => d.id === o.id)) ops.remove.push(o.id)
      })
    }

    setSaving(true)
    try {
      await onSave({ values, page, pageExists: !!existing, sitePatch, mediaOps: ops, targetId })
      onClose()
    } catch (err) {
      console.error(err)
      toast('Could not save. Check your Firestore rules (rda_menu, rda_pages, rda_media).', 'err')
    } finally {
      setSaving(false)
    }
  }

  const title = isTop ? (ctx.item ? 'Edit menu item' : 'New menu item') : ctx.item ? 'Edit dropdown item' : `New item — ${ctx.parent?.label || ''}`
  const pagePath = v.kind === 'page' ? `/p/${v.slug || slugify(v.label) || '…'}` : ''

  return (
    <Modal
      open
      wide
      onClose={() => !saving && onClose()}
      title={title}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="mm-form" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <form id="mm-form" className="mm-form" onSubmit={submit}>
        {hasPage && (
          <div className="mm-steps">
            <button type="button" className={tab === 'menu' ? 'on' : ''} onClick={() => setTab('menu')}>
              <b>1</b> Menu
            </button>
            <button type="button" className={tab === 'content' ? 'on' : ''} onClick={() => setTab('content')}>
              <b>2</b> {v.kind === 'page' ? 'Page content' : 'Current content'}
            </button>
            <button type="button" className={tab === 'media' ? 'on' : ''} onClick={() => setTab('media')}>
              <b>3</b> Photos & videos{draft.length > 0 ? ` (${draft.length})` : ''}
            </button>
          </div>
        )}

        {tab === 'menu' && (
          <>
            <label className="field">
              <span className="field-label">
                Menu name <b className="req">*</b>
              </span>
              <input value={v.label} onChange={(e) => set('label')(e.target.value)} placeholder={isTop ? 'Example: Careers' : 'Example: Youth Program'} autoFocus />
            </label>

            {isTop && (
              <div className="field">
                <span className="field-label">Type</span>
                <div className="mm-type">
                  <button type="button" className={v.type === 'link' ? 'on' : ''} onClick={() => set('type')('link')}>
                    <Link2 size={20} />
                    <strong>Direct link</strong>
                    <small>Clicking it opens one page</small>
                  </button>
                  <button type="button" className={v.type === 'dropdown' ? 'on' : ''} onClick={() => set('type')('dropdown')}>
                    <Layers size={20} />
                    <strong>Dropdown</strong>
                    <small>It has a list of items</small>
                  </button>
                </div>
              </div>
            )}

            <div className="field">
              <span className="field-label">{isDrop ? 'When the main name is clicked, where does it go?' : 'Where does it go?'}</span>
              <div className="mm-kinds">
                {kinds.map((k) => {
                  const Icon = k.icon
                  return (
                    <button key={k.value} type="button" className={v.kind === k.value ? 'on' : ''} onClick={() => set('kind')(k.value)}>
                      <Icon size={20} />
                      <strong>{k.label}</strong>
                      <small>{k.hint}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            {v.kind === 'route' && (
              <label className="field">
                <span className="field-label">Choose the page</span>
                <select value={v.to} onChange={(e) => set('to')(e.target.value)}>
                  <option value="">— Choose —</option>
                  {routeOptions.map(([val, lab]) => (
                    <option key={val} value={val}>
                      {lab}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {v.kind === 'route' && v.to && (
              <div className="mm-note">
                <FileText size={22} />
                <div>
                  <strong>Its current information is ready to edit</strong>
                  <p>Open “Current content” to see the text this page shows now and replace it, and “Photos & videos” to add images or videos to it.</p>
                  <button type="button" className="btn-sm" onClick={() => setTab('content')}>
                    <Pencil size={15} /> Edit current content
                  </button>
                </div>
              </div>
            )}

            {v.kind === 'url' && (
              <>
                <label className="field">
                  <span className="field-label">Link</span>
                  <input value={v.to} onChange={(e) => set('to')(e.target.value)} placeholder="https://… or /custom-path" />
                </label>
                <label className="switch">
                  <input type="checkbox" checked={!!v.newTab} onChange={(e) => set('newTab')(e.target.checked)} />
                  <span className="switch-track" />
                  <span className="switch-text">Open in a new tab</span>
                </label>
              </>
            )}

            {v.kind === 'page' && (
              <div className="mm-note">
                <FileText size={22} />
                <div>
                  <strong>A new page will be created</strong>
                  <p>
                    Address: <code>{pagePath}</code>. Open “Page content” to write its text and “Photos & videos” to add images or videos.
                  </p>
                  <button type="button" className="btn-sm" onClick={() => setTab('content')}>
                    <Pencil size={15} /> Write the content
                  </button>
                </div>
              </div>
            )}

            {isDrop && (
              <label className="switch">
                <input type="checkbox" checked={!!v.autoPrograms} onChange={(e) => set('autoPrograms')(e.target.checked)} />
                <span className="switch-track" />
                <span className="switch-text">Automatically add the programs ({programs.length}) inside this dropdown</span>
              </label>
            )}

            <label className="switch">
              <input type="checkbox" checked={v.visible !== false} onChange={(e) => set('visible')(e.target.checked)} />
              <span className="switch-track" />
              <span className="switch-text">{v.visible !== false ? 'Visible on the website' : 'Hidden'}</span>
            </label>
          </>
        )}

        {tab === 'content' && v.kind === 'page' && (
          <div className="form-grid">
            <p className="mm-hint">
              Everything you write here appears on the page <code>{pagePath}</code>. If you leave the title empty, the menu name is used.
            </p>
            {PAGE_FIELDS.map((f) => (
              <Field key={f.key} field={f} value={p[f.key]} onChange={(val) => setP((s) => ({ ...s, [f.key]: val }))} />
            ))}
          </div>
        )}

        {tab === 'content' && v.kind === 'route' && (
          <div className="form-grid">
            {routeKeys.length > 0 ? (
              <>
                <p className="mm-hint">
                  This is the information <b>{v.to}</b> shows right now. Change any of it and press Save — the website updates immediately.
                </p>
                {routeKeys.map((k) => (
                  <Field key={k} field={FIELD_INDEX[k]} value={k in sv ? sv[k] : site[k] ?? ''} onChange={(val) => setSv((s) => ({ ...s, [k]: val }))} />
                ))}
              </>
            ) : (
              <p className="mm-hint">This page does not have editable text here.</p>
            )}
            {manager && (
              <div className="mm-note">
                <Layers size={22} />
                <div>
                  <strong>More content of this page is managed in “{manager[0]}”</strong>
                  <p>Cards, lists and images of this page are edited in that section of the admin.</p>
                  <Link className="btn-sm" to={manager[1]}>
                    <Pencil size={15} /> Open {manager[0]}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'media' && hasPage && <MediaPanel draft={draft} setDraft={setDraft} />}
      </form>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  Preview: how visitors see the navbar                               */
/* ------------------------------------------------------------------ */
function NavPreview({ nav }) {
  const logo = useLogo()
  const { site } = useSite()
  const [active, setActive] = useState('')
  const current = nav.find((n) => n.id === active)
  useEffect(() => {
    if (!active && nav.length) setActive((nav.find((n) => n.children.length) || nav[0]).id)
  }, [nav, active])

  return (
    <section className="mm-preview" aria-label="Preview">
      <div className="mm-browser">
        <i />
        <i />
        <i />
        <span>{site.website || 'www.rda-somalia.org'}</span>
      </div>
      <div className="mm-nav">
        <div className="mm-brand">
          <img src={logo} alt="" />
          <b>{site.orgName}</b>
        </div>
        <ul>
          {nav.map((n) => (
            <li key={n.id} className={active === n.id ? 'on' : ''} onMouseEnter={() => setActive(n.id)}>
              <button type="button" onClick={() => setActive(n.id)}>
                {n.label}
                {n.children.length > 0 && <ChevronDown size={14} />}
              </button>
            </li>
          ))}
        </ul>
        <span className="mm-cta">Partner with us</span>
      </div>
      <div className="mm-stage">
        {current && current.children.length > 0 ? (
          <ul className="mm-drop" key={current.id}>
            {current.children.map((c, i) => (
              <li key={c.id} style={{ '--i': i }}>
                {c.label}
              </li>
            ))}
          </ul>
        ) : (
          <p>{current ? `“${current.label}” has no dropdown — it is a direct link.` : 'The menu is empty.'}</p>
        )}
        <span className="mm-stage-tag">Preview — how visitors see it</span>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function MenuManager() {
  const toast = useToast()
  const { seeded, loaded } = useSite()
  const menu = useRawCollection(COL.menu)
  const pagesCol = useRawCollection(COL.pages)
  const mediaCol = useRawCollection(MEDIA_COL)
  const { items: programs } = useContent('rda_programs')
  const [editor, setEditor] = useState(null) // {mode:'top'|'child', parent?, item?, tab?}
  const [armed, setArmed] = useState(null)
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const seeding = useRef(false)

  const items = menu.items
  const nav = useMemo(() => buildNav(items, programs), [items, programs])
  const mediaCount = useMemo(() => {
    const c = {}
    mediaCol.items.forEach((m) => {
      c[m.target] = (c[m.target] || 0) + 1
    })
    return c
  }, [mediaCol.items])

  // Put the current menu into Firestore the first time this page is opened
  useEffect(() => {
    if (!loaded || menu.loading || seeding.current) return
    if (!seeded[COL.menu] && items.length === 0) {
      seeding.current = true
      seedCollection(COL.menu).catch((e) => {
        console.error(e)
        toast('Could not add the default menu. Check your Firestore rules.', 'err')
      })
    }
  }, [loaded, menu.loading, seeded, items.length, toast])

  const openEditor = (ctx) => {
    if (pagesCol.loading || mediaCol.loading) return toast('Please wait a second…', 'err')
    setEditor(ctx)
  }

  /* ---------- save ---------- */
  async function saveItem(ctx, { values, page, pageExists, sitePatch, mediaOps, targetId }) {
    if (page) {
      await setDoc(
        doc(db, COL.pages, values.slug),
        { ...page, slug: values.slug, updatedAt: serverTimestamp(), ...(pageExists ? {} : { createdAt: serverTimestamp() }) },
        { merge: true },
      )
    }
    if (sitePatch && Object.keys(sitePatch).length) await saveSite(sitePatch)
    if (mediaOps && (mediaOps.add.length || mediaOps.update.length || mediaOps.remove.length)) {
      const b = writeBatch(db)
      mediaOps.add.forEach((m) =>
        b.set(doc(collection(db, MEDIA_COL)), {
          target: targetId,
          type: m.type,
          url: m.url,
          caption: m.caption || '',
          source: m.source || 'upload',
          order: m.order,
          createdAt: serverTimestamp(),
        }),
      )
      mediaOps.update.forEach((m) => b.update(doc(db, MEDIA_COL, m.id), { caption: m.caption, order: m.order }))
      mediaOps.remove.forEach((id) => b.delete(doc(db, MEDIA_COL, id)))
      await b.commit()
    }

    if (ctx.mode === 'top') {
      const data = {
        label: values.label,
        type: values.type,
        kind: values.kind,
        to: values.to,
        slug: values.slug,
        newTab: !!values.newTab,
        autoPrograms: !!values.autoPrograms,
        visible: values.visible !== false,
      }
      if (ctx.item) {
        await updateDoc(doc(db, COL.menu, ctx.item.id), { ...data, updatedAt: serverTimestamp() })
      } else {
        const order = items.reduce((m, it) => Math.max(m, Number(it.order) || 0), 0) + 1
        await setDoc(doc(db, COL.menu, targetId), { ...data, children: [], order, createdAt: serverTimestamp() })
      }
      toast(ctx.item ? 'Saved' : 'New menu item added')
    } else {
      const parent = items.find((i) => i.id === ctx.parent.id) || ctx.parent
      const child = {
        id: ctx.item?.id || targetId,
        label: values.label,
        kind: values.kind,
        to: values.to,
        slug: values.slug,
        newTab: !!values.newTab,
        visible: values.visible !== false,
      }
      const list = parent.children || []
      const next = ctx.item ? list.map((c) => (c.id === child.id ? child : c)) : [...list, child]
      await updateDoc(doc(db, COL.menu, parent.id), { children: next, updatedAt: serverTimestamp() })
      toast(ctx.item ? 'Saved' : 'New item added to the dropdown')
    }
  }

  /* ---------- delete ---------- */
  async function removeTop(it) {
    const all = [it, ...(it.children || [])]
    const slugs = all.filter((x) => x.kind === 'page' && x.slug).map((x) => x.slug)
    const ids = all.map((x) => x.id)
    const media = mediaCol.items.filter((m) => ids.includes(m.target))
    const extra = slugs.length ? ` ${slugs.length} page(s) with their content will also be deleted.` : ''
    if (!window.confirm(`Delete “${it.label}” and everything inside it?${extra}`)) return
    try {
      const b = writeBatch(db)
      b.delete(doc(db, COL.menu, it.id))
      slugs.forEach((s) => b.delete(doc(db, COL.pages, s)))
      media.forEach((m) => b.delete(doc(db, MEDIA_COL, m.id)))
      await b.commit()
      toast('Deleted')
    } catch (e) {
      console.error(e)
      toast('Could not delete.', 'err')
    }
  }
  async function removeChild(parent, child) {
    const msg = child.kind === 'page' ? `Delete “${child.label}”? Its page content will also be deleted.` : `Delete “${child.label}”?`
    if (!window.confirm(msg)) return
    try {
      await updateDoc(doc(db, COL.menu, parent.id), { children: (parent.children || []).filter((c) => c.id !== child.id), updatedAt: serverTimestamp() })
      if (child.kind === 'page' && child.slug) await deleteDoc(doc(db, COL.pages, child.slug))
      const media = mediaCol.items.filter((m) => m.target === child.id)
      if (media.length) {
        const b = writeBatch(db)
        media.forEach((m) => b.delete(doc(db, MEDIA_COL, m.id)))
        await b.commit()
      }
      toast('Deleted')
    } catch (e) {
      console.error(e)
      toast('Could not delete.', 'err')
    }
  }

  /* ---------- visibility ---------- */
  async function toggleTop(it) {
    try {
      await updateDoc(doc(db, COL.menu, it.id), { visible: it.visible === false })
    } catch (e) {
      console.error(e)
      toast('Could not change it.', 'err')
    }
  }
  async function toggleChild(parent, child) {
    try {
      await updateDoc(doc(db, COL.menu, parent.id), { children: (parent.children || []).map((c) => (c.id === child.id ? { ...c, visible: c.visible === false } : c)) })
    } catch (e) {
      console.error(e)
      toast('Could not change it.', 'err')
    }
  }

  /* ---------- reorder ---------- */
  async function reorderTop(fromId, toId) {
    const arr = [...items]
    const from = arr.findIndex((x) => x.id === fromId)
    const to = arr.findIndex((x) => x.id === toId)
    if (from < 0 || to < 0 || from === to) return
    const [m] = arr.splice(from, 1)
    arr.splice(to, 0, m)
    try {
      const b = writeBatch(db)
      arr.forEach((x, i) => b.update(doc(db, COL.menu, x.id), { order: i + 1 }))
      await b.commit()
    } catch (e) {
      console.error(e)
      toast('Could not reorder.', 'err')
    }
  }
  async function reorderChildren(parent, fromId, toId) {
    const arr = [...(parent.children || [])]
    const from = arr.findIndex((x) => x.id === fromId)
    const to = arr.findIndex((x) => x.id === toId)
    if (from < 0 || to < 0 || from === to) return
    const [m] = arr.splice(from, 1)
    arr.splice(to, 0, m)
    try {
      await updateDoc(doc(db, COL.menu, parent.id), { children: arr })
    } catch (e) {
      console.error(e)
      toast('Could not reorder.', 'err')
    }
  }
  const stepTop = (idx, d) => items[idx + d] && reorderTop(items[idx].id, items[idx + d].id)
  const stepChild = (parent, idx, d) => parent.children[idx + d] && reorderChildren(parent, parent.children[idx].id, parent.children[idx + d].id)

  const endDrag = () => {
    setDrag(null)
    setOver(null)
    setArmed(null)
  }
  const dnd = (kind, id, parent) => ({
    draggable: !!(armed && armed.kind === kind && armed.id === id),
    onDragStart: (e) => {
      e.stopPropagation()
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', id)
      setDrag({ kind, id, parent: parent?.id || '' })
    },
    onDragEnd: endDrag,
    onDragOver: (e) => {
      if (!drag || drag.kind !== kind || drag.parent !== (parent?.id || '') || drag.id === id) return
      e.preventDefault()
      e.stopPropagation()
      setOver(id)
    },
    onDrop: (e) => {
      if (!drag || drag.kind !== kind || drag.parent !== (parent?.id || '')) return
      e.preventDefault()
      e.stopPropagation()
      if (kind === 'top') reorderTop(drag.id, id)
      else reorderChildren(parent, drag.id, id)
      endDrag()
    },
  })

  const hasPage = (x) => x.kind === 'route' || x.kind === 'page'

  return (
    <div className="page mm">
      <div className="page-head">
        <div>
          <h1>Navbar & Dropdowns</h1>
          <p className="page-hint">
            Manage the website's main menu: add dropdowns, add items inside them, and see, edit or replace the information of each page — with one image, many images or videos. Changes appear on the website immediately.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openEditor({ mode: 'top' })}>
          <Plus size={18} /> New menu item
        </button>
      </div>

      <NavPreview nav={nav} />

      {menu.error && (
        <p className="notice notice-err">
          The menu could not be read (Firestore permission). Add the rules for <code>rda_menu</code>, <code>rda_pages</code> and <code>rda_media</code>.
        </p>
      )}

      {menu.loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-admin">
          <p>The menu is empty.</p>
          <button type="button" className="btn-primary" onClick={() => openEditor({ mode: 'top' })}>
            <Plus size={18} /> Add the first item
          </button>
        </div>
      ) : (
        <div className="mm-list">
          {items.map((it, idx) => {
            const isDrop = it.type === 'dropdown'
            const kids = it.children || []
            const meta = kindMeta(it.kind)
            const KIcon = meta.icon
            const mc = mediaCount[it.id] || 0
            return (
              <article
                key={it.id}
                className={`mm-card accent-${ACCENTS[idx % 4]} ${it.visible === false ? 'is-hidden' : ''} ${drag?.id === it.id ? 'is-dragging' : ''} ${over === it.id ? 'is-over' : ''}`}
                style={{ '--i': idx }}
                {...dnd('top', it.id)}
              >
                <header className="mm-head">
                  <span className="mm-grip" title="Drag to reorder" onMouseDown={() => setArmed({ kind: 'top', id: it.id })} onMouseUp={() => setArmed(null)} onTouchStart={() => setArmed(null)}>
                    <GripVertical size={20} />
                  </span>
                  <span className="mm-kind">
                    <KIcon size={19} />
                  </span>
                  <div className="mm-title">
                    <h3>{it.label}</h3>
                    <p title={destText(it)}>{destText(it)}</p>
                  </div>
                  <div className="mm-chips">
                    <span className={`mm-chip ${isDrop ? 'drop' : 'link'}`}>{isDrop ? `Dropdown · ${kids.length + (it.autoPrograms ? programs.length : 0)}` : 'Link'}</span>
                    {mc > 0 && <span className="mm-chip pg">{mc} media</span>}
                    {it.visible === false && <span className="mm-chip off">Hidden</span>}
                  </div>
                  <div className="mm-actions">
                    {hasPage(it) && (
                      <button type="button" className="mm-ic accent" onClick={() => openEditor({ mode: 'top', item: it, tab: 'content' })} aria-label="Edit page content and media" title="Edit page content & media">
                        <FileText size={17} />
                      </button>
                    )}
                    <button type="button" className="mm-ic" onClick={() => stepTop(idx, -1)} disabled={idx === 0} aria-label="Move up" title="Move up">
                      <ChevronUp size={18} />
                    </button>
                    <button type="button" className="mm-ic" onClick={() => stepTop(idx, 1)} disabled={idx === items.length - 1} aria-label="Move down" title="Move down">
                      <ChevronDown size={18} />
                    </button>
                    <button type="button" className="mm-ic" onClick={() => toggleTop(it)} aria-label={it.visible === false ? 'Show' : 'Hide'} title={it.visible === false ? 'Show' : 'Hide'}>
                      {it.visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button type="button" className="mm-ic" onClick={() => openEditor({ mode: 'top', item: it })} aria-label="Edit" title="Edit">
                      <Pencil size={17} />
                    </button>
                    <button type="button" className="mm-ic danger" onClick={() => removeTop(it)} aria-label="Delete" title="Delete">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </header>

                {isDrop && (
                  <ul className="mm-children">
                    {it.autoPrograms && (
                      <li className="mm-auto">
                        <Layers size={16} />
                        <span>
                          <b>{programs.length} programs</b> are added here automatically (Programs section).
                        </span>
                      </li>
                    )}
                    {kids.map((c, ci) => {
                      const m = kindMeta(c.kind)
                      const CIcon = m.icon
                      const cmc = mediaCount[c.id] || 0
                      return (
                        <li key={c.id} className={`mm-child ${c.visible === false ? 'is-hidden' : ''} ${drag?.id === c.id ? 'is-dragging' : ''} ${over === c.id ? 'is-over' : ''}`} {...dnd('child', c.id, it)}>
                          <span className="mm-grip sm" title="Drag" onMouseDown={() => setArmed({ kind: 'child', id: c.id })} onMouseUp={() => setArmed(null)}>
                            <GripVertical size={17} />
                          </span>
                          <span className={`mm-kind sm k-${c.kind}`}>
                            <CIcon size={15} />
                          </span>
                          <div className="mm-title">
                            <h4>{c.label}</h4>
                            <p title={destText(c)}>{destText(c)}</p>
                          </div>
                          {c.kind === 'page' && <span className="mm-chip pg">New page</span>}
                          {cmc > 0 && <span className="mm-chip pg">{cmc} media</span>}
                          {c.visible === false && <span className="mm-chip off">Hidden</span>}
                          <div className="mm-actions sm">
                            {hasPage(c) && (
                              <button type="button" className="mm-ic accent" onClick={() => openEditor({ mode: 'child', parent: it, item: c, tab: 'content' })} aria-label="Edit page content and media" title="Edit page content & media">
                                <FileText size={16} />
                              </button>
                            )}
                            <button type="button" className="mm-ic" onClick={() => stepChild(it, ci, -1)} disabled={ci === 0} aria-label="Move up">
                              <ChevronUp size={16} />
                            </button>
                            <button type="button" className="mm-ic" onClick={() => stepChild(it, ci, 1)} disabled={ci === kids.length - 1} aria-label="Move down">
                              <ChevronDown size={16} />
                            </button>
                            <button type="button" className="mm-ic" onClick={() => toggleChild(it, c)} aria-label={c.visible === false ? 'Show' : 'Hide'}>
                              {c.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button type="button" className="mm-ic" onClick={() => openEditor({ mode: 'child', parent: it, item: c })} aria-label="Edit">
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="mm-ic danger" onClick={() => removeChild(it, c)} aria-label="Delete">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                    <li className="mm-add">
                      <button type="button" onClick={() => openEditor({ mode: 'child', parent: it })}>
                        <Plus size={17} /> Add an item to this dropdown
                      </button>
                    </li>
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      )}

      {editor && (
        <ItemEditor
          key={`${editor.mode}-${editor.item?.id || 'new'}-${editor.parent?.id || ''}`}
          ctx={editor}
          pages={pagesCol.items}
          mediaDocs={mediaCol.items}
          programs={programs}
          onClose={() => setEditor(null)}
          onSave={(payload) => saveItem(editor, payload)}
        />
      )}
    </div>
  )
}