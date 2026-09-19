import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { CheckCircle2, Globe, Mail, MapPin, Phone } from 'lucide-react'
import { db, COL } from '../firebase'
import { useSite } from '../lib/data'
import { ensureUrl, lines, telHref } from '../lib/text'
import { PageBanner, Section, usePageTitle } from '../components/ui'

const TOPICS = ['Partnership', 'Funding / donor inquiry', 'UN agency / government', 'Media', 'Careers / volunteering', 'Other']

export default function Contact() {
  usePageTitle('Contact us')
  const { site } = useSite()
  const [f, setF] = useState({ name: '', email: '', phone: '', organization: '', topic: TOPICS[0], message: '', website: '' })
  const [state, setState] = useState({ busy: false, done: false, error: '' })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (f.website) return // honeypot
    setState({ busy: true, done: false, error: '' })
    try {
      const { website, ...data } = f
      await addDoc(collection(db, COL.messages), { ...data, read: false, createdAt: serverTimestamp() })
      setState({ busy: false, done: true, error: '' })
      setF({ name: '', email: '', phone: '', organization: '', topic: TOPICS[0], message: '', website: '' })
    } catch (err) {
      console.error(err)
      setState({ busy: false, done: false, error: `Your message could not be sent. Please email us directly at ${site.email}.` })
    }
  }

  return (
    <>
      <PageBanner title="Contact us" intro={site.contactIntro} crumb="Get in touch" />
      <Section>
        <div className="contact-grid">
          <aside className="contact-info">
            <h2 className="h-md">{site.orgName} – {site.country}</h2>
            <ul>
              {site.address && (
                <li>
                  <MapPin size={20} />
                  <span>{site.address}</span>
                </li>
              )}
              {lines(site.phones).map((p) => (
                <li key={p}>
                  <Phone size={20} />
                  <a href={telHref(p)}>{p}</a>
                </li>
              ))}
              {site.email && (
                <li>
                  <Mail size={20} />
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
              )}
              {site.website && (
                <li>
                  <Globe size={20} />
                  <a href={ensureUrl(site.website)} target="_blank" rel="noreferrer">
                    {site.website}
                  </a>
                </li>
              )}
            </ul>
            {site.executiveDirector && (
              <p className="contact-ed">
                Executive Director
                <strong>{site.executiveDirector}</strong>
              </p>
            )}
          </aside>

          <form className="contact-form" onSubmit={submit} noValidate={false}>
            {state.done ? (
              <div className="form-done" role="status">
                <CheckCircle2 size={38} />
                <h3>Message sent</h3>
                <p>Thank you for reaching out. A member of the RDA team will reply to you soon.</p>
                <button type="button" className="btn btn-blue" onClick={() => setState({ busy: false, done: false, error: '' })}>
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="h-md">Send us a message</h2>
                <div className="form-row">
                  <label>
                    Full name
                    <input required value={f.name} onChange={set('name')} autoComplete="name" />
                  </label>
                  <label>
                    Email
                    <input required type="email" value={f.email} onChange={set('email')} autoComplete="email" />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Phone (optional)
                    <input value={f.phone} onChange={set('phone')} autoComplete="tel" />
                  </label>
                  <label>
                    Organization (optional)
                    <input value={f.organization} onChange={set('organization')} autoComplete="organization" />
                  </label>
                </div>
                <label>
                  Topic
                  <select value={f.topic} onChange={set('topic')}>
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Message
                  <textarea required rows={6} value={f.message} onChange={set('message')} />
                </label>
                <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set('website')} />
                {state.error && (
                  <p className="form-error" role="alert">
                    {state.error}
                  </p>
                )}
                <button className="btn btn-blue" disabled={state.busy}>
                  {state.busy ? 'Sending…' : 'Send message'}
                </button>
              </>
            )}
          </form>
        </div>
      </Section>
    </>
  )
}
