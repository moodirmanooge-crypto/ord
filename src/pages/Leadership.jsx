import { useState } from 'react'
import { useSite, useContent } from '../lib/data'
import { paras } from '../lib/text'
import { Avatar, Modal, PageBanner, Section, usePageTitle } from '../components/ui'

const TONES = ['blue', 'red', 'green', 'indigo']

function Person({ p, i, onOpen, lead = false }) {
  return (
    <button type="button" className={`person ${lead ? 'person-lead' : ''}`} onClick={() => onOpen(p)}>
      <Avatar name={p.name} src={p.photo} color={TONES[i % 4]} size={lead ? 'xl' : 'lg'} />
      <span className="person-text">
        <strong>{p.name}</strong>
        <em>{p.position}</em>
        {p.specialty && <small>{p.specialty}</small>}
      </span>
    </button>
  )
}

export default function Leadership() {
  usePageTitle('Leadership & Board')
  const { site } = useSite()
  const { items: team } = useContent('rda_team')
  const [open, setOpen] = useState(null)
  const leaders = team.filter((t) => (t.group || 'leadership') === 'leadership')
  const board = team.filter((t) => t.group === 'board')
  const [first, ...others] = leaders

  return (
    <>
      <PageBanner title="Leadership and governance" intro={site.leadershipIntro} crumb="Senior leadership, Board and structure" />

      <Section>
        <h2 className="h-lg">Senior leadership</h2>
        {first && (
          <div className="lead-wrap">
            <Person p={first} i={0} onOpen={setOpen} lead />
          </div>
        )}
        <div className="people-grid">
          {others.map((p, i) => (
            <Person key={p.id} p={p} i={i + 1} onOpen={setOpen} />
          ))}
        </div>
      </Section>

      <Section tone="paper">
        <div className="split">
          <div className="prose">
            <h2 className="h-lg">Board of Directors</h2>
            {paras(site.boardText).map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
          {board.length > 0 && (
            <div className="people-grid people-grid-col">
              {board.map((p, i) => (
                <Person key={p.id} p={p} i={i} onOpen={setOpen} />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section id="structure">
        <h2 className="h-lg">Governance structure</h2>
        <p className="lead-p narrow">{site.governanceText}</p>
        <a className="org-chart" href={site.orgChartImage || '/org-structure.webp'} target="_blank" rel="noreferrer" title="Open full size">
          <img src={site.orgChartImage || '/org-structure.webp'} alt="RDA organizational structure: Board of Directors, Executive Director, eight directorates, field operations and communities" loading="lazy" />
        </a>
      </Section>

      <Section tone="paper">
        <div className="split split-even">
          <div className="prose">
            <h2 className="h-md">Staffing and professional development</h2>
            <p>{site.staffing}</p>
          </div>
          <div className="prose">
            <h2 className="h-md">Code of conduct and safeguarding</h2>
            <p>{site.safeguarding}</p>
          </div>
        </div>
      </Section>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name || ''}>
        {open && (
          <div className="bio">
            <Avatar name={open.name} src={open.photo} color="blue" size="xl" />
            <div>
              <p className="bio-pos">{open.position}</p>
              {open.specialty && <p className="bio-spec">{open.specialty}</p>}
              {paras(open.bio || '').map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
