import { useSite, useContent, colorVar } from '../lib/data'
import { lines, paras, titled } from '../lib/text'
import { PageBanner, Section, ProgramIcon, usePageTitle } from '../components/ui'

export default function Programs() {
  usePageTitle('Programs')
  const { site } = useSite()
  const { items: programs } = useContent('rda_programs')

  return (
    <>
      <PageBanner
        title="Thematic program areas"
        intro="Integrated, multisectoral interventions that combine life-saving assistance with long-term development strategies across four pillars."
        crumb="What we do"
      />

      {programs.map((p, idx) => (
        <section key={p.id} id={p.slug || p.id} className={`pillar ${idx % 2 ? 'tone-paper' : 'tone-white'}`} style={{ '--tile': colorVar(p.color) }}>
          <div className="container pillar-grid">
            <div className="pillar-intro">
              <span className="pillar-badge">
                <ProgramIcon name={p.icon} size={30} />
              </span>
              <h2 className="h-lg">{p.title}</h2>
              <p className="pillar-sub">{p.subtitle}</p>
              <p className="lead-p">{p.description}</p>
              {p.image && <img className="pillar-img" src={p.image} alt={p.title} loading="lazy" />}
            </div>
            <div className="sector-table">
              {(p.sectors || []).map((s, k) => (
                <div className="sector-row" key={k}>
                  <h3>{s.name}</h3>
                  <ul>
                    {lines(s.interventions).map((x, j) => (
                      <li key={j}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Section tone="navy">
        <div className="split split-even">
          <div>
            <h2 className="h-lg on-dark">Core service lines</h2>
            <dl className="def-list on-dark">
              {titled(site.coreServices).map((s, i) => (
                <div key={i}>
                  <dt>{s.title}</dt>
                  <dd>{s.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="h-lg on-dark">Cross-cutting commitments</h2>
            <dl className="def-list on-dark">
              {titled(site.crossCutting).map((s, i) => (
                <div key={i}>
                  <dt>{s.title}</dt>
                  <dd>{s.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section>
        <div className="split split-even">
          <div className="prose">
            <h2 className="h-md">Program cycle and approach</h2>
            <p>{site.methodology}</p>
            <h2 className="h-md">Monitoring, evaluation, accountability and learning</h2>
            {paras(site.meal).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="prose">
            <h2 className="h-md">Climate change and environmental resilience</h2>
            <p>{site.climate}</p>
            <h2 className="h-md">Policy engagement and knowledge management</h2>
            <p>{site.policy}</p>
          </div>
        </div>
      </Section>
    </>
  )
}
