import { useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { ImagePlus, Trash2 } from 'lucide-react'
import { db, COL } from '../firebase'
import { useRawCollection } from '../lib/data'
import { uploadImage } from '../lib/image'
import { Loading } from '../components/ui'
import { useToast } from './toast'

function GalleryItem({ item, onDelete }) {
  const toast = useToast()
  const [caption, setCaption] = useState(item.caption || '')
  const [category, setCategory] = useState(item.category || '')
  const save = async (patch) => {
    try {
      await updateDoc(doc(db, COL.gallery, item.id), { ...patch, updatedAt: serverTimestamp() })
    } catch (e) {
      console.error(e)
      toast('Lama kaydin karo.', 'err')
    }
  }
  return (
    <article className="acard">
      <img className="acard-img" src={item.image} alt="" loading="lazy" />
      <div className="acard-body form-grid">
        <label className="field">
          <span className="field-label">Qoraal sawirka (caption)</span>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} onBlur={() => caption !== (item.caption || '') && save({ caption })} />
        </label>
        <label className="field">
          <span className="field-label">Qaybta (tusaale: WASH, Health)</span>
          <input value={category} onChange={(e) => setCategory(e.target.value)} onBlur={() => category !== (item.category || '') && save({ category })} />
        </label>
      </div>
      <div className="acard-actions">
        <button type="button" className="btn-sm btn-sm-danger" onClick={() => onDelete(item)}>
          <Trash2 size={15} /> Tirtir
        </button>
      </div>
    </article>
  )
}

export default function GalleryManager() {
  const toast = useToast()
  const { items, loading } = useRawCollection(COL.gallery)
  const [busy, setBusy] = useState(null) // {done,total}
  const input = useRef(null)

  async function upload(files) {
    const list = Array.from(files || [])
    if (!list.length) return
    let done = 0
    let fail = 0
    let order = items.reduce((m, it) => Math.max(m, Number(it.order) || 0), 0)
    setBusy({ done, total: list.length })
    for (const file of list) {
      try {
        const url = await uploadImage(file, { folder: 'gallery' })
        order += 1
        await addDoc(collection(db, COL.gallery), { image: url, caption: '', category: '', order, createdAt: serverTimestamp() })
      } catch (e) {
        console.error(e)
        fail += 1
      }
      done += 1
      setBusy({ done, total: list.length })
    }
    setBusy(null)
    toast(fail ? `${list.length - fail} sawir ayaa la geliyay, ${fail} way fashilmeen.` : `${list.length} sawir ayaa la geliyay`, fail ? 'err' : 'ok')
  }

  async function remove(item) {
    if (!window.confirm('Ma hubtaa inaad tirtirto sawirkan?')) return
    try {
      await deleteDoc(doc(db, COL.gallery, item.id))
      toast('Waa la tirtiray')
    } catch (e) {
      console.error(e)
      toast('Lama tirtiri karo.', 'err')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Gallery</h1>
          <p className="page-hint">Halkan ku shub sawirro badan hal mar. Qoraalka iyo qaybta ku qor sawir kasta hoostiisa.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => input.current?.click()} disabled={!!busy}>
          <ImagePlus size={18} /> {busy ? `${busy.done}/${busy.total} waa la soo dejinayaa…` : 'Ku dar sawirro'}
        </button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />
      </div>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-admin">
          <p>Weli sawir lama gelin.</p>
        </div>
      ) : (
        <div className="cards">
          {items.map((it) => (
            <GalleryItem key={it.id} item={it} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
