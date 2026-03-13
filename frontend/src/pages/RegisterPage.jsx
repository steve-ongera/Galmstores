// RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) { toast.error('Registration failed. Try again.') }
    finally { setLoading(false) }
  }

  const FIELDS = [
    ['first_name', 'First Name', 'text', 'bi-person'], ['last_name', 'Last Name', 'text', 'bi-person'],
    ['username', 'Username', 'text', 'bi-at'], ['email', 'Email', 'email', 'bi-envelope'],
    ['password', 'Password', 'password', 'bi-lock'], ['password2', 'Confirm Password', 'password', 'bi-lock-fill'],
  ]

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>✨</div>
          <h2>Join GlamStore</h2>
          <p style={{ fontSize: '0.9rem', marginTop: 4 }}>Create your account and start shopping</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-sm)' }}>
            {FIELDS.map(([key, label, type, icon]) => (
              <div key={key} className="form-group" style={key === 'email' ? { gridColumn: '1 / -1' } : {}}>
                <label className="form-label"><i className={`bi ${icon}`}></i> {label}</label>
                <input type={type} className="form-control" value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-primary btn-full mt-md" disabled={loading}>
            {loading ? 'Creating account...' : <><i className="bi bi-person-check"></i> Create Account</>}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--clr-rose)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}