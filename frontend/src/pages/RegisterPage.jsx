// RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/common/Toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', password2: '' })
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState({ password: false, password2: false })
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})

    if (form.password !== form.password2) {
      setFieldErrors({ password2: ['Passwords do not match'] })
      return
    }

    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      if (err?.data && typeof err.data === 'object') {
        setFieldErrors(err.data)
        const firstField = Object.keys(err.data)[0]
        const firstMsg = Array.isArray(err.data[firstField])
          ? err.data[firstField][0]
          : err.data[firstField]
        toast.error(`${firstField}: ${firstMsg}`)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const FIELDS = [
    ['first_name', 'First Name', 'text', 'bi-person'],
    ['last_name', 'Last Name', 'text', 'bi-person'],
    ['username', 'Username', 'text', 'bi-at'],
    ['email', 'Email', 'email', 'bi-envelope'],
    ['password', 'Password', 'password', 'bi-lock'],
    ['password2', 'Confirm Password', 'password', 'bi-lock-fill'],
  ]

  const isPasswordField = (key) => key === 'password' || key === 'password2'

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <img
            src="/logo.jpg"
            alt="GlamStore"
            style={{
              display: 'block',
              margin: '0 auto 12px',
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
            }}
          />
          <h2>Join GlamStore</h2>
          <p style={{ fontSize: '0.9rem', marginTop: 4 }}>Create your account and start shopping</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-sm)' }}>
            {FIELDS.map(([key, label, type, icon]) => (
              <div
                key={key}
                className="form-group"
                style={key === 'email' || isPasswordField(key) ? { gridColumn: '1 / -1' } : {}}
              >
                <label className="form-label">
                  <i className={`bi ${icon}`}></i> {label}
                </label>

                <div style={{ position: 'relative' }}>
                  <input
                    type={isPasswordField(key) ? (showPasswords[key] ? 'text' : 'password') : type}
                    className={`form-control ${fieldErrors[key] ? 'is-invalid' : ''}`}
                    value={form[key]}
                    onChange={e => {
                      setForm(f => ({ ...f, [key]: e.target.value }))
                      if (fieldErrors[key]) setFieldErrors(f => ({ ...f, [key]: null }))
                    }}
                    required
                    style={isPasswordField(key) ? { paddingRight: '2.6rem' } : {}}
                  />
                  {isPasswordField(key) && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(v => ({ ...v, [key]: !v[key] }))}
                      tabIndex={-1}
                      aria-label={showPasswords[key] ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 10, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--clr-muted)',
                        padding: 0, lineHeight: 1, fontSize: '1.1rem'
                      }}
                    >
                      <i className={`bi ${showPasswords[key] ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  )}
                </div>

                {fieldErrors[key] && (
                  <div style={{ color: 'var(--clr-rose)', fontSize: '0.78rem', marginTop: 4 }}>
                    <i className="bi bi-exclamation-circle"></i>{' '}
                    {Array.isArray(fieldErrors[key]) ? fieldErrors[key].join(' ') : fieldErrors[key]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {fieldErrors.non_field_errors && (
            <div style={{
              color: 'var(--clr-rose)', fontSize: '0.82rem',
              marginTop: 8, padding: '8px 12px',
              background: 'rgba(var(--clr-rose-rgb), 0.08)',
              borderRadius: 6, border: '1px solid var(--clr-rose)'
            }}>
              <i className="bi bi-exclamation-triangle"></i>{' '}
              {Array.isArray(fieldErrors.non_field_errors)
                ? fieldErrors.non_field_errors.join(' ')
                : fieldErrors.non_field_errors}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full mt-md" disabled={loading}>
            {loading ? 'Creating account...' : <><i className="bi bi-person-check"></i> Create Account</>}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--clr-rose)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}