import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db, COL } from '../firebase'
import { DEFAULT_SITE, DEFAULTS } from '../data/defaults'
import { toMillis } from './text'

const SiteCtx = createContext({ site: DEFAULT_SITE, seeded: {}, loaded: false, exists: false })

export function SiteProvider({ children }) {
  const [state, setState] = useState({ site: DEFAULT_SITE, seeded: {}, loaded: false, exists: false })

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, COL.settings, 'site'),
      (snap) => {
        const d = snap.exists() ? snap.data() : {}
        setState({ site: { ...DEFAULT_SITE, ...d }, seeded: d.seeded || {}, loaded: true, exists: snap.exists() })
      },
      (err) => {
        console.error('[RDA] settings', err)
        setState((s) => ({ ...s, loaded: true }))
      },
    )
    return unsub
  }, [])

  return <SiteCtx.Provider value={state}>{children}</SiteCtx.Provider>
}

export const useSite = () => useContext(SiteCtx)

const byOrder = (a, b) => (a.order ?? 9999) - (b.order ?? 9999) || toMillis(a.createdAt) - toMillis(b.createdAt)

// Xogta ceeriin ah ee Firestore (admin managers)
export function useRawCollection(name) {
  const [state, setState] = useState({ items: [], loading: true, error: null })
  useEffect(() => {
    setState({ items: [], loading: true, error: null })
    const unsub = onSnapshot(
      collection(db, name),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrder)
        setState({ items, loading: false, error: null })
      },
      (error) => {
        console.error('[RDA]', name, error)
        setState({ items: [], loading: false, error })
      },
    )
    return unsub
  }, [name])
  return state
}

// Xogta website-ka dadweynaha: Firestore haddii jirto, haddii kale defaults
export function useContent(name) {
  const { seeded } = useSite()
  const raw = useRawCollection(name)
  const fallback = DEFAULTS[name]
  return useMemo(() => {
    if (fallback && !seeded[name] && raw.items.length === 0) {
      return { items: fallback, loading: raw.loading, isDefault: true }
    }
    return { items: raw.items, loading: raw.loading, isDefault: false }
  }, [fallback, seeded, name, raw])
}

export const colorVar = (c) => ({ blue: 'var(--blue)', red: 'var(--red)', green: 'var(--green)', indigo: 'var(--indigo)' }[c] || 'var(--blue)')
