import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useContent, useRawCollection } from '../lib/data'
import { resolveTo } from '../lib/menu'
import { MEDIA_COL, parseVideo } from '../lib/media'
import { Section } from './ui'
import '../styles/pageextras.css'

/**
 * Shows the photos & videos that the admin attached (Admin → Navbar & Dropdowns → item → Photos & videos)
 * at the bottom of the page that the menu item opens.
 */
export default function PageExtras() {
  const { pathname } = useLocation()
  const { items: menu } = useContent('rda_menu')
  const media = useRawCollection(MEDIA_COL)
  const [lb, setLb] = useState(null) // { images, index }

  const groups = useMemo(() => {
    if (!media.items.length) return []
    const byTarget = {}
    media.items.forEach((m) => {
      ;(byTarget[m.target] ||= []).push(m)
    })
    const here = pathname.replace(/\/+$/, '') || '/'
    const out = []
    const consider = (it) => {
      if (it.visible === false || !['route', 'page'].includes(it.kind)) return
      const to = resolveTo(it)
      if (!to || (to.split('#')[0].replace(/\/+$/, '') || '/') !== here) return
      const list = byTarget[it.id]
      if (!list || !list.length) return
      out.push({
        id: it.id,
        label: it.label,
        images: list.filter((m) => m.type !== 'video' && m.url),
        videos: list.filter((m) => m.type === 'video' && m.url),
      })
    }
    menu.forEach((m) => {
      consider(m)
      ;(m.children || []).forEach(consider)
    })
    return out
  }, [media.items, menu, pathname])

  const close = useCallback(() => setLb(null), [])
  const go = useCallback((d) => setLb((s) => (s ? { ...s, index: (s.index + d + s.images.length) % s.images.length } : s)), [])

  useEffect(() => {
    if (!lb) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lb, close, go])

  if (!groups.length) return null

  return (
    <>
      {groups.map((g, gi) => (
        <Section key={g.id} tone={gi % 2 ? 'white' : 'paper'} className="px">
          <h2 className="h-lg">{g.label}</h2>

          {g.images.length > 0 && (
            <div className={`px-grid ${g.images.length === 1 ? 'px-single' : ''}`}>
              {g.images.map((m, i) => (
                <button key={m.id} type="button" className="px-img" onClick={() => setLb({ images: g.images, index: i })} aria-label={m.caption || 'Open photo'}>
                  <img src={m.url} alt={m.caption || ''} loading="lazy" />
                  {m.caption && <span>{m.caption}</span>}
                </button>
              ))}
            </div>
          )}

          {g.videos.length > 0 && (
            <div className="px-videos">
              {g.videos.map((m) => {
                const v = parseVideo(m.url)
                return (
                  <figure key={m.id} className="px-video">
                    <div className="px-frame">
                      {v.kind === 'file' ? (
                        <video controls preload="metadata" playsInline src={m.url} />
                      ) : (
                        <iframe
                          src={v.embed}
                          title={m.caption || g.label}
                          loading="lazy"
                          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      )}
                    </div>
                    {m.caption && <figcaption>{m.caption}</figcaption>}
                  </figure>
                )
              })}
            </div>
          )}
        </Section>
      ))}

      {lb && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
          <button type="button" className="lb-close" onClick={close} aria-label="Close">
            <X size={26} />
          </button>
          {lb.images.length > 1 && (
            <>
              <button type="button" className="lb-nav lb-prev" onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous">
                <ChevronLeft size={30} />
              </button>
              <button type="button" className="lb-nav lb-next" onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next">
                <ChevronRight size={30} />
              </button>
            </>
          )}
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={lb.images[lb.index].url} alt={lb.images[lb.index].caption || ''} />
            {lb.images[lb.index].caption && <figcaption>{lb.images[lb.index].caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  )
}