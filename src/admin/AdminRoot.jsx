import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import {
  ExternalLink,
  FileText,
  GalleryHorizontal,
  Globe,
  Handshake,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  PanelTop,
  Settings,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { COL } from '../firebase'
import { MODULES, CONTENT_GROUPS, SITE_GROUPS, PROGRAM_FIELDS, REGION_FIELDS, TEAM_FIELDS, NEWS_FIELDS, PARTNER_FIELDS } from '../data/schema'
import { useRawCollection } from '../lib/data'
import { fmtDate } from '../lib/text'
import { Loading, useLogo } from '../components/ui'
import { AuthProvider, useAuth } from './auth'
import { ToastProvider } from './toast'
import Login from './Login'
import Dashboard from './Dashboard'
import CrudManager from './CrudManager'
import SettingsForm from './SettingsForm'
import GalleryManager from './GalleryManager'
import Messages from './Messages'
import SubAdmins from './SubAdmins'
import Account from './Account'
import MenuManager from './MenuManager'
import HeroManager from './HeroManager'
import '../styles/admin.css'

const ICONS = {
  dashboard: LayoutDashboard,
  image: ImageIcon,
  globe: Globe,
  file: FileText,
  menu: PanelTop,
  layers: Layers,
  map: MapPin,
  users: Users,
  news: Newspaper,
  gallery: GalleryHorizontal,
  handshake: Handshake,
  inbox: Inbox,
  usercog: UserCog,
  settings: Settings,
}

function Shell() {
  const { user, logout, can } = useAuth()
  const logo = useLogo()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const messages = useRawCollection(COL.messages)
  const unread = messages.items.filter((m) => !m.read).length
  const mods = MODULES.filter((m) => (m.superOnly ? user.isSuper : can(m.key)))

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.title = 'RDA Admin'
  }, [])

  const guard = (key, el) => (can(key) && (!MODULES.find((m) => m.key === key)?.superOnly || user.isSuper) ? el : <Navigate to="/admin" replace />)

  return (
    <div className="admin">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} alt="" />
          <div>
            <strong>RDA Admin</strong>
            <small>Somalia</small>
          </div>
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <nav>
          {mods.map((m) => {
            const Icon = ICONS[m.icon]
            return (
              <NavLink key={m.key} to={m.path ? `/admin/${m.path}` : '/admin'} end={!m.path} className={({ isActive }) => `side-link ${isActive ? 'on' : ''}`}>
                <Icon size={19} />
                <span>{m.label}</span>
                {m.key === 'messages' && unread > 0 && <b className="count">{unread}</b>}
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer" className="side-link">
            <ExternalLink size={19} />
            <span>Open website</span>
          </a>
          <button type="button" className="side-link" onClick={logout}>
            <LogOut size={19} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      {open && <div className="side-scrim" onClick={() => setOpen(false)} />}

      <div className="admin-main">
        <header className="topbar">
          <button type="button" className="icon-btn burger-a" onClick={() => setOpen(true)} aria-label="Menu">
            <Menu size={22} />
          </button>
          <span className="topbar-date">{fmtDate(new Date().toISOString(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <Link to="/admin/account" className="user-chip">
            <span className="avatar-a">{(user.username || '?')[0].toUpperCase()}</span>
            <span className="user-chip-text">
              <strong>{user.username}</strong>
              <small>{user.isSuper ? 'Super Admin' : 'Sub Admin'}</small>
            </span>
          </Link>
        </header>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="hero" element={guard('hero', <HeroManager />)} />
          <Route path="site" element={guard('site', <SettingsForm title="Website Info" hint="Name, logo, contact details, social links and About texts." groups={SITE_GROUPS} />)} />
          <Route path="content" element={guard('content', <SettingsForm title="Page Content" hint="Texts of the Programs, Leadership, Impact and Partner pages." groups={CONTENT_GROUPS} />)} />
          <Route path="menu" element={guard('menu', <MenuManager />)} />
          <Route
            path="programs"
            element={guard(
              'programs',
              <CrudManager
                title="Programs"
                hint="RDA's program pillars. Add, edit or remove them."
                collectionName={COL.programs}
                fields={PROGRAM_FIELDS}
                slugFrom="title"
                addLabel="New program"
                card={(it) => ({ title: it.title, meta: it.subtitle, image: it.image, badge: `${(it.sectors || []).length} sub-sectors` })}
              />,
            )}
          />
          <Route
            path="regions"
            element={guard(
              'regions',
              <CrudManager
                title="Where We Work"
                hint="The regions and states where RDA works."
                collectionName={COL.regions}
                fields={REGION_FIELDS}
                addLabel="New location"
                card={(it) => ({ title: it.name, meta: it.kind, image: it.image })}
              />,
            )}
          />
          <Route
            path="team"
            element={guard(
              'team',
              <CrudManager
                title="Leadership & Board"
                hint="Senior management and Board of Directors members, with photo and bio."
                collectionName={COL.team}
                fields={TEAM_FIELDS}
                addLabel="New member"
                card={(it) => ({ title: it.name, meta: it.position, image: it.photo || '', badge: it.group === 'board' ? 'Board' : 'Leadership' })}
              />,
            )}
          />
          <Route
            path="news"
            element={guard(
              'news',
              <CrudManager
                title="News"
                hint="Publish news, announcements or new stories with an image."
                collectionName={COL.news}
                fields={NEWS_FIELDS}
                orderable={false}
                addLabel="New story"
                card={(it) => ({ title: it.title, meta: `${it.category || ''} ${it.date ? '· ' + it.date : ''}`.trim(), image: it.image || '', badge: it.published === false ? 'Draft' : 'Published' })}
              />,
            )}
          />
          <Route path="gallery" element={guard('gallery', <GalleryManager />)} />
          <Route
            path="partners"
            element={guard(
              'partners',
              <CrudManager
                title="Partners"
                hint="Logos of the organizations, agencies and donors you work with."
                collectionName={COL.partners}
                fields={PARTNER_FIELDS}
                addLabel="New partner"
                card={(it) => ({ title: it.name, meta: it.url, image: it.logo || '' })}
                wide={false}
              />,
            )}
          />
          <Route path="messages" element={guard('messages', <Messages />)} />
          <Route path="admins" element={guard('admins', <SubAdmins />)} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  )
}

function Gate() {
  const { user, ready } = useAuth()
  if (!ready) return <Loading label="Loading…" />
  return user ? <Shell /> : <Login />
}

export default function AdminRoot() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </AuthProvider>
  )
}