import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useContent, useSite, colorVar } from '../lib/data'
import { paras, rows, titled } from '../lib/text'
import { Section, Topo, ProgramIcon, useLogo, usePageTitle } from '../components/ui'
import { NewsCard, sortNews } from '../components/cards'
import HeroSlideshow from '../components/HeroSlideshow'

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Afarta barnaamij (tile) — hero-ga hoostiisa
function PillarStrip({ programs }) {
  return (
    <div className="hero-pillars">
      {programs.map((p) => (
        <Link key={p.id} to={`/programs#${p.slug || p.id}`} className="pillar-tile" style={{ '--tile': colorVar(p.color) }}>
          <ProgramIcon name={p.icon} />
          <strong>{p.title}</strong>
          <span>{p.subtitle}</span>
        </Link>
      ))}
    </div>
  )
}

function Hero({ slides, programs }) {
  const { site } = useSite()
  const logo = useLogo()
  // Only images that are not hidden in Admin → Hero Images
  const photos = slides.filter((s) => s.image && s.visible !== false)

  // Images uploaded by the admin → slider (fade / slide / zoom, set in Admin → Hero Images); otherwise the original hero
  if (photos.length > 0) {
    return (
      <>
        <HeroSlideshow slides={photos} site={site} />
        <PillarStrip programs={programs} />
      </>
    )
  }

  return (
    <section className="hero">
      <Topo seed={1.3} rings={16} />

      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>{site.heroTitle}</h1>
          <p className="hero-text">{site.heroText}</p>
          <div className="hero-cta">
            <Link to="/programs" className="btn btn-light">
              Explore our programs
            </Link>
            <Link to="/partner" className="btn btn-outline-light">
              Partner with us
            </Link>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <img src={logo} alt="" />
        </div>
      </div>

      <PillarStrip programs={programs} />
    </section>
  )
}

// Tirinta (count-up) marka la gaaro muuqaalka
function CountUp({ value }) {
  const ref = useRef(null)
  const m = String(value).match(/^([^\d-]*)(\d[\d.,]*)(.*)$/)
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : NaN
  const [n, setN] = useState(prefersReduced() ? target : 0)

  useEffect(() => {
    if (!m || Number.isNaN(target) || prefersReduced() || !('IntersectionObserver' in window)) {
      setN(target)
      return undefined
    }
    let raf = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const t0 = performance.now()
        const tick = (t) => {
          const k = Math.min(1, (t - t0) / 1900)
          setN(target * (1 - Math.pow(1 - k, 3)))
          if (k < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.35 },
    )
    io.observe(ref.current)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value]) // eslint-disable-line

  if (!m || Number.isNaN(target)) return <span ref={ref}>{value}</span>
  return (
    <span ref={ref}>
      {m[1]}
      {Math.round(n).toLocaleString('en-US')}
      {m[3]}
    </span>
  )
}

function StatsBand({ text }) {
  const list = rows(text).filter((r) => r[0])
  if (!list.length) return null
  return (
    <section className="stats-band" aria-label="RDA in numbers">
      <div className="container stats-grid">
        {list.map(([num, label], k) => (
          <div className="stat" key={k}>
            <b>
              <CountUp value={num} />
            </b>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

const partnerNode = (p, hidden = false) => {
  const inner = p.logo ? <img src={p.logo} alt={hidden ? '' : p.name} loading="lazy" /> : <span>{p.name}</span>
  return p.url ? (
    <a href={/^https?:/.test(p.url) ? p.url : `https://${p.url}`} target="_blank" rel="noreferrer" title={p.name} tabIndex={hidden ? -1 : undefined}>
      {inner}
    </a>
  ) : (
    <div title={p.name}>{inner}</div>
  )
}

function Nexus() {
  return (
    <svg className="nexus-svg" viewBox="0 0 420 390" role="img" aria-label="Humanitarian, Development and Peace circles overlapping at the centre">
      <g style={{ mixBlendMode: 'multiply' }}>
        <circle cx="210" cy="125" r="112" fill="#d62e38" fillOpacity=".88" />
        <circle cx="128" cy="262" r="112" fill="#1b75bc" fillOpacity=".88" />
        <circle cx="292" cy="262" r="112" fill="#0f8f4c" fillOpacity=".88" />
      </g>
      <g fill="#fff" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700" textAnchor="middle">
        <text x="210" y="82" fontSize="19">Humanitarian</text>
        <text x="104" y="300" fontSize="19">Development</text>
        <text x="330" y="300" fontSize="19">Peace</text>
        <text x="210" y="212" fontSize="17">RDA</text>
      </g>
    </svg>
  )
}

export default function Home() {
  usePageTitle('')
  const { site } = useSite()
  const { items: programs } = useContent('rda_programs')
  const { items: regions } = useContent('rda_regions')
  const { items: slides } = useContent('rda_hero')
  const { items: news } = useContent('rda_news')
  const { items: gallery } = useContent('rda_gallery')
  const { items: partners } = useContent('rda_partners')
  const latest = sortNews(news).slice(0, 3)
  const why = titled(site.whyPartner)

  return (
    <>
      <Hero slides={slides} programs={programs} />

      <Section>
        <div className="intro-grid">
          <div>
            <h2 className="h-lg">A Somali-led organization, built to the standards donors expect</h2>
            {paras(site.summary).map((p, k) => (
              <p key={k} className="lead-p">
                {p}
              </p>
            ))}
            <Link to="/about" className="text-link">
              More about RDA
            </Link>
          </div>
          <dl className="glance">
            {rows(site.glance).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <StatsBand text={site.stats} />

      <Section tone="paper">
        <div className="nexus">
          <Nexus />
          <div>
            <h2 className="h-lg">Relief that is built to become recovery</h2>
            <p className="lead-p">
              Every RDA program is anchored in the Humanitarian–Development–Peace Nexus. Life-saving assistance is deliberately linked to investments in health, education, livelihoods,
              protection, WASH, climate adaptation and local governance, so it lays foundations instead of running as a parallel track.
            </p>
            <p className="lead-p">{site.mission}</p>
            <Link to="/about#strategy" className="text-link">
              Our theory of change
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="navy" className="where-home" art={<Topo seed={3.4} cx={1250} cy={300} rings={11} />}>
        <div className="where-head">
          <h2 className="h-lg on-dark">Rooted in Mogadishu, present across five Federal Member States</h2>
          <Link to="/where-we-work" className="text-link on-dark">
            See where we work
          </Link>
        </div>
        <ul className="region-list">
          {regions.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong>
              <span>{r.kind}</span>
            </li>
          ))}
        </ul>
      </Section>

      {latest.length > 0 && (
        <Section>
          <div className="sec-head">
            <h2 className="h-lg">Latest from the field</h2>
            <Link to="/news" className="text-link">
              All news
            </Link>
          </div>
          <div className="news-grid">
            {latest.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        </Section>
      )}

      {gallery.length > 0 && (
        <Section tone="paper">
          <div className="sec-head">
            <h2 className="h-lg">Our work in pictures</h2>
            <Link to="/gallery" className="text-link">
              Full gallery
            </Link>
          </div>
          <div className="gallery-strip">
            {gallery.slice(0, 6).map((g) => (
              <Link to="/gallery" key={g.id}>
                <img src={g.image} alt={g.caption || ''} loading="lazy" />
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="why-grid">
          <div className="why-head">
            <h2 className="h-lg">Why partner with RDA</h2>
            <p className="lead-p">Technical credibility, institutional maturity and contextual legitimacy, in one Somali-led implementing partner.</p>
            <Link to="/partner" className="btn btn-blue">
              Partnership details
            </Link>
          </div>
          <ol className="why-list">
            {why.map((w, k) => (
              <li key={k}>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {partners.length > 0 && (
        <Section tone="paper" className="partners-band">
          <h2 className="h-md">Working alongside</h2>
          {partners.length >= 4 ? (
            <div className="marquee" aria-label="Partners">
              <div className="marquee-track">
                {[...partners, ...partners].map((p, k) => (
                  <div className="marquee-item" key={`${p.id}-${k}`} aria-hidden={k >= partners.length ? 'true' : undefined}>
                    {partnerNode(p, k >= partners.length)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="partner-logos">
              {partners.map((p) => (
                <div key={p.id}>{partnerNode(p)}</div>
              ))}
            </div>
          )}
        </Section>
      )}

      <section className="cta-band">
        <Topo seed={5.5} cx={800} cy={400} rings={9} />
        <div className="container cta-inner">
          <h2>Start a conversation with RDA</h2>
          <p>{site.contactIntro}</p>
          <div className="hero-cta">
            <Link to="/contact" className="btn btn-light">
              Contact us
            </Link>
            {site.email && (
              <a href={`mailto:${site.email}`} className="btn btn-outline-light">
                <Mail size={17} /> {site.email}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}