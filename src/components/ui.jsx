import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Heart, ShieldCheck, Leaf, Landmark, Droplets, BookOpen, X } from 'lucide-react'
import { useSite } from '../lib/data'
import { initials } from '../lib/text'

const ICONS = { heart: Heart, shield: ShieldCheck, leaf: Leaf, landmark: Landmark, droplets: Droplets, book: BookOpen }
export const ProgramIcon = ({ name, size = 26 }) => {
  const I = ICONS[name] || Heart
  return <I size={size} strokeWidth={1.7} aria-hidden="true" />
}

export function usePageTitle(title) {
  const { site } = useSite()
  useEffect(() => {
    const base = `${site.orgName} – ${site.country}`
    document.title = title ? `${title} | ${base}` : `${base} | ${site.tagline}`
  }, [title, site.orgName, site.country, site.tagline])
}

export function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1))
      const t = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])
  return null
}

export function useLogo() {
  const { site } = useSite()
  return site.logo || '/logo.png'
}

// Khariidad-dhul (contour) — muuqaal ka turjumaya dhulka miyiga ah
export function Topo({ className = '', rings = 15, seed = 1, cx = 1050, cy = 380 }) {
  const paths = useMemo(() => {
    const out = []
    for (let i = 0; i < rings; i++) {
      const R = 46 + i * 36
      const pts = []
      const n = 140
      for (let k = 0; k <= n; k++) {
        const t = (k / n) * Math.PI * 2
        const wob =
          1 +
          0.1 * Math.sin(3 * t + seed + i * 0.16) +
          0.06 * Math.sin(5 * t + seed * 2 - i * 0.11) +
          0.035 * Math.sin(2 * t + i * 0.07 + seed * 3)
        const r = R * wob
        pts.push(`${(cx + r * Math.cos(t) * 1.55).toFixed(1)} ${(cy + r * Math.sin(t) * 0.92).toFixed(1)}`)
      }
      out.push('M' + pts.join('L') + 'Z')
    }
    return out
  }, [rings, seed, cx, cy])
  return (
    <svg className={`topo ${className}`} viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" strokeWidth={i % 5 === 0 ? 1.6 : 1} className={i % 5 === 0 ? 'topo-major' : 'topo-minor'} />
      ))}
    </svg>
  )
}

export function PageBanner({ title, intro, crumb }) {
  return (
    <header className="banner">
      <Topo seed={2.2} cx={1250} cy={300} rings={12} />
      <div className="container banner-inner">
        {crumb && <p className="banner-crumb">{crumb}</p>}
        <h1>{title}</h1>
        {intro && <p className="banner-intro">{intro}</p>}
      </div>
    </header>
  )
}

export function Section({ id, tone = 'white', className = '', art = null, children }) {
  return (
    <section id={id} className={`section tone-${tone} ${className}`}>
      {art}
      <div className="container">{children}</div>
    </section>
  )
}

export function Avatar({ name, src, color = 'blue', size = 'md' }) {
  return src ? (
    <img className={`avatar avatar-${size}`} src={src} alt={name} loading="lazy" />
  ) : (
    <span className={`avatar avatar-${size} avatar-${color}`} aria-label={name}>
      {initials(name)}
    </span>
  )
}

export function Modal({ open, onClose, title, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  )
}
