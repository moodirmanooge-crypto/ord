import { useMemo, useState } from 'react'
import { useContent } from '../lib/data'
import { NewsCard, sortNews } from '../components/cards'
import { Loading, PageBanner, Section, usePageTitle } from '../components/ui'

export default function News() {
  usePageTitle('News & updates')
  const { items, loading } = useContent('rda_news')
  const [cat, setCat] = useState('All')
  const posts = useMemo(() => sortNews(items), [items])
  const cats = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))], [posts])
  const list = cat === 'All' ? posts : posts.filter((p) => p.category === cat)
  const [first, ...rest] = list

  return (
    <>
      <PageBanner title="News and updates" intro="Stories, announcements and reports from RDA’s work across Somalia." crumb="Media" />
      <Section>
        {loading && <Loading />}
        {!loading && posts.length === 0 && (
          <div className="empty">
            <h2 className="h-md">No news published yet</h2>
            <p>Stories and announcements will appear here as soon as they are published.</p>
          </div>
        )}
        {posts.length > 0 && (
          <>
            {cats.length > 2 && (
              <div className="chips" role="tablist" aria-label="Filter by category">
                {cats.map((c) => (
                  <button key={c} type="button" role="tab" aria-selected={cat === c} className={`chip-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            {first && <NewsCard post={first} featured />}
            <div className="news-grid">
              {rest.map((p) => (
                <NewsCard key={p.id} post={p} />
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  )
}
