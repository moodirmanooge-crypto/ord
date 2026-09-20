import { useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { DatabaseZap, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../firebase'
import { DEFAULTS } from '../data/defaults'
import { useRawCollection } from '../lib/data'
import { seedCollection } from '../lib/seed'
import { slugify } from '../lib/text'
import { Loading, Modal } from '../components/ui'
import { Field } from './fields'
import { useToast } from './toast'

const blank = (fields) =>
  Object.fromEntries(
    fields.map((f) => [
      f.key,
      f.type === 'boolean' ? true : f.type === 'repeater' ? [] : f.type === 'select' ? f.options?.[0]?.value ?? '' : f.type === 'date' ? new Date().toISOString().slice(0, 10) : '',
    ]),
  )

/**
 * Generic manager: list + add + edit + delete.
 * card(item) => { title, meta, image }
 */
export default function CrudManager({ title, hint, collectionName, fields, card, addLabel = 'Add new', orderable = true, slugFrom, wide = true }) {
  const toast = useToast()
  const { items, loading, error } = useRawCollection(collectionName)
  const [editing, setEditing] = useState(null) // null | {id?, data}
  const [saving, setSaving] = useState(false)
  const canSeed = !!DEFAULTS[collectionName]

  const nextOrder = useMemo(() => items.reduce((m, it) => Math.max(m, Number(it.order) || 0), 0) + 1, [items])

  const open = (item) => {
    if (item) {
      const { id, ...data } = item
      setEditing({ id, data: { ...blank(fields), ...data } })
    } else {
      setEditing({ data: blank(fields) })
    }
  }

  const setVal = (k) => (v) => setEditing((e) => ({ ...e, data: { ...e.data, [k]: v } }))

  async function save(e) {
    e.preventDefault()
    const missing = fields.find((f) => f.required && !String(editing.data[f.key] ?? '').trim())
    if (missing) return toast(`Please fill in: ${missing.label}`, 'err')
    setSaving(true)
    try {
      const payload = { ...editing.data }
      delete payload.createdAt
      delete payload.updatedAt
      if (slugFrom && payload[slugFrom]) payload.slug = payload.slug || slugify(payload[slugFrom])
      if (orderable) payload.order = Number(payload.order) || nextOrder
      if (editing.id) {
        await updateDoc(doc(db, collectionName, editing.id), { ...payload, updatedAt: serverTimestamp() })
        toast('Saved')
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() })
        toast('Added')
      }
      setEditing(null)
    } catch (err) {
      console.error(err)
      toast('Could not save. Check your Firestore rules or internet connection.', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm('Are you sure you want to delete this? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, collectionName, item.id))
      toast('Deleted')
    } catch (err) {
      console.error(err)
      toast('Could not delete.', 'err')
    }
  }

  async function seed() {
    try {
      await seedCollection(collectionName)
      toast('Default content added — you can now edit it.')
    } catch (err) {
      console.error(err)
      toast('Could not add the default content.', 'err')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {hint && <p className="page-hint">{hint}</p>}
        </div>
        <button type="button" className="btn-primary" onClick={() => open(null)}>
          <Plus size={18} /> {addLabel}
        </button>
      </div>

      {error && <p className="notice notice-err">Data could not be read (Firestore permission). Check your rules.</p>}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-admin">
          <p>Nothing added yet.</p>
          {canSeed && (
            <button type="button" className="btn-secondary" onClick={seed}>
              <DatabaseZap size={17} /> Add the website's default content (taken from the organizational profile)
            </button>
          )}
        </div>
      ) : (
        <div className="cards">
          {items.map((it) => {
            const c = card(it)
            return (
              <article className="acard" key={it.id}>
                {c.image !== undefined && (c.image ? <img className="acard-img" src={c.image} alt="" loading="lazy" /> : <div className="acard-img acard-ph" />)}
                <div className="acard-body">
                  <h3>{c.title || '(untitled)'}</h3>
                  {c.meta && <p>{c.meta}</p>}
                  {c.badge && <span className="badge">{c.badge}</span>}
                </div>
                <div className="acard-actions">
                  <button type="button" className="btn-sm" onClick={() => open(it)}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button type="button" className="btn-sm btn-sm-danger" onClick={() => remove(it)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        wide={wide}
        title={editing?.id ? 'Edit' : addLabel}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="crud-form" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        {editing && (
          <form id="crud-form" className="form-grid" onSubmit={save}>
            {fields.map((f) => (
              <Field key={f.key} field={f} value={editing.data[f.key]} onChange={setVal(f.key)} />
            ))}
            {orderable && (
              <label className="field field-narrow">
                <span className="field-label">Order (1 = first)</span>
                <input type="number" min="1" value={editing.data.order ?? (editing.id ? '' : nextOrder)} onChange={(e) => setVal('order')(e.target.value)} />
              </label>
            )}
          </form>
        )}
      </Modal>
    </div>
  )
}