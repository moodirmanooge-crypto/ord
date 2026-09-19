import { useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { ChevronDown, ChevronUp, Eye, EyeOff, FileText, GripVertical, Layers, Link2, MousePointerClick, Pencil, Plus, Route, Trash2 } from 'lucide-react'
import { db, COL } from '../firebase'
import { useContent, useRawCollection, useSite } from '../lib/data'
import { buildNav, resolveTo } from '../lib/menu'
import { seedCollection } from '../lib/seed'
import { slugify } from '../lib/text'
import { Loading, Modal, useLogo } from '../components/ui'
import { Field } from './fields'
import { useToast } from './toast'
import '../styles/menu-admin.css'

const rid = () => Math.random().toString(36).slice(2, 9)
const ACCENTS = ['blue', 'green', 'red', 'indigo']

const ROUTES = [
  ['/', 'Home'],
  ['/about', 'About — Who we are'],
  ['/about#vision', 'About — Vision, mission & values'],
  ['/about#strategy', 'About — Strategy & theory of change'],
  ['/leadership', 'Leadership & Board'],
  ['/programs', 'Programs (dhammaan)'],
  ['/where-we-work', 'Where we work'],
  ['/impact', 'Impact'],
  ['/partner', 'Partner with us'],
  ['/news', 'News & updates'],
  ['/gallery', 'Photo gallery'],
  ['/contact', 'Contact'],
]

const KINDS = [
  { value: 'route', label: 'Bog jira', hint: 'Bog ka mid ah website-ka hadda jira', icon: Route },
  { value: 'page', label: 'Bog cusub', hint: 'Samee bog cusub oo aad macluumaadkiisa qorto', icon: FileText },
  { value: 'url', label: 'Link', hint: 'Link dibadda ah ama waddo gaar ah', icon: Link2 },
]
const KIND_NONE = { value: 'none', label: 'Magaca kaliya', hint: 'Waxay furaysaa dropdown-ka oo keliya', icon: MousePointerClick }

const PAGE_FIELDS = [
  { key: 'title', label: 'Cinwaanka bogga', type: 'text', required: true },
  { key: 'intro', label: 'Sharaxaad gaaban (hoos ka muuqata cinwaanka)', type: 'textarea', rows: 3 },
  { key: 'image', label: 'Sawirka ugu weyn', type: 'image', folder: 'pages' },
  {
    key: 'sections',
    label: 'Qaybaha bogga',
    type: 'repeater',
    addLabel: 'Ku dar qayb',
    fields: [
      { key: 'heading', label: 'Cinwaanka qaybta', type: 'text' },
      { key: 'text', label: 'Qoraalka', type: 'textarea', rows: 6, help: 'Fal madhan ku kala saar paragraph-yada. "## " = cinwaan yar, "- " = liis.' },
      { key: 'image', label: 'Sawir (ikhtiyaari)', type: 'image', folder: 'pages' },
    ],
  },
  {
    key: 'gallery',
    label: 'Sawirro dheeraad ah (gallery)',
    type: 'repeater',
    addLabel: 'Ku dar sawir',
    fields: [
      { key: 'image', label: 'Sawir', type: 'image', folder: 'pages' },
      { key: 'caption', label: 'Qoraal gaaban', type: 'text' },
    ],
  },
  { key: 'ctaLabel', label: 'Qoraalka badhanka (ikhtiyaari)', type: 'text' },
  { key: 'ctaUrl', label: 'Badhanka halka uu tagayo', type: 'text', help: 'Tusaale: /contact ama https://…' },
  { key: 'published', label: 'Daabac (muuji website-ka)', type: 'boolean' },
]

const uniqueSlug = (label, pages) => {
  const base = slugify(label) || 'page'
  let s = base
  let n = 2
  while (pages.some((p) => p.slug === s || p.id === s)) s = `${base}-${n++}`
  return s
}

const destText = (it) => {
  if (it.kind === 'page') return it.slug ? `/p/${it.slug}` : 'Bog cusub'
  if (it.kind === 'none' || !resolveTo(it)) return 'Ma leh link — waxay furaysaa dropdown-ka'
  return resolveTo(it)
}
const kindMeta = (k) => [...KINDS, KIND_NONE].find((x) => x.value === k) || KINDS[0]

function Seg({ options, value, onChange }) {
  return (
    <div className="mm-seg" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Foomka wax-ka-beddelka: item weyn ama item ku jira dropdown        */
/* ------------------------------------------------------------------ */
function ItemEditor({ ctx, pages, programs, onClose, onSave }) {
  const toast = useToast()
  const isTop = ctx.mode === 'top'
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
  const [tab, setTab] = useState('menu')
  const [saving, setSaving] = useState(false)
  const set = (k) => (val) => setV((s) => ({ ...s, [k]: val }))
  const isDrop = isTop && v.type === 'dropdown'
  const kinds = isDrop ? [KIND_NONE, ...KINDS] : KINDS

  // Haddii item-ku yahay link toos ah, "none" looma ogola
  useEffect(() => {
    if (isTop && v.type === 'link' && v.kind === 'none') setV((s) => ({ ...s, kind: 'route' }))
  }, [isTop, v.type, v.kind])

  const routeOptions = useMemo(() => {
    const opts = [...ROUTES, ...programs.map((pr) => [`/programs#${pr.slug || pr.id}`, `Programs — ${pr.title}`])]
    if (v.to && !opts.some(([val]) => val === v.to) && v.kind === 'route') opts.push([v.to, v.to])
    return opts
  }, [programs, v.to, v.kind])

  async function submit(e) {
    e.preventDefault()
    const label = v.label.trim()
    if (!label) {
      setTab('menu')
      return toast('Geli magaca menu-ga.', 'err')
    }
    if (v.kind === 'route' && !v.to) return toast('Dooro bogga uu tagayo.', 'err')
    if (v.kind === 'url' && !String(v.to).trim()) return toast('Geli link-ga.', 'err')
    if ((!isTop || v.type === 'link') && v.kind === 'none') return toast('Dooro meesha uu tagayo.', 'err')

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
    setSaving(true)
    try {
      await onSave(values, page, !!existing)
      onClose()
    } catch (err) {
      console.error(err)
      toast('Lama kaydin karo. Hubi Firestore rules (rda_menu iyo rda_pages).', 'err')
    } finally {
      setSaving(false)
    }
  }

  const title = isTop ? (ctx.item ? 'Wax ka beddel menu-ga' : 'Menu item cusub') : ctx.item ? 'Wax ka beddel item-ka' : `Item cusub — ${ctx.parent?.label || ''}`

  return (
    <Modal
      open
      wide
      onClose={() => !saving && onClose()}
      title={title}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            Jooji
          </button>
          <button type="submit" form="mm-form" className="btn-primary" disabled={saving}>
            {saving ? 'Waa la kaydinayaa…' : 'Kaydi'}
          </button>
        </>
      }
    >
      <form id="mm-form" className="mm-form" onSubmit={submit}>
        {v.kind === 'page' && (
          <div className="mm-steps">
            <button type="button" className={tab === 'menu' ? 'on' : ''} onClick={() => setTab('menu')}>
              <b>1</b> Menu-ga
            </button>
            <button type="button" className={tab === 'page' ? 'on' : ''} onClick={() => setTab('page')}>
              <b>2</b> Macluumaadka bogga
            </button>
          </div>
        )}

        {tab === 'menu' && (
          <>
            <label className="field">
              <span className="field-label">
                Magaca menu-ga <b className="req">*</b>
              </span>
              <input value={v.label} onChange={(e) => set('label')(e.target.value)} placeholder={isTop ? 'Tusaale: Careers' : 'Tusaale: Youth Program'} autoFocus />
            </label>

            {isTop && (
              <div className="field">
                <span className="field-label">Nooca</span>
                <div className="mm-type">
                  <button type="button" className={v.type === 'link' ? 'on' : ''} onClick={() => set('type')('link')}>
                    <Link2 size={20} />
                    <strong>Link toos ah</strong>
                    <small>Riix wuxuu tagayaa hal bog</small>
                  </button>
                  <button type="button" className={v.type === 'dropdown' ? 'on' : ''} onClick={() => set('type')('dropdown')}>
                    <Layers size={20} />
                    <strong>Dropdown</strong>
                    <small>Wuxuu leeyahay liis items ah</small>
                  </button>
                </div>
              </div>
            )}

            <div className="field">
              <span className="field-label">{isDrop ? 'Marka la riixo magaca weyn, halkee u tagaa?' : 'Halkee u tagaa?'}</span>
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
                <span className="field-label">Dooro bogga</span>
                <select value={v.to} onChange={(e) => set('to')(e.target.value)}>
                  <option value="">— Dooro —</option>
                  {routeOptions.map(([val, lab]) => (
                    <option key={val} value={val}>
                      {lab}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {v.kind === 'url' && (
              <>
                <label className="field">
                  <span className="field-label">Link</span>
                  <input value={v.to} onChange={(e) => set('to')(e.target.value)} placeholder="https://… ama /waddo-gaar-ah" />
                </label>
                <label className="switch">
                  <input type="checkbox" checked={!!v.newTab} onChange={(e) => set('newTab')(e.target.checked)} />
                  <span className="switch-track" />
                  <span className="switch-text">Ku fur tab cusub</span>
                </label>
              </>
            )}

            {v.kind === 'page' && (
              <div className="mm-note">
                <FileText size={22} />
                <div>
                  <strong>Bog cusub ayaa la samayn doonaa</strong>
                  <p>
                    Cinwaanka: <code>/p/{v.slug || (slugify(v.label) || '…')}</code>. Riix “Macluumaadka bogga” si aad u qorto qoraalka iyo sawirrada.
                  </p>
                  <button type="button" className="btn-sm" onClick={() => setTab('page')}>
                    <Pencil size={15} /> Qor macluumaadka
                  </button>
                </div>
              </div>
            )}

            {isDrop && (
              <label className="switch">
                <input type="checkbox" checked={!!v.autoPrograms} onChange={(e) => set('autoPrograms')(e.target.checked)} />
                <span className="switch-track" />
                <span className="switch-text">Ku dar barnaamijyada ({programs.length}) si toos ah dropdown-kan gudihiisa</span>
              </label>
            )}

            <label className="switch">
              <input type="checkbox" checked={v.visible !== false} onChange={(e) => set('visible')(e.target.checked)} />
              <span className="switch-track" />
              <span className="switch-text">{v.visible !== false ? 'Waa muuqdaa website-ka' : 'Waa qarsoon yahay'}</span>
            </label>
          </>
        )}

        {tab === 'page' && v.kind === 'page' && (
          <div className="form-grid">
            <p className="mm-hint">Macluumaadka halkan ku qoran ayaa ka muuqan doona bogga <code>/p/{v.slug || slugify(v.label) || '…'}</code>. Haddii cinwaanka aad ka tagto madhan, magaca menu-ga ayaa la isticmaalayaa.</p>
            {PAGE_FIELDS.map((f) => (
              <Field key={f.key} field={f} value={p[f.key]} onChange={(val) => setP((s) => ({ ...s, [f.key]: val }))} />
            ))}
          </div>
        )}
      </form>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  Preview: sida booqdaha u arko navbar-ka                            */
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
          <p>{current ? `“${current.label}” ma laha dropdown — waa link toos ah.` : 'Menu-ga waa madhan yahay.'}</p>
        )}
        <span className="mm-stage-tag">Preview — sida booqdaha u arko</span>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Bogga ugu weyn                                                     */
/* ------------------------------------------------------------------ */
export default function MenuManager() {
  const toast = useToast()
  const { seeded, loaded } = useSite()
  const menu = useRawCollection(COL.menu)
  const pagesCol = useRawCollection(COL.pages)
  const { items: programs } = useContent('rda_programs')
  const [editor, setEditor] = useState(null) // {mode:'top'|'child', parent?, item?}
  const [armed, setArmed] = useState(null) // {kind,id} — grip-ka la riixay
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const seeding = useRef(false)

  const items = menu.items
  const nav = useMemo(() => buildNav(items, programs), [items, programs])

  // Menu-ka hadda jira si toos ah ugu shub Firestore marka ugu horreysa
  useEffect(() => {
    if (!loaded || menu.loading || seeding.current) return
    if (!seeded[COL.menu] && items.length === 0) {
      seeding.current = true
      seedCollection(COL.menu).catch((e) => {
        console.error(e)
        toast('Menu-ka asalka ah lama geli karo. Hubi Firestore rules.', 'err')
      })
    }
  }, [loaded, menu.loading, seeded, items.length, toast])

  const openEditor = (ctx) => {
    if (pagesCol.loading) return toast('Fadlan sug ilbiriqsi…', 'err')
    setEditor(ctx)
  }

  /* ---------- kaydinta ---------- */
  async function saveItem(ctx, values, page, pageExists) {
    if (page) {
      await setDoc(
        doc(db, COL.pages, values.slug),
        { ...page, slug: values.slug, updatedAt: serverTimestamp(), ...(pageExists ? {} : { createdAt: serverTimestamp() }) },
        { merge: true },
      )
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
        await addDoc(collection(db, COL.menu), { ...data, children: [], order, createdAt: serverTimestamp() })
      }
      toast(ctx.item ? 'Waa la kaydiyay' : 'Menu item cusub waa lagu daray')
    } else {
      const parent = items.find((i) => i.id === ctx.parent.id) || ctx.parent
      const child = {
        id: ctx.item?.id || rid(),
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
      toast(ctx.item ? 'Waa la kaydiyay' : 'Item cusub waa lagu daray dropdown-ka')
    }
  }

  /* ---------- tirtirid ---------- */
  async function removeTop(it) {
    const slugs = [it, ...(it.children || [])].filter((x) => x.kind === 'page' && x.slug).map((x) => x.slug)
    const msg = slugs.length ? `Ma hubtaa inaad tirtirto “${it.label}”? ${slugs.length} bog oo macluumaad leh ayaa sidoo kale la tirtirayaa.` : `Ma hubtaa inaad tirtirto “${it.label}” iyo wixii ku jira?`
    if (!window.confirm(msg)) return
    try {
      const b = writeBatch(db)
      b.delete(doc(db, COL.menu, it.id))
      slugs.forEach((s) => b.delete(doc(db, COL.pages, s)))
      await b.commit()
      toast('Waa la tirtiray')
    } catch (e) {
      console.error(e)
      toast('Lama tirtiri karo.', 'err')
    }
  }
  async function removeChild(parent, child) {
    const msg = child.kind === 'page' ? `Ma hubtaa inaad tirtirto “${child.label}”? Bogga macluumaadkiisa sidoo kale waa la tirtirayaa.` : `Ma hubtaa inaad tirtirto “${child.label}”?`
    if (!window.confirm(msg)) return
    try {
      await updateDoc(doc(db, COL.menu, parent.id), { children: (parent.children || []).filter((c) => c.id !== child.id), updatedAt: serverTimestamp() })
      if (child.kind === 'page' && child.slug) await deleteDoc(doc(db, COL.pages, child.slug))
      toast('Waa la tirtiray')
    } catch (e) {
      console.error(e)
      toast('Lama tirtiri karo.', 'err')
    }
  }

  /* ---------- muuqaal ---------- */
  async function toggleTop(it) {
    try {
      await updateDoc(doc(db, COL.menu, it.id), { visible: it.visible === false })
    } catch (e) {
      console.error(e)
      toast('Lama beddeli karo.', 'err')
    }
  }
  async function toggleChild(parent, child) {
    try {
      await updateDoc(doc(db, COL.menu, parent.id), { children: (parent.children || []).map((c) => (c.id === child.id ? { ...c, visible: c.visible === false } : c)) })
    } catch (e) {
      console.error(e)
      toast('Lama beddeli karo.', 'err')
    }
  }

  /* ---------- kala horeyn ---------- */
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
      toast('Lama kala horeyn karo.', 'err')
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
      toast('Lama kala horeyn karo.', 'err')
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

  return (
    <div className="page mm">
      <div className="page-head">
        <div>
          <h1>Navbar & Dropdown-yada</h1>
          <p className="page-hint">Halkan ka maamul menu-ga sare ee website-ka: ku dar dropdown cusub, ku dar items gudahooda, oo u qor macluumaadka bog kasta. Isbeddelku isla markiiba ayuu muuqdaa.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => openEditor({ mode: 'top' })}>
          <Plus size={18} /> Menu item cusub
        </button>
      </div>

      <NavPreview nav={nav} />

      {menu.error && <p className="notice notice-err">Menu-ga lama akhriyi karo (Firestore permission). Ku dar rules-ka <code>rda_menu</code> iyo <code>rda_pages</code>.</p>}

      {menu.loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-admin">
          <p>Menu-ga waa madhan yahay.</p>
          <button type="button" className="btn-primary" onClick={() => openEditor({ mode: 'top' })}>
            <Plus size={18} /> Ku dar item ugu horreeya
          </button>
        </div>
      ) : (
        <div className="mm-list">
          {items.map((it, idx) => {
            const isDrop = it.type === 'dropdown'
            const kids = it.children || []
            const meta = kindMeta(it.kind)
            const KIcon = meta.icon
            return (
              <article
                key={it.id}
                className={`mm-card accent-${ACCENTS[idx % 4]} ${it.visible === false ? 'is-hidden' : ''} ${drag?.id === it.id ? 'is-dragging' : ''} ${over === it.id ? 'is-over' : ''}`}
                style={{ '--i': idx }}
                {...dnd('top', it.id)}
              >
                <header className="mm-head">
                  <span className="mm-grip" title="Jiid si aad u kala horeyso" onMouseDown={() => setArmed({ kind: 'top', id: it.id })} onMouseUp={() => setArmed(null)} onTouchStart={() => setArmed(null)}>
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
                    {it.visible === false && <span className="mm-chip off">Qarsoon</span>}
                  </div>
                  <div className="mm-actions">
                    <button type="button" className="mm-ic" onClick={() => stepTop(idx, -1)} disabled={idx === 0} aria-label="Kor u qaad" title="Kor u qaad">
                      <ChevronUp size={18} />
                    </button>
                    <button type="button" className="mm-ic" onClick={() => stepTop(idx, 1)} disabled={idx === items.length - 1} aria-label="Hoos u dhig" title="Hoos u dhig">
                      <ChevronDown size={18} />
                    </button>
                    <button type="button" className="mm-ic" onClick={() => toggleTop(it)} aria-label={it.visible === false ? 'Muuji' : 'Qari'} title={it.visible === false ? 'Muuji' : 'Qari'}>
                      {it.visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button type="button" className="mm-ic" onClick={() => openEditor({ mode: 'top', item: it })} aria-label="Beddel" title="Beddel">
                      <Pencil size={17} />
                    </button>
                    <button type="button" className="mm-ic danger" onClick={() => removeTop(it)} aria-label="Tirtir" title="Tirtir">
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
                          <b>{programs.length} barnaamij</b> ayaa si toos ah halkan ugu daray (Programs → Barnaamijyada).
                        </span>
                      </li>
                    )}
                    {kids.map((c, ci) => {
                      const m = kindMeta(c.kind)
                      const CIcon = m.icon
                      return (
                        <li key={c.id} className={`mm-child ${c.visible === false ? 'is-hidden' : ''} ${drag?.id === c.id ? 'is-dragging' : ''} ${over === c.id ? 'is-over' : ''}`} {...dnd('child', c.id, it)}>
                          <span className="mm-grip sm" title="Jiid" onMouseDown={() => setArmed({ kind: 'child', id: c.id })} onMouseUp={() => setArmed(null)}>
                            <GripVertical size={17} />
                          </span>
                          <span className={`mm-kind sm k-${c.kind}`}>
                            <CIcon size={15} />
                          </span>
                          <div className="mm-title">
                            <h4>{c.label}</h4>
                            <p title={destText(c)}>{destText(c)}</p>
                          </div>
                          {c.kind === 'page' && <span className="mm-chip pg">Bog cusub</span>}
                          {c.visible === false && <span className="mm-chip off">Qarsoon</span>}
                          <div className="mm-actions sm">
                            <button type="button" className="mm-ic" onClick={() => stepChild(it, ci, -1)} disabled={ci === 0} aria-label="Kor u qaad">
                              <ChevronUp size={16} />
                            </button>
                            <button type="button" className="mm-ic" onClick={() => stepChild(it, ci, 1)} disabled={ci === kids.length - 1} aria-label="Hoos u dhig">
                              <ChevronDown size={16} />
                            </button>
                            <button type="button" className="mm-ic" onClick={() => toggleChild(it, c)} aria-label={c.visible === false ? 'Muuji' : 'Qari'}>
                              {c.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button type="button" className="mm-ic" onClick={() => openEditor({ mode: 'child', parent: it, item: c })} aria-label="Beddel">
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="mm-ic danger" onClick={() => removeChild(it, c)} aria-label="Tirtir">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                    <li className="mm-add">
                      <button type="button" onClick={() => openEditor({ mode: 'child', parent: it })}>
                        <Plus size={17} /> Ku dar item dropdown-kan
                      </button>
                    </li>
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      )}

      {editor && <ItemEditor key={`${editor.mode}-${editor.item?.id || 'new'}-${editor.parent?.id || ''}`} ctx={editor} pages={pagesCol.items} programs={programs} onClose={() => setEditor(null)} onSave={(values, page, exists) => saveItem(editor, values, page, exists)} />}
    </div>
  )
}