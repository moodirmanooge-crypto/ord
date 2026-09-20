import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { Building2, Facebook, Globe, Instagram, Linkedin, Mail, MapPin, MessageSquare, Phone, Send, Twitter, User, Youtube } from 'lucide-react'
import { db, COL } from '../firebase'
import { useSite } from '../lib/data'
import { ensureUrl, initials, lines, telHref } from '../lib/text'
import { PageBanner, Topo, usePageTitle } from '../components/ui'
import '../styles/contact.css'

const TOPICS = ['Partnership', 'Funding / donor inquiry', 'UN agency / government', 'Media', 'Careers / volunteering', 'Other']
const EMPTY = { name: '', email: '', phone: '', organization: '', topic: TOPICS[0], message: '', website: '' }

// Element-ku wuxuu si qurux badan u soo muuqdaa marka la gaaro muuqaalka
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

  const quick = [
    site.address && { key: 'visit', tone: 'blue', icon: MapPin, label: 'Visit us', body: <span>{site.address}</span> },
    phones.length > 0 && {
      key: 'call',
      tone: 'green',
      icon: Phone,
      label: 'Call us',
      body: phones.map((p) => (
        <a key={p} href={telHref(p)}>
          {p}
        </a>
      )),
    },
    site.email && {
      key: 'mail',
      tone: 'red',
      icon: Mail,
      label: 'Email us',
      body: <a href={`mailto:${site.email}`}>{site.email}</a>,
    },
    site.website && {
      key: 'web',
      tone: 'indigo',
      icon: Globe,
      label: 'Website',
      body: (
        <a href={ensureUrl(site.website)} target="_blank" rel="noreferrer">
          {site.website}
        </a>
      ),
    },
  ].filter(Boolean)

  return (
    <>
      <PageBanner title="Contact us" intro={site.contactIntro} crumb="Get in touch" />

      <div className="ct-page">
        <div className="container">
          {quick.length > 0 && (
            <div className="ct-quick">
              {quick.map((q, i) => {
                const Icon = q.icon
                return (
                  <InView key={q.key} className={`ct-card tone-${q.tone}`} delay={i * 110}>
                    <span className="ct-ico">
                      <Icon size={24} />
                    </span>
                    <span className="ct-card-text">
                      <small>{q.label}</small>
                      {q.body}
                    </span>
                  </InView>
                )
              })}
            </div>
          )}

          <div className="ct-main">
            <InView as="form" from="left" className="ct-form" onSubmit={submit}>
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

                {site.email && (
                  <a className="ct-mailbtn" href={`mailto:${site.email}`}>
                    <Mail size={18} /> {site.email}
                  </a>
                )}

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
        </div>
      </div>
    </>
  )
}