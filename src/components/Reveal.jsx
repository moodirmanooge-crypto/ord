import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Animation-ka scroll-ka: qoraal, sawir iyo kaararka website-ka oo dhan ayaa si qurux badan u soo muuqda
 * marka la yimaado muuqaalka. Bogag kasta lama taabto — element-yada waa la helayaa si toos ah.
 * (Admin panel-ka lama saameeyo; prefers-reduced-motion waa la ixtiraamaa.)
 */

// Qaybaha "container" — waxay is-dhaqaaqaan oo waxa ku dhex jira lama kala dhaqaajiyo
const CONTAINERS = [
  '.glance > div',
  '.why-list li',
  '.values li',
  '.toc-flow li',
  '.tick-list li',
  '.record-list li',
  '.region-list li',
  '.region-card',
  '.region-head',
  '.sector-row',
  '.news-card',
  '.people-grid > *',
  '.lead-wrap',
  '.masonry-item',
  '.gallery-strip a',
  '.priority-grid article',
  '.offer',
  '.two-notes article',
  '.vm-grid article',
  '.callout',
  '.def-list > div',
  '.contact-info',
  '.contact-form',
  '.table-wrap',
  '.org-chart',
  '.partner-logos > *',
  '.footer-about',
  '.footer-col',
  '.sf-brand',
  '.sf-col',
].join(',')

// Element-yada gooni ah (qoraal, sawir, badhan...)
const LEAF = [
  'main h1',
  'main h2',
  'main h3',
  'main h4',
  'main p',
  'main li',
  'main img',
  'main svg.nexus-svg',
  'main .btn',
  'main .text-link',
  'main .pillar-badge',
].join(',')

const SPLITS = '.split, .pillar-grid, .intro-grid, .nexus, .contact-grid, .why-grid'
const EXCLUDE = '.hero, .wslider, .marquee, .stats-band, .banner, .modal-back, .lightbox, .site-header, .mobile-menu, .admin, .login'

function kindOf(el) {
  if (el.matches('.about-logo, svg.nexus-svg, .pillar-badge')) return 'pop'
  if (el.matches('img, .org-chart')) return 'img'
  const split = el.closest(SPLITS)
  if (split) {
    const col = Array.from(split.children).find((c) => c.contains(el))
    const idx = col ? Array.from(split.children).indexOf(col) : -1
    if (idx === 0) return 'left'
    if (idx === 1) return 'right'
  }
  return 'up'
}

export default function Reveal() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    if (pathname.startsWith('/admin')) return undefined
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const seen = new WeakSet()
    const timers = new Set()

    const show = (el, i) => {
      io.unobserve(el)
      el.setAttribute('data-d', String(Math.min(i, 8))) // cascade: kuwa isku-mar soo muuqda waa is-xigaan
      el.setAttribute('data-in', '')
      // Marka animation-ku dhamaado, calaamadaha waa la tirtiraa (hover/transition caadi ah ayaa soo noqda)
      const t = setTimeout(() => {
        el.removeAttribute('data-rv')
        el.removeAttribute('data-in')
        el.removeAttribute('data-d')
        timers.delete(t)
      }, 2300 + Math.min(i, 8) * 90)
      timers.add(t)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach((entry, i) => show(entry.target, i))
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    )

    // Shabakad ammaan ah: haddii element muuqda uu weli qarsoon yahay, waa la muujiyaa
    let sweepTimer = null
    const sweep = () => {
      sweepTimer = null
      let i = 0
      document.querySelectorAll('[data-rv]:not([data-in])').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.bottom > 0 && r.top < window.innerHeight * 0.92) show(el, i++)
      })
    }
    const scheduleSweep = () => {
      if (!sweepTimer) sweepTimer = setTimeout(sweep, 250)
    }
    window.addEventListener('scroll', scheduleSweep, { passive: true })
    scheduleSweep()

    const scan = () => {
      const root = document.getElementById('root')
      if (!root) return
      root.querySelectorAll(`${CONTAINERS}, ${LEAF}`).forEach((el) => {
        if (seen.has(el)) return
        if (el.closest(EXCLUDE)) return
        const isContainer = el.matches(CONTAINERS)
        if (!isContainer && el.parentElement && el.parentElement.closest(CONTAINERS)) return // qayb ka mid ah container
        seen.add(el)
        el.setAttribute('data-rv', kindOf(el))
        io.observe(el)
      })
    }

    scan()
    const mo = new MutationObserver(scan) // waxyaabaha Firestore ka yimaadda ee dambe
    mo.observe(document.getElementById('root'), { childList: true, subtree: true })

    return () => {
      window.removeEventListener('scroll', scheduleSweep)
      clearTimeout(sweepTimer)
      mo.disconnect()
      io.disconnect()
      timers.forEach(clearTimeout)
      // haddii bogga laga baxo, ha ka harin element hoos u dhigan
      document.querySelectorAll('[data-rv]').forEach((el) => {
        el.removeAttribute('data-rv')
        el.removeAttribute('data-in')
        el.removeAttribute('data-d')
      })
    }
  }, [pathname])

  return null
}