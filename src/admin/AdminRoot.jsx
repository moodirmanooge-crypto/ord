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
  Settings,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import { COL } from '../firebase'
import { MODULES, CONTENT_GROUPS, SITE_GROUPS, HERO_FIELDS, PROGRAM_FIELDS, REGION_FIELDS, TEAM_FIELDS, NEWS_FIELDS, PARTNER_FIELDS } from '../data/schema'
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
import '../styles/admin.css'

const ICONS = {
  dashboard: LayoutDashboard,
  image: ImageIcon,
  globe: Globe,
  file: FileText,
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
          <button type="button" className="icon-btn side-close" onClick={() => setOpen(false)} aria-label="Xir">
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
            <span>Fur website-ka</span>
          </a>
          <button type="button" className="side-link" onClick={logout}>
            <LogOut size={19} />
            <span>Ka bax</span>
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
          <Route
            path="hero"
            element={guard(
              'hero',
              <CrudManager
                title="Hero Sawirada"
                hint="Sawirada ka muuqda bogga hore ee website-ka (waxay is beddelayaan). Haddii aan sawir lahayn, naqshad asal ah ayaa muuqata."
                collectionName={COL.hero}
                fields={HERO_FIELDS}
                addLabel="Ku dar sawir Hero"
                card={(it) => ({ title: it.caption || 'Sawir Hero', image: it.image })}
                wide={false}
              />,
            )}
          />
          <Route path="site" element={guard('site', <SettingsForm title="Macluumaadka Website" hint="Magaca, logo, xiriirka, bulshada iyo qoraallada About." groups={SITE_GROUPS} />)} />
          <Route path="content" element={guard('content', <SettingsForm title="Qoraallada Bogagga" hint="Qoraallada bogagga Programs, Leadership, Impact iyo Partner." groups={CONTENT_GROUPS} />)} />
          <Route
            path="programs"
            element={guard(
              'programs',
              <CrudManager
                title="Barnaamijyada"
                hint="Afarta tiir ee shaqada RDA. Wax ku dar, ka beddel ama ka saar."
                collectionName={COL.programs}
                fields={PROGRAM_FIELDS}
                slugFrom="title"
                addLabel="Barnaamij cusub"
                card={(it) => ({ title: it.title, meta: it.subtitle, image: it.image, badge: `${(it.sectors || []).length} qayb` })}
              />,
            )}
          />
          <Route
            path="regions"
            element={guard(
              'regions',
              <CrudManager
                title="Goobaha Shaqada"
                hint="Gobolada iyo dawladaha RDA ka shaqeyso."
                collectionName={COL.regions}
                fields={REGION_FIELDS}
                addLabel="Goob cusub"
                card={(it) => ({ title: it.name, meta: it.kind, image: it.image })}
              />,
            )}
          />
          <Route
            path="team"
            element={guard(
              'team',
              <CrudManager
                title="Hoggaanka & Board-ka"
                hint="Maamulka sare iyo xubnaha Board of Directors, oo leh sawir iyo bio."
                collectionName={COL.team}
                fields={TEAM_FIELDS}
                addLabel="Xubin cusub"
                card={(it) => ({ title: it.name, meta: it.position, image: it.photo || '', badge: it.group === 'board' ? 'Board' : 'Leadership' })}
              />,
            )}
          />
          <Route
            path="news"
            element={guard(
              'news',
              <CrudManager
                title="Wararka"
                hint="Daabac war, ogeysiis ama sheeko cusub oo leh sawir."
                collectionName={COL.news}
                fields={NEWS_FIELDS}
                orderable={false}
                addLabel="War cusub"
                card={(it) => ({ title: it.title, meta: `${it.category || ''} ${it.date ? '· ' + it.date : ''}`.trim(), image: it.image || '', badge: it.published === false ? 'Qabyo' : 'La daabacay' })}
              />,
            )}
          />
          <Route path="gallery" element={guard('gallery', <GalleryManager />)} />
          <Route
            path="partners"
            element={guard(
              'partners',
              <CrudManager
                title="Iskaashatada"
                hint="Logo-yada ururrada, wakaaladaha iyo deeq-bixiyeyaasha lala shaqeeyo."
                collectionName={COL.partners}
                fields={PARTNER_FIELDS}
                addLabel="Iskaashade cusub"
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
  if (!ready) return <Loading label="Waa la soo raryayaa…" />
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
