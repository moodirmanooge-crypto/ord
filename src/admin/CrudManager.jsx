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
 * Maamule guud: liis + ku dar + wax ka beddel + tirtir.
 * card(item) => { title, meta, image }
 */
export default function CrudManager({ title, hint, collectionName, fields, card, addLabel = 'Ku dar cusub', orderable = true, slugFrom, wide = true }) {
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
    if (missing) return toast(`Buuxi: ${missing.label}`, 'err')
    setSaving(true)
    try {
      const payload = { ...editing.data }
      delete payload.createdAt
      delete payload.updatedAt
      if (slugFrom && payload[slugFrom]) payload.slug = payload.slug || slugify(payload[slugFrom])
      if (orderable) payload.order = Number(payload.order) || nextOrder
      if (editing.id) {
        await updateDoc(doc(db, collectionName, editing.id), { ...payload, updatedAt: serverTimestamp() })
        toast('Waa la kaydiyay')
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() })
        toast('Waa lagu daray')
      }
      setEditing(null)
    } catch (err) {
      console.error(err)
      toast('Lama kaydin karo. Hubi Firestore rules ama internet-ka.', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm('Ma hubtaa inaad tirtirto? Tallaabadan dib looma soo celin karo.')) return
    try {
      await deleteDoc(doc(db, collectionName, item.id))
      toast('Waa la tirtiray')
    } catch (err) {
      console.error(err)
      toast('Lama tirtiri karo.', 'err')
    }
  }

  async function seed() {
    try {
      await seedCollection(collectionName)
      toast('Xogta asalka ah waa la geliyay — hadda wax ka beddeli kartaa.')
    } catch (err) {
      console.error(err)
      toast('Lama geli karo xogta asalka ah.', 'err')
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

      {error && <p className="notice notice-err">Xogta lama akhriyi karo (Firestore permission). Hubi rules-ka.</p>}
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-admin">
          <p>Weli wax lama gelin.</p>
          {canSeed && (
            <button type="button" className="btn-secondary" onClick={seed}>
              <DatabaseZap size={17} /> Geli xogta asalka ah ee website-ka (waa laga soo qaaday profile-ka)
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
                  <h3>{c.title || '(cinwaan la\'aan)'}</h3>
                  {c.meta && <p>{c.meta}</p>}
                  {c.badge && <span className="badge">{c.badge}</span>}
                </div>
                <div className="acard-actions">
                  <button type="button" className="btn-sm" onClick={() => open(it)}>
                    <Pencil size={15} /> Beddel
                  </button>
                  <button type="button" className="btn-sm btn-sm-danger" onClick={() => remove(it)}>
                    <Trash2 size={15} /> Tirtir
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
        title={editing?.id ? 'Wax ka beddel' : addLabel}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditing(null)} disabled={saving}>
              Jooji
            </button>
            <button type="submit" form="crud-form" className="btn-primary" disabled={saving}>
              {saving ? 'Waa la kaydinayaa…' : 'Kaydi'}
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
                <span className="field-label">Kala horeynta (1 = kan ugu horreeya)</span>
                <input type="number" min="1" value={editing.data.order ?? (editing.id ? '' : nextOrder)} onChange={(e) => setVal('order')(e.target.value)} />
              </label>
            )}
          </form>
        )}
      </Modal>
    </div>
  )
}
