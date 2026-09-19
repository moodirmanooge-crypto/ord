import { Link, useParams } from 'react-router-dom'
import { useContent } from '../lib/data'
import { isExternal } from '../lib/menu'
import { paras } from '../lib/text'
import { Loading, PageBanner, Section, usePageTitle } from '../components/ui'
import '../styles/custom-page.css'

// Qoraalka bogga: fal madhan = paragraph, "## " = cinwaan yar, "- " = liis
function RichText({ text }) {
  return paras(text).map((block, i) => {
    const ls = block.split('\n').map((l) => l.trim())
    if (ls.length === 1 && ls[0].startsWith('## ')) return <h3 key={i} className="h-md">{ls[0].slice(3)}</h3>
    if (ls.every((l) => l.startsWith('- '))) {
      return (
        <ul key={i} className="cp-list">
          {ls.map((l, k) => (
            <li key={k}>{l.slice(2)}</li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i}>
        {ls.map((l, k) => (
          <span key={k}>
            {k > 0 && <br />}
            {l}
          </span>
        ))}
      </p>
    )
  })
}

export default function CustomPage() {
  const { slug } = useParams()
  const { items, loading } = useContent('rda_pages')
  const page = items.find((p) => p.slug === slug || p.id === slug)
  usePageTitle(page?.title || 'Page')

  if (loading) {
    return (
      <>
        <PageBanner title="Loading…" />
        <Section>
          <Loading />
        </Section>
      </>
    )
  }
  if (!page || page.published === false) {
    return (
      <>
        <PageBanner title="Page not found" intro="This page is not available." />
        <Section>
          <Link to="/" className="btn btn-blue">
            Back to home
          </Link>
        </Section>
      </>
    )
  }

  const sections = (page.sections || []).filter((s) => s.heading || s.text || s.image)
  const gallery = (page.gallery || []).filter((g) => g.image)
  const cta = page.ctaLabel && page.ctaUrl

  return (
    <>
      <PageBanner title={page.title} intro={page.intro} crumb="Information" />

      {page.image && (
        <Section>
          <figure className="cp-hero">
            <img src={page.image} alt={page.title} />
          </figure>
        </Section>
      )}

      {sections.map((s, i) => (
        <Section key={i} tone={i % 2 ? 'paper' : 'white'}>
          <div className={`split cp-split ${s.image ? '' : 'cp-single'} ${i % 2 ? 'cp-rev' : ''}`}>
            <div className="prose">
              {s.heading && <h2 className="h-lg">{s.heading}</h2>}
              <RichText text={s.text} />
            </div>
            {s.image && (
              <figure className="cp-fig">
                <img src={s.image} alt={s.heading || page.title} loading="lazy" />
              </figure>
            )}
          </div>
        </Section>
      ))}

      {gallery.length > 0 && (
        <Section tone={sections.length % 2 ? 'white' : 'paper'}>
          <h2 className="h-lg">Gallery</h2>
          <div className="cp-gallery">
            {gallery.map((g, i) => (
              <a key={i} href={g.image} target="_blank" rel="noreferrer" title={g.caption || ''}>
                <img src={g.image} alt={g.caption || ''} loading="lazy" />
                {g.caption && <span>{g.caption}</span>}
              </a>
            ))}
          </div>
        </Section>
      )}

      {cta && (
        <section className="cp-cta">
          <div className="container">
            <h2>{page.title}</h2>
            {isExternal(page.ctaUrl) ? (
              <a className="btn btn-light" href={page.ctaUrl} target="_blank" rel="noreferrer">
                {page.ctaLabel}
              </a>
            ) : (
              <Link className="btn btn-light" to={page.ctaUrl}>
                {page.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  )
}