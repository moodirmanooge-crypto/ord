import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/hero-fx.css'

const isExt = (u = '') => /^(https?:|mailto:|tel:)/i.test(u)
const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Caption text: word by word animation
function Words({ text }) {
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((w, k) => (
      <Fragment key={k}>
        <span style={{ '--w': k }}>{w}</span>{' '}
      </Fragment>
    ))
}

/**
 * Home page hero slider (images uploaded in Admin → Hero Images).
 * Settings come from the site document: heroInterval (seconds), heroEffect (fade | slide | zoom),
 * heroAutoplay (true/false), heroFallback (first | all | none = where the website title is shown when an image has no caption).
 * `preview` = used inside the admin panel (nothing is clickable).
 */
export default function HeroSlideshow({ slides, site, preview = false }) {
  const n = slides.length
  const interval = Math.min(15, Math.max(3, Number(site.heroInterval) || 6.5)) * 1000
  const effect = ['fade', 'slide', 'zoom'].includes(site.heroEffect) ? site.heroEffect : 'fade'
  const autoplay = site.heroAutoplay !== false
  const fallback = ['first', 'all', 'none'].includes(site.heroFallback) ? site.heroFallback : 'first'

  const [st, setSt] = useState({ cur: 0, prev: -1, dir: 1 })
  const [paused, setPaused] = useState(false)
  const touch = useRef(null)
  const cur = n ? st.cur % n : 0
  const prev = st.prev >= 0 && st.prev < n ? st.prev : -1

  const step = useCallback((d) => setSt((s) => ({ cur: (s.cur + d + n) % n, prev: s.cur % n, dir: d })), [n])
  const goTo = useCallback((k) => setSt((s) => (k === s.cur % n ? s : { cur: k, prev: s.cur % n, dir: k > s.cur % n ? 1 : -1 })), [n])

  // Every image gets the full interval; a manual change restarts the timer
  useEffect(() => {
    if (n < 2 || !autoplay || paused || prefersReduced()) return undefined
    const t = setTimeout(() => step(1), interval)
    return () => clearTimeout(t)
  }, [cur, n, autoplay, paused, interval, step])

  const Cta = preview ? 'span' : Link

  return (
    <section
      className={`wslider fx-${effect} ${st.dir < 0 ? 'rev' : ''} ${preview ? 'is-preview' : ''}`}
      aria-roledescription="carousel"
      aria-label="RDA"
      tabIndex={preview ? -1 : 0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (n < 2) return
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      onTouchStart={(e) => {
        touch.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        if (touch.current === null || n < 2) return
        const dx = e.changedTouches[0].clientX - touch.current
        touch.current = null
        if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1)
      }}
    >
      {slides.map((s, k) => {
        const on = k === cur
        const own = String(s.caption || '').trim()
        const text = own || (fallback === 'all' || (fallback === 'first' && k === 0) ? site.heroTitle : '')
        const title = <Words text={text} />
        const tab = on && !preview ? 0 : -1
        return (
          <div key={s.id} className={`wslide ${on ? 'on' : ''} ${!on && k === prev ? 'prev' : ''}`} aria-hidden={!on} role="group" aria-roledescription="slide" aria-label={`${k + 1} / ${n}`}>
            <img src={s.image} alt="" loading={k === 0 ? 'eager' : 'lazy'} draggable="false" />
            <div className="wslide-shade" />
            {text && (
              <div className="container wcap-wrap">
                <div className="wcap">
                  <div className="wcap-in">
                    <h2>
                      {s.link && !preview ? (
                        isExt(s.link) ? (
                          <a href={s.link} target="_blank" rel="noreferrer" tabIndex={tab}>
                            {title}
                          </a>
                        ) : (
                          <Link to={s.link} tabIndex={tab}>
                            {title}
                          </Link>
                        )
                      ) : (
                        title
                      )}
                    </h2>
                  </div>
                  <div className="wcap-cta">
                    <Cta {...(preview ? {} : { to: '/programs', tabIndex: tab })} className="btn btn-light">
                      Explore our programs
                    </Cta>
                    <Cta {...(preview ? {} : { to: '/partner', tabIndex: tab })} className="btn btn-outline-light">
                      Partner with us
                    </Cta>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {n > 1 && (
        <>
          <button type="button" className="wnav wprev" onClick={() => step(-1)} aria-label="Previous image" tabIndex={preview ? -1 : 0}>
            <ChevronLeft size={28} />
          </button>
          <button type="button" className="wnav wnext" onClick={() => step(1)} aria-label="Next image" tabIndex={preview ? -1 : 0}>
            <ChevronRight size={28} />
          </button>
          <div className="wdots" role="tablist" aria-label="Hero images">
            {slides.map((s, k) => (
              <button key={s.id} type="button" role="tab" aria-selected={k === cur} className={k === cur ? 'on' : ''} onClick={() => goTo(k)} aria-label={`Image ${k + 1}`} tabIndex={preview ? -1 : 0} />
            ))}
          </div>
          {autoplay && !prefersReduced() && <div key={`${cur}-${interval}`} className={`wprog ${paused ? 'paused' : ''}`} style={{ animationDuration: `${interval}ms` }} />}
        </>
      )}
    </section>
  )
}