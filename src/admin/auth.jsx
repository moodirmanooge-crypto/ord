import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { collection, doc, getDocs, onSnapshot, query, where } from 'firebase/firestore'
import { db, COL } from '../firebase'
import { seedAllIfNeeded } from '../lib/seed'

const KEY = 'rda_admin_session'
const SUPER_ROLES = ['admin', 'superadmin', 'super-admin', 'super_admin', 'super admin']

const readSession = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null')?.id || null
  } catch {
    return null
  }
}

const normalize = (snap) => {
  const d = snap.data()
  const role = String(d.role || '').toLowerCase()
  return {
    id: snap.id,
    username: d.username || '',
    name: d.name || '',
    role: d.role || '',
    isSuper: SUPER_ROLES.includes(role) || snap.id === 'Super-Admin',
    permissions: Array.isArray(d.permissions) ? d.permissions : [],
  }
}

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [sessionId, setSessionId] = useState(readSession)
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(!readSession())
  const attempts = useRef({ n: 0, until: 0 })
  const seeded = useRef(false)

  // Username / password / role si toos ah ayaa looga akhriyaa Firestore (Rda-Admin).
  useEffect(() => {
    if (!sessionId) {
      setUser(null)
      setReady(true)
      return
    }
    const unsub = onSnapshot(
      doc(db, COL.admins, sessionId),
      (snap) => {
        if (!snap.exists() || snap.data().active === false) {
          localStorage.removeItem(KEY)
          setSessionId(null)
          setUser(null)
        } else {
          setUser(normalize(snap))
        }
        setReady(true)
      },
      (err) => {
        console.error('[RDA] session', err)
        setReady(true)
      },
    )
    return unsub
  }, [sessionId])

  useEffect(() => {
    if (user?.isSuper && !seeded.current) {
      seeded.current = true
      seedAllIfNeeded().catch((e) => console.warn('[RDA] seed skipped', e))
    }
  }, [user])

  const login = useCallback(async (username, password) => {
    const now = Date.now()
    if (attempts.current.until > now) {
      const s = Math.ceil((attempts.current.until - now) / 1000)
      throw new Error(`Isku-day badan. Fadlan sug ${s} ilbiriqsi kadibna isku day mar kale.`)
    }
    const u = String(username || '').trim()
    const p = String(password || '')
    if (!u || !p) throw new Error('Geli username iyo password.')
    let snap
    try {
      snap = await getDocs(query(collection(db, COL.admins), where('username', '==', u)))
    } catch (e) {
      console.error('[RDA] login', e)
      throw new Error('Lama xiriiri karo database-ka. Hubi internet-ka iyo Firestore rules.')
    }
    const match = snap.docs.find((d) => String(d.data().password ?? '') === p && d.data().active !== false)
    if (!match) {
      attempts.current.n += 1
      if (attempts.current.n >= 5) {
        attempts.current = { n: 0, until: Date.now() + 30000 }
      }
      throw new Error('Username ama password waa khaldan yahay.')
    }
    attempts.current = { n: 0, until: 0 }
    localStorage.setItem(KEY, JSON.stringify({ id: match.id }))
    setSessionId(match.id)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setSessionId(null)
    setUser(null)
  }, [])

  const can = useCallback((key) => !!user && (user.isSuper || key === 'dashboard' || key === 'account' || user.permissions.includes(key)), [user])

  const value = useMemo(() => ({ user, ready, login, logout, can }), [user, ready, login, logout, can])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
