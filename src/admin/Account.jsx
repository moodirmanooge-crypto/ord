import { useState } from 'react'
import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { db, COL } from '../firebase'
import { useAuth } from './auth'
import { useToast } from './toast'

export default function Account() {
  const { user } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ username: user.username, current: '', next: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const username = f.username.trim()
    const changeName = username !== user.username
    const changePw = !!f.next
    if (!changeName && !changePw) return toast('Wax isbeddel ah ma sameynin.', 'err')
    if (username.length < 3) return toast('Username-ku waa inuu ugu yaraan 3 xaraf noqdaa.', 'err')
    if (changePw && f.next.length < 4) return toast('Password-ka cusub waa inuu ugu yaraan 4 xaraf noqdaa.', 'err')
    if (changePw && f.next !== f.confirm) return toast('Password-ka cusub iyo xaqiijintiisu isma laha.', 'err')
    if (!f.current) return toast('Geli password-kaaga hadda jira si aad u xaqiijiso.', 'err')

    setBusy(true)
    try {
      const ref = doc(db, COL.admins, user.id)
      const snap = await getDoc(ref)
      if (!snap.exists() || String(snap.data().password ?? '') !== f.current) {
        toast('Password-kaaga hadda jira waa khaldan yahay.', 'err')
        return
      }
      if (changeName) {
        const dup = await getDocs(query(collection(db, COL.admins), where('username', '==', username)))
        if (dup.docs.some((d) => d.id !== user.id)) {
          toast('Username-kan horay ayaa loo isticmaalay.', 'err')
          return
        }
      }
      const patch = { updatedAt: serverTimestamp() }
      if (changeName) patch.username = username
      if (changePw) patch.password = f.next
      await updateDoc(ref, patch)
      setF({ username, current: '', next: '', confirm: '' })
      toast('Waa la kaydiyay. Username-ka iyo password-ka cusub hadda ayaa shaqaynaya.')
    } catch (err) {
      console.error(err)
      toast('Lama kaydin karo. Hubi Firestore rules ama internet-ka.', 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Habaynta Account-ka</h1>
          <p className="page-hint">Beddel username-kaaga iyo password-kaaga. Isbeddelka isla markiiba ayuu shaqaynayaa, mar dambe waxaad gelaysaa kuwa cusub.</p>
        </div>
      </div>

      <form className="panel account-form" onSubmit={submit}>
        <div className="account-id">
          <span className="avatar-a">{(user.username || '?')[0].toUpperCase()}</span>
          <div>
            <strong>@{user.username}</strong>
            <small>{user.isSuper ? 'Super Admin' : 'Sub Admin'} · role: {user.role || '—'}</small>
          </div>
        </div>

        <label className="field">
          <span className="field-label">Username</span>
          <input value={f.username} onChange={set('username')} autoComplete="username" />
        </label>

        <div className="form-2">
          <label className="field">
            <span className="field-label">Password cusub (ka tag madhan haddii aadan beddelayn)</span>
            <span className="pw-wrap">
              <input type={show ? 'text' : 'password'} value={f.next} onChange={set('next')} autoComplete="new-password" />
              <button type="button" className="icon-btn" onClick={() => setShow((v) => !v)} aria-label="Muuji/qari password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <label className="field">
            <span className="field-label">Ku celi password-ka cusub</span>
            <input type={show ? 'text' : 'password'} value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Password-kaaga hadda jira (si loo xaqiijiyo) *</span>
          <input type={show ? 'text' : 'password'} value={f.current} onChange={set('current')} autoComplete="current-password" />
        </label>

        <button className="btn-primary" disabled={busy}>
          <KeyRound size={18} /> {busy ? 'Waa la kaydinayaa…' : 'Kaydi isbeddellada'}
        </button>
      </form>
    </div>
  )
}
