import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useSite } from '../lib/data'
import { saveSite } from '../lib/seed'
import { Field } from './fields'
import { useToast } from './toast'

// Multi-group form that saves the rda_settings/site doc
export default function SettingsForm({ title, hint, groups }) {
  const { site, loaded } = useSite()
  const toast = useToast()
  const [values, setValues] = useState(null)
  const [active, setActive] = useState(groups[0].id)
  const [saving, setSaving] = useState(false)
  const keys = groups.flatMap((g) => g.fields.map((f) => f.key))

  useEffect(() => {
    if (!loaded || values) return
    setValues(Object.fromEntries(keys.map((k) => [k, site[k] ?? ''])))
  }, [loaded, site, values]) // eslint-disable-line

  if (!values) return <div className="page"><p>Loading…</p></div>
  const group = groups.find((g) => g.id === active) || groups[0]

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await saveSite(values)
      toast('Saved — the website is updated')
    } catch (err) {
      console.error(err)
      toast('Could not save. Check your Firestore rules or internet connection.', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="page" onSubmit={save}>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          {hint && <p className="page-hint">{hint}</p>}
        </div>
        <button className="btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="tabs" role="tablist">
        {groups.map((g) => (
          <button type="button" key={g.id} role="tab" aria-selected={g.id === active} className={`tab ${g.id === active ? 'on' : ''}`} onClick={() => setActive(g.id)}>
            {g.title}
          </button>
        ))}
      </div>

      <section className="panel">
        {group.desc && <p className="panel-desc">{group.desc}</p>}
        <div className="form-grid">
          {group.fields.map((f) => (
            <Field key={f.key} field={f} value={values[f.key]} onChange={(v) => setValues((s) => ({ ...s, [f.key]: v }))} />
          ))}
        </div>
      </section>
    </form>
  )
}