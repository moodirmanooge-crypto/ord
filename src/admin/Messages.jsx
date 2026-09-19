import { useState } from 'react'
import { deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Mail, Trash2 } from 'lucide-react'
import { db, COL } from '../firebase'
import { useRawCollection } from '../lib/data'
import { fmtDate, toMillis } from '../lib/text'
import { Loading, Modal } from '../components/ui'
import { useToast } from './toast'

export default function Messages() {
  const toast = useToast()
  const { items, loading } = useRawCollection(COL.messages)
  const [open, setOpen] = useState(null)
  const list = items.slice().sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))

  async function view(m) {
    setOpen(m)
    if (!m.read) updateDoc(doc(db, COL.messages, m.id), { read: true }).catch(() => {})
  }
  async function remove(m) {
    if (!window.confirm('Ma hubtaa inaad tirtirto fariintan?')) return
    try {
      await deleteDoc(doc(db, COL.messages, m.id))
      setOpen(null)
      toast('Waa la tirtiray')
    } catch (e) {
      console.error(e)
      toast('Lama tirtiri karo.', 'err')
    }
  }
  const unread = list.filter((m) => !m.read).length

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Fariimaha</h1>
          <p className="page-hint">Fariimaha laga soo diray foomka Contact ee website-ka. {unread > 0 ? `${unread} lama akhriyin.` : 'Dhammaan waa la akhriyay.'}</p>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <div className="empty-admin">
          <p>Fariin wali ma timaadin.</p>
        </div>
      ) : (
        <ul className="msg-list">
          {list.map((m) => (
            <li key={m.id}>
              <button type="button" className={`msg ${m.read ? '' : 'unread'}`} onClick={() => view(m)}>
                <span className="msg-dot" aria-label={m.read ? '' : 'Cusub'} />
                <span className="msg-main">
                  <strong>{m.name}</strong>
                  <span className="msg-topic">{m.topic}</span>
                  <span className="msg-snippet">{m.message}</span>
                </span>
                <time>{fmtDate(m.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.name || ''}
        footer={
          open && (
            <>
              <button type="button" className="btn-sm btn-sm-danger" onClick={() => remove(open)}>
                <Trash2 size={15} /> Tirtir
              </button>
              <a className="btn-primary" href={`mailto:${open.email}?subject=${encodeURIComponent('Re: ' + (open.topic || 'Your message to RDA'))}`}>
                <Mail size={17} /> Jawaab
              </a>
            </>
          )
        }
      >
        {open && (
          <dl className="msg-detail">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${open.email}`}>{open.email}</a>
              </dd>
            </div>
            {open.phone && (
              <div>
                <dt>Telefoon</dt>
                <dd>{open.phone}</dd>
              </div>
            )}
            {open.organization && (
              <div>
                <dt>Urur</dt>
                <dd>{open.organization}</dd>
              </div>
            )}
            <div>
              <dt>Mawduuc</dt>
              <dd>{open.topic}</dd>
            </div>
            <div>
              <dt>Taariikh</dt>
              <dd>{fmtDate(open.createdAt)}</dd>
            </div>
            <div className="msg-body">
              <dt>Fariinta</dt>
              <dd>{open.message}</dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  )
}
