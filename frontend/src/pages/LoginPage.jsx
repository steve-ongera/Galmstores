// LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'
 
export function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      navigate(redirect)
    } catch { toast.error('Invalid username or password') }
    finally { setLoading(false) }
  }
 
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>💄</div>
          <h2>Welcome Back!</h2>
          <p style={{ fontSize: '0.9rem', marginTop: 4 }}>Sign in to your GlamStore account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label"><i className="bi bi-person"></i> Username or Email</label>
            <input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label"><i className="bi bi-lock"></i> Password</label>
            <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 'var(--space-lg)' }}>
            <a href="#forgot" style={{ fontSize: '0.85rem', color: 'var(--clr-rose)' }}>Forgot password?</a>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          New to GlamStore? <Link to="/register" style={{ color: 'var(--clr-rose)', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  )
}
export default LoginPage