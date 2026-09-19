import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useContent } from '../lib/data'
import { Loading, PageBanner, Section, usePageTitle } from '../components/ui'

function Lightbox({ items, index, setIndex }) {
  const close = useCallback(() => setIndex(null), [setIndex])
  const go = useCallback((d) => setIndex((i) => (i + d + items.length) % items.length), [items.length, setIndex])
  useEffect(() => {
    if (index === null) return
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
  }, [index, close, go])
  if (index === null) return null
  const it = items[index]
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={close}>
      <button type="button" className="lb-close" onClick={close} aria-label="Close">
        <X size={26} />
      </button>
      {items.length > 1 && (
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
        <img src={it.image} alt={it.caption || ''} />
        {(it.caption || it.category) && <figcaption>{it.caption || it.category}</figcaption>}
      </figure>
    </div>
  )
}

export default function Gallery() {
  usePageTitle('Photo gallery')
  const { items, loading } = useContent('rda_gallery')
  const [cat, setCat] = useState('All')
  const [idx, setIdx] = useState(null)
  const cats = useMemo(() => ['All', ...Array.from(new Set(items.map((g) => g.category).filter(Boolean)))], [items])
  const list = cat === 'All' ? items : items.filter((g) => g.category === cat)

  return (
    <>
      <PageBanner title="Photo gallery" intro="Moments from RDA programs and communities across Somalia." crumb="Media" />
      <Section>
        {loading && <Loading />}
        {!loading && items.length === 0 && (
          <div className="empty">
            <h2 className="h-md">Gallery coming soon</h2>
            <p>Photos from our programs will appear here.</p>
          </div>
        )}
        {cats.length > 2 && (
          <div className="chips">
            {cats.map((c) => (
              <button key={c} type="button" className={`chip-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="masonry">
          {list.map((g, i) => (
            <button type="button" key={g.id} className="masonry-item" onClick={() => setIdx(i)} aria-label={g.caption || 'Open photo'}>
              <img src={g.image} alt={g.caption || ''} loading="lazy" />
              {g.caption && <span>{g.caption}</span>}
            </button>
          ))}
        </div>
      </Section>
      <Lightbox items={list} index={idx} setIndex={setIdx} />
    </>
  )
}
