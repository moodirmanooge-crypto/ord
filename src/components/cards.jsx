import { Link } from 'react-router-dom'
import { fmtDate } from '../lib/text'

export function NewsCard({ post, featured = false }) {
  return (
    <Link to={`/news/${post.id}`} className={`news-card ${featured ? 'is-featured' : ''}`}>
      <div className="news-media">
        {post.image ? <img src={post.image} alt="" loading="lazy" /> : <div className="news-ph" aria-hidden="true" />}
      </div>
      <div className="news-body">
        <p className="news-meta">
          {post.category && <span className="chip">{post.category}</span>}
          <time>{fmtDate(post.date || post.createdAt)}</time>
        </p>
        <h3>{post.title}</h3>
        {post.excerpt && <p className="news-excerpt">{post.excerpt}</p>}
      </div>
    </Link>
  )
}

export const sortNews = (items) =>
  items
    .filter((p) => p.published !== false)
    .slice()
    .sort((a, b) => {
      const da = new Date(a.date || 0).getTime() || 0
      const db = new Date(b.date || 0).getTime() || 0
      return db - da
    })
