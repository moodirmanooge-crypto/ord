import { useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { Eye, EyeOff, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { db, COL } from '../firebase'
import { MODULES } from '../data/schema'
import { useRawCollection } from '../lib/data'
import { Loading, Modal } from '../components/ui'
import { useToast } from './toast'

const GRANTABLE = MODULES.filter((m) => !m.always && !m.superOnly)
const isSuperDoc = (a) => a.id === 'Super-Admin' || ['admin', 'superadmin', 'super-admin', 'super_admin'].includes(String(a.role || '').toLowerCase())

export default function SubAdmins() {
  const toast = useToast()
  const { items, loading } = useRawCollection(COL.admins)
  const [edit, setEdit] = useState(null)
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setShowPw(true)
    setEdit({ data: { name: '', username: '', password: '', active: true, permissions: ['news', 'gallery'] } })
  }
  const openEdit = (a) => {
    setShowPw(false)
    setEdit({ id: a.id, data: { name: a.name || '', username: a.username || '', password: '', active: a.active !== false, permissions: a.permissions || [] } })
  }
  const set = (k, v) => setEdit((e) => ({ ...e, data: { ...e.data, [k]: v } }))
  const togglePerm = (k) => set('permissions', edit.data.permissions.includes(k) ? edit.data.permissions.filter((x) => x !== k) : [...edit.data.permissions, k])

  async function save(e) {
    e.preventDefault()
    const d = edit.data
    const username = d.username.trim()
    if (username.length < 3) return toast('The username must be at least 3 characters.', 'err')
    if (!edit.id && d.password.length < 4) return toast('The password must be at least 4 characters.', 'err')
    if (edit.id && d.password && d.password.length < 4) return toast('The password must be at least 4 characters.', 'err')
    if (items.some((a) => a.id !== edit.id && String(a.username).toLowerCase() === username.toLowerCase())) return toast('This username is already in use.', 'err')
    setSaving(true)
    try {
      const payload = { name: d.name.trim(), username, active: d.active, permissions: d.permissions, updatedAt: serverTimestamp() }
      if (d.password) payload.password = d.password
      if (edit.id) {
        await updateDoc(doc(db, COL.admins, edit.id), payload)
      } else {
        await addDoc(collection(db, COL.admins), { ...payload, role: 'subadmin', createdAt: serverTimestamp() })
      }
      toast(edit.id ? 'Saved' : 'New sub admin created')
      setEdit(null)
    } catch (err) {
      console.error(err)
      toast('Could not save. Check your Firestore rules.', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function remove(a) {
    if (!window.confirm(`Are you sure you want to delete ${a.username}? They will be signed out immediately.`)) return
    try {
      await deleteDoc(doc(db, COL.admins, a.id))
      toast('Deleted')
    } catch (err) {
      console.error(err)
      toast('Could not delete.', 'err')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Sub Admins</h1>
          <p className="page-hint">Create other administrators and limit which sections they can manage.</p>
        </div>
        <button type="button" className="btn-primary" onClick={openNew}>
          <Plus size={18} /> New sub admin
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="cards cards-wide">
          {items.map((a) => (
            <article className="acard" key={a.id}>
              <div className="acard-body">
                <h3>
                  {a.name || a.username}
                  {isSuperDoc(a) && (
                    <span className="badge badge-gold">
                      <ShieldCheck size={13} /> Super Admin
                    </span>
                  )}
                </h3>
                <p>@{a.username}</p>
                {!isSuperDoc(a) && (
                  <>
                    <p className="perm-line">{(a.permissions || []).length ? (a.permissions || []).map((k) => MODULES.find((m) => m.key === k)?.label || k).join(', ') : 'No sections assigned'}</p>
                    {a.active === false && <span className="badge badge-off">Disabled</span>}
                  </>
                )}
              </div>
              {!isSuperDoc(a) && (
                <div className="acard-actions">
                  <button type="button" className="btn-sm" onClick={() => openEdit(a)}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button type="button" className="btn-sm btn-sm-danger" onClick={() => remove(a)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal
        open={!!edit}
        onClose={() => !saving && setEdit(null)}
        wide
        title={edit?.id ? 'Edit sub admin' : 'New sub admin'}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setEdit(null)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="sub-form" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        {edit && (
          <form id="sub-form" className="form-grid" onSubmit={save}>
            <label className="field">
              <span className="field-label">Full name</span>
              <input value={edit.data.name} onChange={(e) => set('name', e.target.value)} />
            </label>
            <div className="form-2">
              <label className="field">
                <span className="field-label">Username *</span>
                <input value={edit.data.username} onChange={(e) => set('username', e.target.value)} autoComplete="off" />
              </label>
              <label className="field">
                <span className="field-label">{edit.id ? 'New password (leave empty to keep the current one)' : 'Password *'}</span>
                <span className="pw-wrap">
                  <input type={showPw ? 'text' : 'password'} value={edit.data.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
                  <button type="button" className="icon-btn" onClick={() => setShowPw((v) => !v)} aria-label="Show/hide password">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
            </div>
            <label className="switch">
              <input type="checkbox" checked={edit.data.active} onChange={(e) => set('active', e.target.checked)} />
              <span className="switch-track" />
              <span className="switch-text">{edit.data.active ? 'Account is active' : 'Account is disabled'}</span>
            </label>
            <fieldset className="perm-box">
              <legend>Sections they can manage</legend>
              <div className="perm-grid">
                {GRANTABLE.map((m) => (
                  <label key={m.key} className="check">
                    <input type="checkbox" checked={edit.data.permissions.includes(m.key)} onChange={() => togglePerm(m.key)} />
                    <span>{m.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </form>
        )}
      </Modal>
    </div>
  )
}