import { Link } from 'react-router-dom'
import { ChevronUp, Facebook, Globe, Instagram, Linkedin, Mail, MapPin, Twitter, Youtube } from 'lucide-react'
import { useSite } from '../lib/data'
import { ensureUrl } from '../lib/text'
import { Topo, useLogo } from './ui'
import '../styles/footer.css'

const ABOUT = [
  ['/about', 'Who we are'],
  ['/about#strategy', 'Strategy'],
  ['/leadership', 'Leadership & Board'],
  ['/where-we-work', 'Where we work'],
]
const WORK = [
  ['/programs', 'Programs'],
  ['/impact', 'Impact'],
  ['/news', 'News & updates'],
  ['/gallery', 'Photo gallery'],
  ['/partner', 'Partner with us'],
]

export default function Footer() {
  const { site } = useSite()
  const logo = useLogo()
  const socials = [
    ['facebook', Facebook, 'Facebook'],
    ['twitter', Twitter, 'X / Twitter'],
    ['linkedin', Linkedin, 'LinkedIn'],
    ['instagram', Instagram, 'Instagram'],
    ['youtube', Youtube, 'YouTube'],
  ].filter(([k]) => site[k])

  return (
    <footer className="site-footer sf">
      <div className="sf-bar" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <Topo seed={4.1} cx={300} cy={520} rings={10} />

      <div className="container sf-grid">
        <div className="sf-brand">
          <Link to="/" className="sf-logo" aria-label={`${site.orgName} – Home`}>
            <img src={logo} alt="" width="64" height="64" />
            <span>
              <strong>{site.orgName}</strong>
              <small>{site.country}</small>
            </span>
          </Link>
          <p className="sf-tag">{site.tagline}</p>
          {site.heroText && <p className="sf-blurb">{site.heroText}</p>}
          <div className="sf-actions">
            <Link to="/partner" className="btn btn-red">
              Partner with us
            </Link>
            {socials.length > 0 && (
              <div className="sf-socials">
                {socials.map(([k, Icon, label]) => (
                  <a key={k} href={ensureUrl(site[k])} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="sf-col" aria-label="About RDA">
          <h4>About RDA</h4>
          <ul className="sf-links">
            {ABOUT.map(([to, label]) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="sf-col" aria-label="Our work">
          <h4>Our work</h4>
          <ul className="sf-links">
            {WORK.map(([to, label]) => (
              <li key={to}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sf-col sf-contact">
          <h4>Contact</h4>
          <ul>
            {site.address && (
              <li>
                <span className="sf-ic">
                  <MapPin size={18} />
                </span>
                <span className="sf-val">
                  <small>Address</small>
                  <span>{site.address}</span>
                </span>
              </li>
            )}
            {site.website && (
              <li>
                <span className="sf-ic">
                  <Globe size={18} />
                </span>
                <span className="sf-val">
                  <small>Website</small>
                  <a href={ensureUrl(site.website)} target="_blank" rel="noreferrer">
                    {site.website}
                  </a>
                </span>
              </li>
            )}
            <li>
              <span className="sf-ic">
                <Mail size={18} />
              </span>
              <span className="sf-val">
                <small>Get in touch</small>
                <Link to="/contact">Contact us</Link>
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Green bottom band (the Admin link was removed; the panel is still reachable at /admin) */}
      <div className="sf-bottom">
        <div className="container sf-base">
          <p>
            © {new Date().getFullYear()} {site.orgName} – {site.country}. All rights reserved.
          </p>
          <button type="button" className="sf-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
            <ChevronUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  )
}