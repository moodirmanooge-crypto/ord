import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { db, COL } from '../firebase'
import { DEFAULT_SITE, DEFAULTS } from '../data/defaults'

// Ku qor xogta asalka ah (Programs / Regions / Team) Firestore si admin-ku wax uga beddelo.
export async function seedCollection(name) {
  const items = DEFAULTS[name]
  if (!items) return
  const batch = writeBatch(db)
  items.forEach((it, i) => {
    const { id, ...rest } = it
    batch.set(doc(db, name, id), { ...rest, order: i + 1, createdAt: serverTimestamp() })
  })
  batch.set(doc(db, COL.settings, 'site'), { seeded: { [name]: true } }, { merge: true })
  await batch.commit()
}

// Marka ugu horreysa ee Super Admin-ku soo galo, dhammaan xogta asalka ah ku shub.
export async function seedAllIfNeeded() {
  const ref = doc(db, COL.settings, 'site')
  const snap = await getDoc(ref)
  if (snap.exists()) return false
  const batch = writeBatch(db)
  batch.set(ref, { ...DEFAULT_SITE, seeded: Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, true])), createdAt: serverTimestamp() })
  Object.entries(DEFAULTS).forEach(([name, items]) => {
    items.forEach((it, i) => {
      const { id, ...rest } = it
      batch.set(doc(db, name, id), { ...rest, order: i + 1, createdAt: serverTimestamp() })
    })
  })
  await batch.commit()
  return true
}

export async function saveSite(patch) {
  await setDoc(doc(db, COL.settings, 'site'), { ...patch, updatedAt: serverTimestamp() }, { merge: true })
}