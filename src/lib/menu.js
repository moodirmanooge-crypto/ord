// Caawiye la wadaago: Header-ka website-ka iyo preview-ga admin panel-ka.

export const isExternal = (to = '') => /^(https?:|mailto:|tel:)/i.test(String(to))

export const resolveTo = (it = {}) => {
  if (it.kind === 'page') return it.slug ? `/p/${it.slug}` : ''
  if (it.kind === 'none') return ''
  return String(it.to || '').trim()
}

/** Ka dhig xogta Firestore qaab nav ah: [{ id, label, to, newTab, end, children:[{id,label,to,newTab}] }] */
export function buildNav(menu = [], programs = []) {
  return menu
    .filter((m) => m.visible !== false && m.label)
    .map((m) => {
      const isDrop = m.type === 'dropdown'
      const auto = isDrop && m.autoPrograms ? programs.map((p) => ({ id: `prog-${p.id}`, label: p.title, to: `/programs#${p.slug || p.id}`, newTab: false })) : []
      const manual = isDrop
        ? (m.children || [])
            .filter((c) => c.visible !== false)
            .map((c) => {
              const to = resolveTo(c)
              return { id: c.id, label: c.label, to, newTab: !!c.newTab }
            })
        : []
      const to = resolveTo(m)
      return {
        id: m.id,
        label: m.label,
        to,
        newTab: !!m.newTab,
        end: to === '/',
        children: [...auto, ...manual].filter((c) => c.label && c.to),
      }
    })
    .filter((n) => n.to || n.children.length > 0)
}