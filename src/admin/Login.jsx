import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react'
import { Topo, useLogo } from '../components/ui'
import { useSite } from '../lib/data'
import { useAuth } from './auth'
import '../styles/lock.css'

// Lock screen-ka admin-ka: link-ga /admin had iyo jeer halkan ayuu ku furmaa
export default function Login() {
  const { login, lastUser, forgetUser } = useAuth()
  const { site } = useSite()
  const logo = useLogo()
  const [u, setU] = useState(lastUser || '')
  const [p, setP] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)
  const remembered = !!lastUser && u === lastUser

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await login(u, p)
    } catch (ex) {
      setErr(ex.message)
      setShake((n) => n + 1)
      setBusy(false)
    }
  }

  const switchUser = () => {
    forgetUser()
    setU('')
    setP('')
    setErr('')
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
        <form className="login-card" onSubmit={submit} key={shake} data-shake={shake > 0 ? '1' : undefined}>
          <span className="lock-badge" aria-hidden="true">
            <Lock size={26} />
          </span>
          <h2>Admin waa xiran yahay</h2>
          <p>{remembered ? 'Geli password-kaaga si aad u furto.' : 'Geli username-kaaga iyo password-kaaga si aad u furto.'}</p>

          {remembered ? (
            <div className="lock-user">
              <span className="avatar-a">{(u[0] || '?').toUpperCase()}</span>
              <div>
                <strong>@{u}</strong>
                <small>Account-ka ugu dambeeyay</small>
              </div>
              <button type="button" className="lock-switch" onClick={switchUser}>
                Account kale
              </button>
            </div>
          ) : (
            <label className="field">
              <span className="field-label">Username</span>
              <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" autoFocus={!lastUser} />
            </label>
          )}

          <label className="field">
            <span className="field-label">Password</span>
            <span className="pw-wrap">
              <input type={show ? 'text' : 'password'} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" autoFocus={remembered} />
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
            <LogIn size={18} /> {busy ? 'Fadlan sug…' : 'Fur'}
          </button>
          <Link to="/" className="login-back">
            Ku noqo website-ka
          </Link>
        </form>
      </main>
    </div>
  )
}