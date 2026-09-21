import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { ChevronLeft, ChevronRight, Eye, EyeOff, ImagePlus, Images, Layers, MoveHorizontal, Save, Trash2, ZoomIn } from 'lucide-react'
import { db, COL } from '../firebase'
import { useRawCollection, useSite } from '../lib/data'
import { saveSite } from '../lib/seed'
import { uploadImage } from '../lib/image'
import { Loading } from '../components/ui'
import HeroSlideshow from '../components/HeroSlideshow'
import { useToast } from './toast'
import '../styles/hero-manager.css'

const EFFECTS = [
  { value: 'fade', label: 'Fade', hint: 'Soft cross-fade with a slow zoom', icon: Layers },
  { value: 'slide', label: 'Slide', hint: 'Images push each other sideways', icon: MoveHorizontal },
  { value: 'zoom', label: 'Zoom', hint: 'Each image zooms out into place', icon: ZoomIn },
]
const FALLBACKS = [
  { value: 'first', label: 'First image only' },
  { value: 'all', label: 'Every image' },
  { value: 'none', label: 'Never' },
]

function Slide({ item, index, total, onMove, onToggle, onDelete }) {
  const toast = useToast()
  const [caption, setCaption] = useState(item.caption || '')
  const [link, setLink] = useState(item.link || '')
  const save = async (patch) => {
    try {
      await updateDoc(doc(db, COL.hero, item.id), { ...patch, updatedAt: serverTimestamp() })
    } catch (e) {
      console.error(e)
      toast('Could not save.', 'err')
    }
  }
  return (
    <article className={`hm-slide ${item.visible === false ? 'is-hidden' : ''}`} style={{ '--i': index }}>
      <div className="hm-thumb">
        <img src={item.image} alt="" loading="lazy" />
        <span className="hm-num">{index + 1}</span>
        {item.visible === false && <span className="hm-off">Hidden</span>}
      </div>
      <div className="hm-body">
        <label className="field">
          <span className="field-label">Caption (shown on the image)</span>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} onBlur={() => caption !== (item.caption || '') && save({ caption })} placeholder="Optional" />
        </label>
        <label className="field">
          <span className="field-label">Link (optional)</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} onBlur={() => link !== (item.link || '') && save({ link })} placeholder="/news or https://…" />
        </label>
      </div>
      <div className="hm-tools">
        <button type="button" className="hm-ic" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move earlier" title="Move earlier">
          <ChevronLeft size={18} />
        </button>
        <button type="button" className="hm-ic" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label="Move later" title="Move later">
          <ChevronRight size={18} />
        </button>
        <button type="button" className="hm-ic" onClick={() => onToggle(item)} aria-label={item.visible === false ? 'Show' : 'Hide'} title={item.visible === false ? 'Show on the website' : 'Hide from the website'}>
          {item.visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
        <button type="button" className="hm-ic danger" onClick={() => onDelete(item)} aria-label="Delete" title="Delete">
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  )
}

export default function HeroManager() {
  const toast = useToast()
  const { site, loaded } = useSite()
  const { items, loading, error } = useRawCollection(COL.hero)
  const [cfg, setCfg] = useState(null)
  const [savingCfg, setSavingCfg] = useState(false)
  const [busy, setBusy] = useState(null) // { done, total }
  const [drag, setDrag] = useState(false)
  const input = useRef(null)

  // Slider settings start from what is saved on the website
  useEffect(() => {
    if (!loaded || cfg) return
    setCfg({
      heroInterval: Number(site.heroInterval) || 6.5,
      heroEffect: site.heroEffect || 'fade',
      heroAutoplay: site.heroAutoplay !== false,
      heroFallback: site.heroFallback || 'first',
    })
  }, [loaded, site, cfg])

  const images = items.filter((i) => i.image)
  const live = images.filter((i) => i.visible !== false)

  async function upload(files) {
    const list = Array.from(files || []).filter((f) => f.type.startsWith('image/'))
    if (!list.length) return toast('Please choose image files (JPG, PNG or WEBP).', 'err')
    let order = items.reduce((m, it) => Math.max(m, Number(it.order) || 0), 0)
    let ok = 0
    setBusy({ done: 0, total: list.length })
    for (const file of list) {
      try {
        const url = await uploadImage(file, { folder: 'hero' })
        order += 1
        await addDoc(collection(db, COL.hero), { image: url, caption: '', link: '', visible: true, order, createdAt: serverTimestamp() })
        ok += 1
      } catch (e) {
        console.error(e)
      }
      setBusy((b) => (b ? { ...b, done: b.done + 1 } : b))
    }
    setBusy(null)
    const fail = list.length - ok
    toast(fail ? `${ok} image(s) added, ${fail} failed.` : `${ok} image${ok === 1 ? '' : 's'} added — they are on the home page slider now`, fail ? 'err' : 'ok')
  }

  async function move(index, dir) {
    const arr = [...images]
    const j = index + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[index], arr[j]] = [arr[j], arr[index]]
    try {
      const b = writeBatch(db)
      arr.forEach((x, i) => b.update(doc(db, COL.hero, x.id), { order: i + 1 }))
      await b.commit()
    } catch (e) {
      console.error(e)
      toast('Could not reorder.', 'err')
    }
  }
  async function toggle(item) {
    try {
      await updateDoc(doc(db, COL.hero, item.id), { visible: item.visible === false })
    } catch (e) {
      console.error(e)
      toast('Could not change it.', 'err')
    }
  }
  async function remove(item) {
    if (!window.confirm('Delete this image from the slider?')) return
    try {
      await deleteDoc(doc(db, COL.hero, item.id))
      toast('Deleted')
    } catch (e) {
      console.error(e)
      toast('Could not delete.', 'err')
    }
  }
  async function saveCfg() {
    setSavingCfg(true)
    try {
      await saveSite({ heroInterval: Number(cfg.heroInterval), heroEffect: cfg.heroEffect, heroAutoplay: !!cfg.heroAutoplay, heroFallback: cfg.heroFallback })
      toast('Slider settings saved')
    } catch (e) {
      console.error(e)
      toast('Could not save. Check your Firestore rules.', 'err')
    } finally {
      setSavingCfg(false)
    }
  }
  const setC = (k, v) => setCfg((c) => ({ ...c, [k]: v }))

  return (
    <div className="page hm">
      <div className="page-head">
        <div>
          <h1>Hero Images</h1>
          <p className="page-hint">
            Upload as many images as you like — they appear on the home page as an animated slider and keep changing one after another. The first image is shown first. If there are no images, the default design is shown.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => input.current?.click()} disabled={!!busy}>
          <ImagePlus size={18} /> {busy ? `${busy.done}/${busy.total} uploading…` : 'Upload images'}
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
      </div>

      {error && <p className="notice notice-err">The images could not be read (Firestore permission). Check your Firestore rules for rda_hero.</p>}

      {/* drop zone */}
      <div
        className={`hm-drop ${drag ? 'drag' : ''} ${busy ? 'busy' : ''}`}
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          upload(e.dataTransfer.files)
        }}
        onClick={() => !busy && input.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !busy && input.current?.click()}
      >
        <Images size={30} />
        <strong>{busy ? `Uploading ${busy.done} of ${busy.total}…` : 'Drop many images here, or click to choose them'}</strong>
        <small>JPG, PNG or WEBP · large photos (1600 px wide or more) look best · they are optimized automatically</small>
        {busy && (
          <div className="progress hm-progress">
            <span style={{ width: `${Math.max(6, (busy.done / busy.total) * 100)}%` }} />
          </div>
        )}
      </div>

      {/* live preview + settings */}
      {cfg && (
        <div className="hm-top">
          <section className="hm-preview">
            <div className="hm-preview-head">
              <h2>Live preview</h2>
              <span>{live.length} image{live.length === 1 ? '' : 's'} in the slider</span>
            </div>
            {live.length > 0 ? (
              <HeroSlideshow slides={live} site={{ ...site, ...cfg }} preview />
            ) : (
              <div className="hm-preview-empty">
                <Images size={28} />
                <p>Upload images to see the slider here.</p>
              </div>
            )}
          </section>

          <section className="panel hm-settings">
            <h2>Slider settings</h2>

            <div className="field">
              <span className="field-label">
                Time per image: <b>{Number(cfg.heroInterval).toFixed(1)} s</b>
              </span>
              <input type="range" min="3" max="15" step="0.5" value={cfg.heroInterval} onChange={(e) => setC('heroInterval', Number(e.target.value))} className="hm-range" />
              <span className="hm-scale">
                <i>Fast</i>
                <i>Slow</i>
              </span>
            </div>

            <div className="field">
              <span className="field-label">Transition</span>
              <div className="hm-fx">
                {EFFECTS.map((f) => {
                  const Icon = f.icon
                  return (
                    <button key={f.value} type="button" className={cfg.heroEffect === f.value ? 'on' : ''} onClick={() => setC('heroEffect', f.value)}>
                      <Icon size={20} />
                      <strong>{f.label}</strong>
                      <small>{f.hint}</small>
                    </button>
                  )
                })}
              </div>
            </div>

            <label className="switch">
              <input type="checkbox" checked={!!cfg.heroAutoplay} onChange={(e) => setC('heroAutoplay', e.target.checked)} />
              <span className="switch-track" />
              <span className="switch-text">{cfg.heroAutoplay ? 'Images change automatically' : 'Visitors change images themselves'}</span>
            </label>

            <div className="field">
              <span className="field-label">Show the website title and buttons on images that have no caption</span>
              <div className="mm-seg" role="tablist">
                {FALLBACKS.map((o) => (
                  <button key={o.value} type="button" role="tab" aria-selected={cfg.heroFallback === o.value} className={cfg.heroFallback === o.value ? 'on' : ''} onClick={() => setC('heroFallback', o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={saveCfg} disabled={savingCfg}>
              <Save size={18} /> {savingCfg ? 'Saving…' : 'Save slider settings'}
            </button>
          </section>
        </div>
      )}

      {/* slides */}
      <div className="hm-list-head">
        <h2>Images ({images.length})</h2>
        <p>The number on each image is its order in the slider. Hidden images stay here but are not shown on the website.</p>
      </div>
      {loading ? (
        <Loading />
      ) : images.length === 0 ? (
        <div className="empty-admin">
          <p>No hero images yet.</p>
        </div>
      ) : (
        <div className="hm-grid">
          {images.map((it, i) => (
            <Slide key={it.id} item={it} index={i} total={images.length} onMove={move} onToggle={toggle} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}