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
    if (!changeName && !changePw) return toast('You have not changed anything.', 'err')
    if (username.length < 3) return toast('The username must be at least 3 characters.', 'err')
    if (changePw && f.next.length < 4) return toast('The new password must be at least 4 characters.', 'err')
    if (changePw && f.next !== f.confirm) return toast('The new password and its confirmation do not match.', 'err')
    if (!f.current) return toast('Enter your current password to confirm.', 'err')

    setBusy(true)
    try {
      const ref = doc(db, COL.admins, user.id)
      const snap = await getDoc(ref)
      if (!snap.exists() || String(snap.data().password ?? '') !== f.current) {
        toast('Your current password is incorrect.', 'err')
        return
      }
      if (changeName) {
        const dup = await getDocs(query(collection(db, COL.admins), where('username', '==', username)))
        if (dup.docs.some((d) => d.id !== user.id)) {
          toast('This username is already in use.', 'err')
          return
        }
      }
      const patch = { updatedAt: serverTimestamp() }
      if (changeName) patch.username = username
      if (changePw) patch.password = f.next
      await updateDoc(ref, patch)
      setF({ username, current: '', next: '', confirm: '' })
      toast('Saved. Your new username and password work from now on.')
    } catch (err) {
      console.error(err)
      toast('Could not save. Check your Firestore rules or internet connection.', 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Account Settings</h1>
          <p className="page-hint">Change your username and password. The change takes effect immediately — next time you sign in with the new ones.</p>
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
            <span className="field-label">New password (leave empty to keep the current one)</span>
            <span className="pw-wrap">
              <input type={show ? 'text' : 'password'} value={f.next} onChange={set('next')} autoComplete="new-password" />
              <button type="button" className="icon-btn" onClick={() => setShow((v) => !v)} aria-label="Show/hide password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          <label className="field">
            <span className="field-label">Repeat the new password</span>
            <input type={show ? 'text' : 'password'} value={f.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </label>
        </div>

        <label className="field">
          <span className="field-label">Your current password (to confirm) *</span>
          <input type={show ? 'text' : 'password'} value={f.current} onChange={set('current')} autoComplete="current-password" />
        </label>

        <button className="btn-primary" disabled={busy}>
          <KeyRound size={18} /> {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}