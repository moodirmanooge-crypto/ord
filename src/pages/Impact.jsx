import { useSite } from '../lib/data'
import { rows, titled } from '../lib/text'
import { PageBanner, Section, usePageTitle } from '../components/ui'

export default function Impact() {
  usePageTitle('Impact')
  const { site } = useSite()
  const record = titled(site.trackRecord)
  const sectors = rows(site.impactSectors)
  const priorities = titled(site.priorities)

  return (
    <>
      <PageBanner
        title="Track record and impact"
        intro="Timely, quality humanitarian and development programming across multiple sectors and regions of Somalia."
        crumb="Results"
      />

      <Section>
        <div className="split">
          <div>
            <h2 className="h-lg">What we have delivered</h2>
            <p className="lead-p">Since its establishment, RDA has built a demonstrated track record of delivery across the humanitarian–development–peace spectrum.</p>
          </div>
          <ul className="record-list">
            {record.map((r, i) => (
              <li key={i}>
                {r.title ? (
                  <>
                    <strong>{r.title}</strong>
                    <span>{r.text}</span>
                  </>
                ) : (
                  <span>{r.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="paper">
        <h2 className="h-lg">Illustrative areas of impact by sector</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sector</th>
                <th>Illustrative intervention</th>
                <th>Approach</th>
              </tr>
            </thead>
            <tbody>
              {sectors.map((r, i) => (
                <tr key={i}>
                  <th scope="row" data-label="Sector">
                    {r[0]}
                  </th>
                  <td data-label="Intervention">{r[1]}</td>
                  <td data-label="Approach">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="navy">
        <h2 className="h-lg on-dark">Strategic priorities: looking ahead</h2>
        <p className="lead-p on-dark narrow">
          Building on its multisectoral programming base and institutional systems, RDA is deepening impact, expanding reach and preparing to serve as a first-choice implementing partner for donors operating in Somalia.
        </p>
        <div className="priority-grid">
          {priorities.map((p, i) => (
            <article key={i}>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}
