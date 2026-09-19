import { useSite, useContent } from '../lib/data'
import { PageBanner, Section, usePageTitle } from '../components/ui'

export default function WhereWeWork() {
  usePageTitle('Where we work')
  const { site } = useSite()
  const { items: regions } = useContent('rda_regions')
  const [head, ...rest] = regions

  return (
    <>
      <PageBanner title="Where we work" intro={site.geographicIntro} crumb="Geographic footprint" />
      <Section>
        {head && (
          <article className="region-head">
            {head.image && <img src={head.image} alt={head.name} loading="lazy" />}
            <div>
              <p className="chip chip-dark">{head.kind}</p>
              <h2 className="h-lg">{head.name}</h2>
              <p className="lead-p">{head.description}</p>
            </div>
          </article>
        )}
        <div className="region-grid">
          {rest.map((r) => (
            <article key={r.id} className="region-card">
              {r.image && <img src={r.image} alt={r.name} loading="lazy" />}
              <div>
                <p className="chip">{r.kind}</p>
                <h3>{r.name}</h3>
                <p>{r.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
