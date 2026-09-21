import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import {
  ArrowUpRight,
  Building2,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  PhoneCall,
  Send,
  Twitter,
  User,
  Youtube,
} from 'lucide-react'
import { db, COL } from '../firebase'
import { useSite } from '../lib/data'
import { ensureUrl, initials, lines, telHref } from '../lib/text'
import { PageBanner, Topo, usePageTitle } from '../components/ui'
import '../styles/contact.css'

const TOPICS = ['Partnership', 'Funding / donor inquiry', 'UN agency / government', 'Media', 'Careers / volunteering', 'Other']
const EMPTY = { name: '', email: '', phone: '', organization: '', topic: TOPICS[0], message: '', website: '' }

// Direct links: a click takes the visitor straight to the phone, WhatsApp, mail, map or website
const digits = (p) => String(p).replace(/[^\d]/g, '')
const waHref = (p) => `https://wa.me/${digits(p)}?text=${encodeURIComponent('Hello RDA team, I would like to get in touch.')}`
const mapQuery = (addr) => String(addr).replace(/^[^:]*office[^:]*:\s*/i, '').trim()
const mapsLink = (addr) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(addr))}`
const mapsEmbed = (addr) => `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(addr))}&z=13&output=embed`
const gmailLink = (email) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Message to RDA')}`

// The element appears with an animation when it reaches the screen
function InView({ as: Tag = 'div', from = 'up', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`ct-in ct-${from} ${on ? 'on' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  )
}

export default function Contact() {
  usePageTitle('Contact us')
  const { site } = useSite()
  const [f, setF] = useState(EMPTY)
  const [state, setState] = useState({ busy: false, done: false, error: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))
  const phones = lines(site.phones)
  const socials = [
    ['facebook', Facebook, 'Facebook'],
    ['twitter', Twitter, 'X / Twitter'],
    ['linkedin', Linkedin, 'LinkedIn'],
    ['instagram', Instagram, 'Instagram'],
    ['youtube', Youtube, 'YouTube'],
  ].filter(([k]) => site[k])

  async function submit(e) {
    e.preventDefault()
    if (f.website) return // honeypot
    setState({ busy: true, done: false, error: '' })
    try {
      const { website, ...data } = f
      await addDoc(collection(db, COL.messages), { ...data, read: false, createdAt: serverTimestamp() })
      setState({ busy: false, done: true, error: '' })
      setF(EMPTY)
    } catch (err) {
      console.error(err)
      setState({ busy: false, done: false, error: `Your message could not be sent. Please email us directly at ${site.email}.` })
    }
  }

  const hasCards = site.address || phones.length > 0 || site.email || site.website
  let delay = 0
  const next = () => (delay += 110) - 110

  return (
    <>
      <PageBanner title="Contact us" intro={site.contactIntro} crumb="Get in touch" />

      <div className="ct-page">
        <div className="container">
          {/* ---------- contact cards: every click goes straight to the app ---------- */}
          {hasCards && (
            <div className="ct-quick">
              {site.address && (
                <InView as="article" className="ct-card tone-blue" delay={next()}>
                  <a className="ct-hit" href={mapsLink(site.address)} target="_blank" rel="noreferrer" aria-label={`Open ${site.address} in Google Maps`} />
                  <span className="ct-ico">
                    <MapPin size={24} />
                  </span>
                  <span className="ct-card-text">
                    <small>Visit us</small>
                    <span>{site.address}</span>
                  </span>
                  <span className="ct-go" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                  <span className="ct-pills">
                    <span className="ct-pill">
                      <Navigation size={14} /> Open in Maps
                    </span>
                  </span>
                </InView>
              )}

              {phones.length > 0 && (
                <InView as="article" className="ct-card tone-green" delay={next()}>
                  <span className="ct-ico">
                    <Phone size={24} />
                  </span>
                  <span className="ct-card-text">
                    <small>Call us</small>
                    <span>Call or chat on WhatsApp</span>
                  </span>
                  <span className="ct-phones">
                    {phones.map((p) => (
                      <span className="ct-phone" key={p}>
                        <a className="ct-num" href={telHref(p)}>
                          {p}
                        </a>
                        <a className="ct-mini call" href={telHref(p)} aria-label={`Call ${p}`} title="Call">
                          <PhoneCall size={16} />
                        </a>
                        <a className="ct-mini wa" href={waHref(p)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${p}`} title="WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                      </span>
                    ))}
                  </span>
                </InView>
              )}

              {site.email && (
                <InView as="article" className="ct-card tone-red" delay={next()}>
                  <a className="ct-hit" href={`mailto:${site.email}`} aria-label={`Send an email to ${site.email}`} />
                  <span className="ct-ico">
                    <Mail size={24} />
                  </span>
                  <span className="ct-card-text">
                    <small>Email us</small>
                    <span className="ct-email">{site.email}</span>
                  </span>
                  <span className="ct-go" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                  <span className="ct-pills">
                    <span className="ct-pill">
                      <Send size={14} /> Send email
                    </span>
                    <a className="ct-pill ct-pill-link" href={gmailLink(site.email)} target="_blank" rel="noreferrer">
                      Gmail
                    </a>
                  </span>
                </InView>
              )}

              {site.website && (
                <InView as="article" className="ct-card tone-indigo" delay={next()}>
                  <a className="ct-hit" href={ensureUrl(site.website)} target="_blank" rel="noreferrer" aria-label={`Open ${site.website}`} />
                  <span className="ct-ico">
                    <Globe size={24} />
                  </span>
                  <span className="ct-card-text">
                    <small>Website</small>
                    <span>{site.website}</span>
                  </span>
                  <span className="ct-go" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                  <span className="ct-pills">
                    <span className="ct-pill">
                      <Globe size={14} /> Visit website
                    </span>
                  </span>
                </InView>
              )}
            </div>
          )}

          {/* ---------- form + direct actions ---------- */}
          <div className="ct-main">
            <InView as="form" from="left" className="ct-form" onSubmit={submit}>
              <span className="ct-deco" aria-hidden="true" />
              {state.done ? (
                <div className="ct-done" role="status">
                  <svg viewBox="0 0 80 80" width="88" height="88" aria-hidden="true">
                    <circle className="ct-done-ring" cx="40" cy="40" r="34" />
                    <path className="ct-done-check" d="M24 41.5 35 52.5 57 29" />
                  </svg>
                  <h2>Message sent</h2>
                  <p>Thank you for reaching out. A member of the RDA team will reply to you soon.</p>
                  <button type="button" className="ct-send" onClick={() => setState({ busy: false, done: false, error: '' })}>
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="ct-form-head">
                    <h2>Send us a message</h2>
                    <p>Tell us how we can help and the right person on our team will get back to you.</p>
                  </div>

                  <div className="ct-row">
                    <label className="ct-field">
                      <User size={19} />
                      <input required placeholder=" " value={f.name} onChange={set('name')} autoComplete="name" />
                      <span>Full name</span>
                    </label>
                    <label className="ct-field">
                      <Mail size={19} />
                      <input required type="email" placeholder=" " value={f.email} onChange={set('email')} autoComplete="email" />
                      <span>Email</span>
                    </label>
                  </div>

                  <div className="ct-row">
                    <label className="ct-field">
                      <Phone size={19} />
                      <input placeholder=" " value={f.phone} onChange={set('phone')} autoComplete="tel" />
                      <span>Phone (optional)</span>
                    </label>
                    <label className="ct-field">
                      <Building2 size={19} />
                      <input placeholder=" " value={f.organization} onChange={set('organization')} autoComplete="organization" />
                      <span>Organization (optional)</span>
                    </label>
                  </div>

                  <fieldset className="ct-topics">
                    <legend>What is this about?</legend>
                    <div role="radiogroup" aria-label="Topic">
                      {TOPICS.map((t) => (
                        <button key={t} type="button" role="radio" aria-checked={f.topic === t} className={f.topic === t ? 'on' : ''} onClick={() => setF((s) => ({ ...s, topic: t }))}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="ct-field ct-area">
                    <MessageSquare size={19} />
                    <textarea required rows={6} placeholder=" " value={f.message} onChange={set('message')} />
                    <span>Message</span>
                  </label>

                  <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} />

                  {state.error && (
                    <p className="ct-error" role="alert">
                      {state.error}
                    </p>
                  )}

                  <button className="ct-send" disabled={state.busy}>
                    {state.busy ? (
                      <>
                        <span className="ct-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send message <Send size={18} />
                      </>
                    )}
                  </button>
                </>
              )}
            </InView>

            <InView as="aside" from="right" delay={120} className="ct-aside">
              <Topo seed={2.6} cx={1200} cy={200} rings={9} />
              <div className="ct-aside-in">
                <h2>Prefer to talk directly?</h2>
                <p>{site.contactIntro}</p>

                {site.executiveDirector && (
                  <div className="ct-ed">
                    <span className="ct-ed-av">{initials(site.executiveDirector)}</span>
                    <span>
                      <small>Executive Director</small>
                      <strong>{site.executiveDirector}</strong>
                    </span>
                  </div>
                )}

                <div className="ct-act">
                  {phones[0] && (
                    <a className="ct-act-btn call" href={telHref(phones[0])}>
                      <PhoneCall size={20} />
                      <span>
                        <b>Call now</b>
                        <small>{phones[0]}</small>
                      </span>
                    </a>
                  )}
                  {phones[0] && (
                    <a className="ct-act-btn wa" href={waHref(phones[0])} target="_blank" rel="noreferrer">
                      <MessageCircle size={20} />
                      <span>
                        <b>Chat on WhatsApp</b>
                        <small>Opens WhatsApp</small>
                      </span>
                    </a>
                  )}
                  {site.email && (
                    <a className="ct-act-btn mail" href={`mailto:${site.email}`}>
                      <Mail size={20} />
                      <span>
                        <b>Send an email</b>
                        <small>{site.email}</small>
                      </span>
                    </a>
                  )}
                </div>

                {socials.length > 0 && (
                  <div className="ct-socials">
                    {socials.map(([k, Icon, label]) => (
                      <a key={k} href={ensureUrl(site[k])} target="_blank" rel="noreferrer" aria-label={label}>
                        <Icon size={18} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </InView>
          </div>

          {/* ---------- map ---------- */}
          {site.address && (
            <InView className="ct-map">
              <iframe title={`Map: ${site.address}`} src={mapsEmbed(site.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              <div className="ct-map-card">
                <span className="ct-ico">
                  <MapPin size={22} />
                </span>
                <div>
                  <strong>{site.orgName}</strong>
                  <span>{site.address}</span>
                </div>
                <a className="ct-dir" href={mapsLink(site.address)} target="_blank" rel="noreferrer">
                  <Navigation size={16} /> Get directions
                </a>
              </div>
            </InView>
          )}
        </div>
      </div>
    </>
  )
}