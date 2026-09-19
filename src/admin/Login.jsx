import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Topo, useLogo } from '../components/ui'
import { useSite } from '../lib/data'
import { useAuth } from './auth'

export default function Login() {
  const { login } = useAuth()
  const { site } = useSite()
  const logo = useLogo()
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(u, p)
    } catch (ex) {
      setErr(ex.message)
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <aside className="login-side">
        <Topo seed={2.9} cx={800} cy={420} rings={14} />
        <div className="login-side-inner">
          <img src={logo} alt="" />
          <h1>{site.orgName}</h1>
          <p>{site.country} — Admin Panel</p>
        </div>
      </aside>
      <main className="login-main">
        <form className="login-card" onSubmit={submit}>
          <h2>Soo gal</h2>
          <p>Geli username-kaaga iyo password-kaaga si aad u maamusho website-ka.</p>
          <label className="field">
            <span className="field-label">Username</span>
            <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <span className="pw-wrap">
              <input type={show ? 'text' : 'password'} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
              <button type="button" className="icon-btn" onClick={() => setShow((v) => !v)} aria-label="Muuji/qari password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
          {err && (
            <p className="notice notice-err" role="alert">
              {err}
            </p>
          )}
          <button className="btn-primary btn-block" disabled={busy}>
            <LogIn size={18} /> {busy ? 'Fadlan sug…' : 'Soo gal'}
          </button>
          <Link to="/" className="login-back">
            Ku noqo website-ka
          </Link>
        </form>
      </main>
    </div>
  )
}
