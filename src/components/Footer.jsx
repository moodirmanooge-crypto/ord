import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail, Globe, Twitter, Youtube } from 'lucide-react'
import { useSite } from '../lib/data'
import { ensureUrl, lines, telHref } from '../lib/text'
import { Topo, useLogo } from './ui'

export default function Footer() {
  const { site } = useSite()
  const logo = useLogo()
  const phones = lines(site.phones)
  const socials = [
    ['facebook', Facebook, 'Facebook'],
    ['twitter', Twitter, 'X / Twitter'],
    ['linkedin', Linkedin, 'LinkedIn'],
    ['instagram', Instagram, 'Instagram'],
    ['youtube', Youtube, 'YouTube'],
  ].filter(([k]) => site[k])

  return (
    <footer className="site-footer">
      <Topo seed={4.1} cx={300} cy={520} rings={10} />
      <div className="container footer-grid">
        <div className="footer-about">
          <Link to="/" className="brand brand-footer">
            <img src={logo} alt="" width="60" height="60" />
            <span className="brand-text">
              <strong>{site.orgName}</strong>
              <small>{site.country}</small>
            </span>
          </Link>
          <p className="footer-tag">{site.tagline}</p>
          {socials.length > 0 && (
            <div className="socials">
              {socials.map(([k, Icon, label]) => (
                <a key={k} href={ensureUrl(site[k])} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav className="footer-col" aria-label="About RDA">
          <h4>About RDA</h4>
          <Link to="/about">Who we are</Link>
          <Link to="/about#strategy">Strategy</Link>
          <Link to="/leadership">Leadership & Board</Link>
          <Link to="/where-we-work">Where we work</Link>
        </nav>

        <nav className="footer-col" aria-label="Work">
          <h4>Our work</h4>
          <Link to="/programs">Programs</Link>
          <Link to="/impact">Impact</Link>
          <Link to="/news">News & updates</Link>
          <Link to="/gallery">Photo gallery</Link>
          <Link to="/partner">Partner with us</Link>
        </nav>

        <div className="footer-col footer-contact">
          <h4>Contact</h4>
          {site.address && (
            <p>
              <MapPin size={16} /> {site.address}
            </p>
          )}
          {phones.map((p) => (
            <a key={p} href={telHref(p)}>
              <Phone size={16} /> {p}
            </a>
          ))}
          {site.email && (
            <a href={`mailto:${site.email}`}>
              <Mail size={16} /> {site.email}
            </a>
          )}
          {site.website && (
            <a href={ensureUrl(site.website)} target="_blank" rel="noreferrer">
              <Globe size={16} /> {site.website}
            </a>
          )}
        </div>
      </div>
      <div className="container footer-base">
        <p>
          © {new Date().getFullYear()} {site.orgName} – {site.country}. All rights reserved.
        </p>
        <Link to="/admin">Staff login</Link>
      </div>
    </footer>
  )
}
