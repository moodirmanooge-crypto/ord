import { Link } from 'react-router-dom'
import { useSite } from '../lib/data'
import { lines, rows, titled } from '../lib/text'
import { PageBanner, Section, usePageTitle } from '../components/ui'

export default function Partner() {
  usePageTitle('Partner with us')
  const { site } = useSite()
  const why = titled(site.whyPartner)
  const offers = lines(site.offers)
  const compliance = rows(site.compliance)

  return (
    <>
      <PageBanner
        title="Partner with RDA"
        intro="A combination of technical credibility, institutional maturity and contextual legitimacy that makes RDA a strong, reliable implementing partner in Somalia."
        crumb="For donors and partners"
      />

      <Section>
        <div className="why-grid">
          <div className="why-head">
            <h2 className="h-lg">Why partner with RDA</h2>
          </div>
          <ol className="why-list">
            {why.map((w, k) => (
              <li key={k}>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="paper">
        <h2 className="h-lg">What we offer our partners</h2>
        <div className="offer-grid">
          {offers.map((o, i) => (
            <p key={i} className="offer">
              {o}
            </p>
          ))}
        </div>
      </Section>

      <Section>
        <h2 className="h-lg">Financial management, compliance and risk</h2>
        <div className="three-cols prose">
          <div>
            <h3 className="h-md">Financial systems and procurement</h3>
            <p>{site.financeText}</p>
          </div>
          <div>
            <h3 className="h-md">Audit and donor compliance</h3>
            <p>{site.auditText}</p>
          </div>
          <div>
            <h3 className="h-md">Risk management</h3>
            <p>{site.riskText}</p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor category</th>
                <th>Compliance focus</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map((r, i) => (
                <tr key={i}>
                  <th scope="row" data-label="Donor category">
                    {r[0]}
                  </th>
                  <td data-label="Compliance focus">{r[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="navy">
        <div className="split split-even">
          <div>
            <h2 className="h-lg on-dark">Strategic partnerships and coordination</h2>
          </div>
          <div>
            <p className="lead-p on-dark">{site.partnerships}</p>
            <Link to="/contact" className="btn btn-light">
              Start a conversation
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
