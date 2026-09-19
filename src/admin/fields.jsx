import { useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, UploadCloud, X } from 'lucide-react'
import { uploadImage } from '../lib/image'

export function ImageField({ value, onChange, folder = 'misc', png = false }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState('')
  const [drag, setDrag] = useState(false)
  const input = useRef(null)

  async function handle(file) {
    if (!file) return
    setErr('')
    setBusy(true)
    setProgress(0)
    try {
      const url = await uploadImage(file, { folder, png, onProgress: setProgress })
      onChange(url)
    } catch (e) {
      setErr(e.message || 'Sawirka lama soo dejin karo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="imgfield">
      {value ? (
        <div className="imgfield-preview">
          <img src={value} alt="" />
          <div className="imgfield-actions">
            <button type="button" className="btn-sm" onClick={() => input.current?.click()} disabled={busy}>
              <UploadCloud size={15} /> Beddel
            </button>
            <button type="button" className="btn-sm btn-sm-danger" onClick={() => onChange('')} disabled={busy}>
              <X size={15} /> Ka saar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`dropzone ${drag ? 'drag' : ''}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => (e.preventDefault(), setDrag(true))}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            handle(e.dataTransfer.files?.[0])
          }}
          disabled={busy}
        >
          <ImagePlus size={26} />
          <span>{busy ? 'Waa la soo dejinayaa…' : 'Riix ama halkan ku jiid sawir'}</span>
          <small>JPG, PNG, WEBP — si toos ah ayaa loo yareeyaa</small>
        </button>
      )}
      {busy && (
        <div className="progress" aria-label="Upload progress">
          <span style={{ width: `${Math.max(progress, 6)}%` }} />
        </div>
      )}
      {err && <p className="field-error">{err}</p>}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => (handle(e.target.files?.[0]), (e.target.value = ''))} />
    </div>
  )
}

export function FieldInput({ field, value, onChange }) {
  const { type } = field
  if (type === 'image') return <ImageField value={value} onChange={onChange} folder={field.folder} png={field.png} />
  if (type === 'textarea' || type === 'lines') {
    return <textarea rows={field.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
  }
  if (type === 'select') {
    return (
      <select value={value ?? field.options?.[0]?.value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  if (type === 'boolean') {
    return (
      <label className="switch">
        <input type="checkbox" checked={value !== false && !!value} onChange={(e) => onChange(e.target.checked)} />
        <span className="switch-track" />
        <span className="switch-text">{value !== false && value ? 'Haa' : 'Maya'}</span>
      </label>
    )
  }
  if (type === 'repeater') {
    const list = Array.isArray(value) ? value : []
    const update = (i, k, v) => onChange(list.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)))
    return (
      <div className="repeater">
        {list.map((it, i) => (
          <div className="repeater-item" key={i}>
            <button type="button" className="icon-btn icon-btn-danger repeater-del" onClick={() => onChange(list.filter((_, idx) => idx !== i))} aria-label="Tirtir">
              <Trash2 size={16} />
            </button>
            {field.fields.map((sf) => (
              <label key={sf.key} className="field">
                <span className="field-label">{sf.label}</span>
                <FieldInput field={sf} value={it[sf.key]} onChange={(v) => update(i, sf.key, v)} />
              </label>
            ))}
          </div>
        ))}
        <button type="button" className="btn-sm" onClick={() => onChange([...list, Object.fromEntries(field.fields.map((f) => [f.key, '']))])}>
          <Plus size={15} /> {field.addLabel || 'Ku dar'}
        </button>
      </div>
    )
  }
  return <input type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
}

export function Field({ field, value, onChange }) {
  const wrap = field.type === 'repeater' || field.type === 'image'
  const Tag = wrap ? 'div' : 'label'
  return (
    <Tag className="field">
      <span className="field-label">
        {field.label}
        {field.required && <b className="req"> *</b>}
      </span>
      <FieldInput field={field} value={value} onChange={onChange} />
      {field.help && <span className="field-help">{field.help}</span>}
    </Tag>
  )
}
