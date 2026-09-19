import { useSite } from '../lib/data'
import { paras, titled, lines } from '../lib/text'
import { PageBanner, Section, usePageTitle, useLogo } from '../components/ui'

export default function About() {
  usePageTitle('About us')
  const { site } = useSite()
  const logo = useLogo()
  const values = titled(site.values)
  const objectives = lines(site.objectives)

  return (
    <>
      <PageBanner title="About Rural Development Aid" intro={site.tagline} crumb="Who we are" />

      <Section>
        <div className="split">
          <div className="prose">
            <h2 className="h-lg">Who we are</h2>
            {paras(site.whoWeAre).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <figure className="about-fig">
            {site.aboutImage ? <img src={site.aboutImage} alt="RDA at work in Somalia" /> : <img className="about-logo" src={logo} alt="" />}
          </figure>
        </div>
      </Section>

      <Section tone="paper">
        <div className="two-notes">
          <article>
            <h3 className="h-md">Founding rationale</h3>
            <p>{site.foundingRationale}</p>
          </article>
          <article>
            <h3 className="h-md">Legal status</h3>
            <p>{site.legalStatus}</p>
          </article>
        </div>
      </Section>

      <Section id="vision" tone="navy" className="vm">
        <div className="vm-grid">
          <article>
            <h2 className="h-lg on-dark">Vision</h2>
            <p className="vm-text">{site.vision}</p>
          </article>
          <article>
            <h2 className="h-lg on-dark">Mission</h2>
            <p className="vm-text">{site.mission}</p>
          </article>
        </div>
      </Section>

      <Section>
        <h2 className="h-lg">Core values</h2>
        <ul className="values">
          {values.map((v, i) => (
            <li key={i}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="strategy" tone="paper">
        <h2 className="h-lg">Strategic framework</h2>
        <div className="split split-even">
          <div>
            <h3 className="h-md">Strategic goal</h3>
            <p className="lead-p">{site.strategicGoal}</p>
          </div>
          <div>
            <h3 className="h-md">Objectives</h3>
            <ul className="tick-list">
              {objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <h2 className="h-lg">Theory of change</h2>
        <ol className="toc-flow">
          <li>
            <b>If</b>
            <p>{site.theoryIf}</p>
          </li>
          <li>
            <b>and if</b>
            <p>{site.theoryAndIf}</p>
          </li>
          <li>
            <b>then</b>
            <p>{site.theoryThen}</p>
          </li>
          <li>
            <b>because</b>
            <p>{site.theoryBecause}</p>
          </li>
        </ol>
        <div className="callout">
          <h3 className="h-md">Alignment with global and national frameworks</h3>
          <p>{site.alignment}</p>
        </div>
      </Section>
    </>
  )
}
