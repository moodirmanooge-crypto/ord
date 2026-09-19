import { Link } from 'react-router-dom'
import { ExternalLink, Image, Inbox, Layers, MapPin, Newspaper, Plus, Handshake, Users, GalleryHorizontal } from 'lucide-react'
import { COL } from '../firebase'
import { useContent, useRawCollection } from '../lib/data'
import { fmtDate, toMillis } from '../lib/text'
import { useAuth } from './auth'

function Tile({ icon: Icon, label, value, to, tone }) {
  return (
    <Link to={to} className={`tile tile-${tone}`}>
      <span className="tile-icon">
        <Icon size={22} />
      </span>
      <span className="tile-num">{value}</span>
      <span className="tile-label">{label}</span>
    </Link>
  )
}

export default function Dashboard() {
  const { user, can } = useAuth()
  const hero = useRawCollection(COL.hero)
  const news = useRawCollection(COL.news)
  const gallery = useRawCollection(COL.gallery)
  const partners = useRawCollection(COL.partners)
  const messages = useRawCollection(COL.messages)
  const programs = useContent(COL.programs)
  const team = useContent(COL.team)
  const regions = useContent(COL.regions)

  const unread = messages.items.filter((m) => !m.read).length
  const latest = messages.items.slice().sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)).slice(0, 5)
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Subax wanaagsan' : hour < 18 ? 'Galab wanaagsan' : 'Fiid wanaagsan'

  const tiles = [
    { key: 'messages', icon: Inbox, label: unread ? `Fariimo (${unread} cusub)` : 'Fariimo', value: messages.items.length, to: '/admin/messages', tone: 'red' },
    { key: 'news', icon: Newspaper, label: 'Wararka', value: news.items.length, to: '/admin/news', tone: 'blue' },
    { key: 'gallery', icon: GalleryHorizontal, label: 'Sawirrada Gallery', value: gallery.items.length, to: '/admin/gallery', tone: 'green' },
    { key: 'programs', icon: Layers, label: 'Barnaamijyo', value: programs.items.length, to: '/admin/programs', tone: 'indigo' },
    { key: 'team', icon: Users, label: 'Hoggaan & Board', value: team.items.length, to: '/admin/team', tone: 'blue' },
    { key: 'regions', icon: MapPin, label: 'Goobaha shaqada', value: regions.items.length, to: '/admin/regions', tone: 'green' },
    { key: 'hero', icon: Image, label: 'Hero sawirro', value: hero.items.length, to: '/admin/hero', tone: 'indigo' },
    { key: 'partners', icon: Handshake, label: 'Iskaashato', value: partners.items.length, to: '/admin/partners', tone: 'red' },
  ].filter((t) => can(t.key))

  const quick = [
    { key: 'news', label: 'Ku dar war cusub', to: '/admin/news' },
    { key: 'gallery', label: 'Ku shub sawirro', to: '/admin/gallery' },
    { key: 'team', label: 'Ku dar xubin', to: '/admin/team' },
    { key: 'site', label: 'Wax ka beddel macluumaadka', to: '/admin/site' },
  ].filter((q) => can(q.key))

  return (
    <div className="page">
      <div className="welcome">
        <div>
          <h1>
            {greet}, {user.name || user.username}
          </h1>
          <p>Halkan waxaad ka maamuli kartaa website-ka RDA oo dhan: qoraalka, sawirrada, wararka iyo fariimaha.</p>
        </div>
        <a className="btn-secondary on-navy" href="/" target="_blank" rel="noreferrer">
          <ExternalLink size={17} /> Fur website-ka
        </a>
      </div>

      <div className="tiles">
        {tiles.map((t) => (
          <Tile key={t.key} {...t} />
        ))}
      </div>

      <div className="dash-grid">
        {can('messages') && (
          <section className="panel">
            <div className="panel-head">
              <h2>Fariimihii u dambeeyay</h2>
              <Link to="/admin/messages" className="link">
                Dhammaan
              </Link>
            </div>
            {latest.length === 0 ? (
              <p className="muted">Fariin wali ma timaadin.</p>
            ) : (
              <ul className="mini-list">
                {latest.map((m) => (
                  <li key={m.id} className={m.read ? '' : 'unread'}>
                    <strong>{m.name}</strong>
                    <span>{m.topic}</span>
                    <time>{fmtDate(m.createdAt, { day: 'numeric', month: 'short' })}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {quick.length > 0 && (
          <section className="panel">
            <div className="panel-head">
              <h2>Ficil degdeg ah</h2>
            </div>
            <div className="quick">
              {quick.map((q) => (
                <Link key={q.to} to={q.to} className="quick-btn">
                  <Plus size={17} /> {q.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
