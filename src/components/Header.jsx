import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, Phone, Mail, X } from 'lucide-react'
import { useSite, useContent } from '../lib/data'
import { lines, telHref } from '../lib/text'
import { useLogo } from './ui'

export default function Header() {
  const { site } = useSite()
  const logo = useLogo()
  const { items: programs } = useContent('rda_programs')
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState('')
  const phones = lines(site.phones)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setExpanded('')
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const NAV = [
    { label: 'Home', to: '/', end: true },
    {
      label: 'About',
      to: '/about',
      children: [
        { label: 'Who we are', to: '/about' },
        { label: 'Vision, mission & values', to: '/about#vision' },
        { label: 'Strategy & theory of change', to: '/about#strategy' },
        { label: 'Leadership & Board', to: '/leadership' },
      ],
    },
    {
      label: 'Programs',
      to: '/programs',
      children: programs.map((p) => ({ label: p.title, to: `/programs#${p.slug || p.id}` })),
    },
    { label: 'Where we work', to: '/where-we-work' },
    { label: 'Impact', to: '/impact' },
    {
      label: 'Media',
      to: '/news',
      children: [
        { label: 'News & updates', to: '/news' },
        { label: 'Photo gallery', to: '/gallery' },
      ],
    },
    { label: 'Contact', to: '/contact' },
  ]

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
          </div>
        </div>
      </div>

      <div className="container nav-bar">
        <Link to="/" className="brand" aria-label={`${site.orgName} ${site.country} – Home`}>
          <img src={logo} alt="" width="52" height="52" />
          <span className="brand-text">
            <strong>{site.orgName}</strong>
            <small>{site.country}</small>
          </span>
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          {NAV.map((item) =>
            item.children ? (
              <div className="nav-item has-sub" key={item.label}>
                <NavLink to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {item.label}
                  <ChevronDown size={15} aria-hidden="true" />
                </NavLink>
                <div className="sub">
                  {item.children.map((c) => (
                    <Link key={c.to} to={c.to}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink key={item.label} to={item.to} end={item.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <Link to="/partner" className="btn btn-red nav-cta">
          Partner with us
        </Link>

        <button type="button" className="burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((item) =>
            item.children ? (
              <div className="m-group" key={item.label}>
                <button type="button" className="m-toggle" aria-expanded={expanded === item.label} onClick={() => setExpanded(expanded === item.label ? '' : item.label)}>
                  {item.label}
                  <ChevronDown size={20} />
                </button>
                <div className={`m-sub ${expanded === item.label ? 'open' : ''}`}>
                  <div>
                    {item.children.map((c) => (
                      <Link key={c.to} to={c.to}>
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <NavLink key={item.label} to={item.to} end={item.end} className="m-link">
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
