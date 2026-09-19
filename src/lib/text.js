export const paras = (s = '') =>
  String(s || '')
    .split(/\n\s*\n/)
    .map((x) => x.trim())
    .filter(Boolean)

export const lines = (s = '') =>
  String(s || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)

// "Title: text" -> { title, text }
export const titled = (s = '') =>
  lines(s).map((l) => {
    const i = l.indexOf(':')
    return i > 0 && i < 90 ? { title: l.slice(0, i).trim(), text: l.slice(i + 1).trim() } : { title: '', text: l }
  })

// "a | b | c" -> ['a','b','c']
export const rows = (s = '') => lines(s).map((l) => l.split('|').map((x) => x.trim()))

export const slugify = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

export const initials = (name = '') =>
  name
    .replace(/^(dr|prof|eng|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

export const toMillis = (v) => {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (typeof v.seconds === 'number') return v.seconds * 1000
  const t = new Date(v).getTime()
  return Number.isNaN(t) ? 0 : t
}

export const fmtDate = (v, opts = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  const ms = toMillis(v)
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('en-GB', opts)
}

export const telHref = (p = '') => 'tel:' + String(p).replace(/[^\d+]/g, '')

export const ensureUrl = (u = '') => (/^https?:\/\//i.test(u) ? u : u ? 'https://' + u : '')
