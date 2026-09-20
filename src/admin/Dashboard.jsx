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
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const tiles = [
    { key: 'messages', icon: Inbox, label: unread ? `Messages (${unread} new)` : 'Messages', value: messages.items.length, to: '/admin/messages', tone: 'red' },
    { key: 'news', icon: Newspaper, label: 'News', value: news.items.length, to: '/admin/news', tone: 'blue' },
    { key: 'gallery', icon: GalleryHorizontal, label: 'Gallery images', value: gallery.items.length, to: '/admin/gallery', tone: 'green' },
    { key: 'programs', icon: Layers, label: 'Programs', value: programs.items.length, to: '/admin/programs', tone: 'indigo' },
    { key: 'team', icon: Users, label: 'Leadership & Board', value: team.items.length, to: '/admin/team', tone: 'blue' },
    { key: 'regions', icon: MapPin, label: 'Locations', value: regions.items.length, to: '/admin/regions', tone: 'green' },
    { key: 'hero', icon: Image, label: 'Hero images', value: hero.items.length, to: '/admin/hero', tone: 'indigo' },
    { key: 'partners', icon: Handshake, label: 'Partners', value: partners.items.length, to: '/admin/partners', tone: 'red' },
  ].filter((t) => can(t.key))

  const quick = [
    { key: 'news', label: 'Add a news story', to: '/admin/news' },
    { key: 'gallery', label: 'Upload photos', to: '/admin/gallery' },
    { key: 'team', label: 'Add a team member', to: '/admin/team' },
    { key: 'site', label: 'Edit website info', to: '/admin/site' },
  ].filter((q) => can(q.key))

  return (
    <div className="page">
      <div className="welcome">
        <div>
          <h1>
            {greet}, {user.name || user.username}
          </h1>
          <p>Manage the whole RDA website from here: texts, images, news and messages.</p>
        </div>
        <a className="btn-secondary on-navy" href="/" target="_blank" rel="noreferrer">
          <ExternalLink size={17} /> Open website
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
              <h2>Latest messages</h2>
              <Link to="/admin/messages" className="link">
                View all
              </Link>
            </div>
            {latest.length === 0 ? (
              <p className="muted">No messages yet.</p>
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
              <h2>Quick actions</h2>
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