import { Link, useParams } from 'react-router-dom'
import { useContent } from '../lib/data'
import { fmtDate, paras } from '../lib/text'
import { NewsCard, sortNews } from '../components/cards'
import { Loading, PageBanner, Section, usePageTitle } from '../components/ui'

export default function NewsDetail() {
  const { id } = useParams()
  const { items, loading } = useContent('rda_news')
  const post = items.find((p) => p.id === id)
  usePageTitle(post?.title || 'News')
  const related = sortNews(items)
    .filter((p) => p.id !== id)
    .slice(0, 3)

  if (loading) {
    return (
      <>
        <PageBanner title="News" />
        <Section>
          <Loading />
        </Section>
      </>
    )
  }
  if (!post || post.published === false) {
    return (
      <>
        <PageBanner title="Story not found" />
        <Section>
          <p className="lead-p">This story is no longer available.</p>
          <Link to="/news" className="btn btn-blue">
            Back to news
          </Link>
        </Section>
      </>
    )
  }

  return (
    <>
      <PageBanner title={post.title} crumb={[post.category, fmtDate(post.date || post.createdAt)].filter(Boolean).join(' — ')} />
      <Section>
        <article className="article">
          {post.image && <img className="article-img" src={post.image} alt="" />}
          {post.excerpt && <p className="article-lead">{post.excerpt}</p>}
          <div className="prose">
            {paras(post.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <Link to="/news" className="text-link">
            Back to all news
          </Link>
        </article>
      </Section>
      {related.length > 0 && (
        <Section tone="paper">
          <h2 className="h-md">More stories</h2>
          <div className="news-grid">
            {related.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  )
}
