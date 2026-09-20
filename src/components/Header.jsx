import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Facebook, Instagram, Linkedin, Menu, Phone, Mail, Twitter, X, Youtube } from 'lucide-react'
import { useSite, useContent } from '../lib/data'
import { ensureUrl, lines, telHref } from '../lib/text'
import { buildNav, isExternal } from '../lib/menu'
import { useLogo } from './ui'

// Link gudaha ah (router) ama dibadda ah (<a>)
function MenuLink({ to, newTab, onClick, className, children }) {
  if (isExternal(to) || newTab) {
    return (
      <a href={to} target={newTab || /^https?:/i.test(to) ? '_blank' : undefined} rel="noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

export default function Header() {
  const { site } = useSite()
  const logo = useLogo()
  const { items: programs } = useContent('rda_programs')
  const { items: menu } = useContent('rda_menu')
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState('')
  const [openSub, setOpenSub] = useState('') // dropdown-ka desktop-ka ee furan
  const closeTimer = useRef(null)
  const phones = lines(site.phones)
  const socials = [
    ['facebook', Facebook, 'Facebook'],
    ['twitter', Twitter, 'X / Twitter'],
    ['linkedin', Linkedin, 'LinkedIn'],
    ['instagram', Instagram, 'Instagram'],
    ['youtube', Youtube, 'YouTube'],
  ].filter(([k]) => site[k])

  const NAV = useMemo(() => buildNav(menu, programs), [menu, programs])

  const showSub = (id) => {
    clearTimeout(closeTimer.current)
    setOpenSub(id)
  }
  const hideSubSoon = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenSub(''), 140)
  }
  // Marka la taabto/riixo link kasta: dropdown-ka isla markiiba waa xirmayaa
  const closeAll = () => {
    clearTimeout(closeTimer.current)
    setOpenSub('')
    if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur()
  }
  // Taleefan/tablet (hover ma jiro): taabasho koowaad wuu furaa dropdown-ka, taabasho labaad wuu tagaa bogga
  const onParentClick = (e, id) => {
    if (window.matchMedia('(hover: none)').matches && openSub !== id) {
      e.preventDefault()
      showSub(id)
      return
    }
    closeAll()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setExpanded('')
    setOpenSub('')
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'menu-open' : ''}`}>
      <div className="utility">
        <div className="container utility-inner">
          <p>{site.tagline}</p>
          <div className="utility-links">
            {phones[0] && (
              <a href={telHref(phones[0])}>
                <Phone size={14} /> {phones[0]}
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`}>
                <Mail size={14} /> {site.email}
              </a>
            )}
            {socials.length > 0 && (
              <span className="utility-social">
                {socials.map(([k, Icon, label]) => (
                  <a key={k} href={ensureUrl(site[k])} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={14} />
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="brandbar">
        <div className="container brandbar-inner">
          <Link to="/" className="brand" aria-label={`${site.orgName} ${site.country} – Home`} onClick={closeAll}>
            <img src={logo} alt="" width="52" height="52" />
            <span className="brand-text">
              <strong>{site.orgName}</strong>
              <small>{site.country}</small>
            </span>
          </Link>

          <div className="brandbar-info">
            {phones[0] && (
              <a href={telHref(phones[0])} className="info-item">
                <Phone size={22} />
                <span>
                  <small>Call us</small>
                  <b>{phones[0]}</b>
                </span>
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`} className="info-item">
                <Mail size={22} />
                <span>
                  <small>Email us</small>
                  <b>{site.email}</b>
                </span>
              </a>
            )}
            <Link to="/partner" className="btn btn-red nav-cta" onClick={closeAll}>
              Partner with us
            </Link>
          </div>

          <button type="button" className="burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      <div className="navstrip">
        <div className="container navstrip-inner">
          <Link to="/" className="strip-logo" aria-label="Home" onClick={closeAll} tabIndex={scrolled ? 0 : -1}>
            <img src={logo} alt="" width="36" height="36" />
          </Link>
          <nav className="nav-desktop" aria-label="Main">
            {NAV.map((item) => {
              const isDrop = item.children.length > 0
              if (!isDrop) {
                return isExternal(item.to) || item.newTab ? (
                  <MenuLink key={item.id} to={item.to} newTab={item.newTab} onClick={closeAll} className="nav-link">
                    {item.label}
                  </MenuLink>
                ) : (
                  <NavLink key={item.id} to={item.to} end={item.end} onClick={closeAll} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    {item.label}
                  </NavLink>
                )
              }
              return (
                <div
                  className={`nav-item has-sub ${openSub === item.id ? 'open' : ''}`}
                  key={item.id}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && showSub(item.id)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && hideSubSoon()}
                  onFocus={(e) => e.target.matches(':focus-visible') && showSub(item.id)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setOpenSub('')
                  }}
                  onKeyDown={(e) => e.key === 'Escape' && setOpenSub('')}
                >
                  {!item.to ? (
                    <button type="button" className="nav-link" aria-haspopup="true" aria-expanded={openSub === item.id} onClick={() => (openSub === item.id ? setOpenSub('') : showSub(item.id))}>
                      {item.label}
                      <ChevronDown size={15} aria-hidden="true" />
                    </button>
                  ) : isExternal(item.to) || item.newTab ? (
                    <MenuLink to={item.to} newTab={item.newTab} onClick={(e) => onParentClick(e, item.id)} className="nav-link">
                      {item.label}
                      <ChevronDown size={15} aria-hidden="true" />
                    </MenuLink>
                  ) : (
                    <NavLink
                      to={item.to}
                      onClick={(e) => onParentClick(e, item.id)}
                      aria-haspopup="true"
                      aria-expanded={openSub === item.id}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                      <ChevronDown size={15} aria-hidden="true" />
                    </NavLink>
                  )}
                  <div className="sub">
                    {item.children.map((c) => (
                      <MenuLink key={c.id} to={c.to} newTab={c.newTab} onClick={closeAll}>
                        {c.label}
                      </MenuLink>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((item) =>
            item.children.length > 0 ? (
              <div className="m-group" key={item.id}>
                <button type="button" className="m-toggle" aria-expanded={expanded === item.id} onClick={() => setExpanded(expanded === item.id ? '' : item.id)}>
                  {item.label}
                  <ChevronDown size={20} />
                </button>
                <div className={`m-sub ${expanded === item.id ? 'open' : ''}`}>
                  <div>
                    {item.children.map((c) => (
                      <MenuLink key={c.id} to={c.to} newTab={c.newTab}>
                        {c.label}
                      </MenuLink>
                    ))}
                  </div>
                </div>
              </div>
            ) : isExternal(item.to) || item.newTab ? (
              <MenuLink key={item.id} to={item.to} newTab={item.newTab} className="m-link">
                {item.label}
              </MenuLink>
            ) : (
              <NavLink key={item.id} to={item.to} end={item.end} className="m-link">
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="m-foot">
          <Link to="/partner" className="btn btn-red btn-block">
            Partner with us
          </Link>
          {phones[0] && (
            <a href={telHref(phones[0])}>
              <Phone size={16} /> {phones[0]}
            </a>
          )}
          {site.email && (
            <a href={`mailto:${site.email}`}>
              <Mail size={16} /> {site.email}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}