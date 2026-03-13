// AccountPage.jsx

import { useAuth } from '../context/AuthContext'
export function AccountPage() {
  const { user } = useAuth()
  return (
    <div className="container section-sm">
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>My Account</h1>
      <div className="grid-2">
        <div className="card card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--clr-rose), var(--clr-gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', fontWeight: 700 }}>
              {user?.first_name?.[0] || user?.username?.[0] || 'G'}
            </div>
            <div>
              <h3>{user?.first_name} {user?.last_name}</h3>
              <p style={{ fontSize: '0.875rem' }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {[['bi-bag-check', 'My Orders', '/orders'], ['bi-heart', 'Wishlist', '/wishlist'], ['bi-geo-alt', 'Addresses', '/account#addresses'], ['bi-shield-lock', 'Security', '/account#security']].map(([icon, label, href]) => (
              <Link key={label} to={href} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: '12px var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--clr-border)', transition: 'all 0.2s', color: 'var(--clr-charcoal)' }}>
                <i className={`bi ${icon}`} style={{ color: 'var(--clr-rose)' }}></i>
                {label}
                <i className="bi bi-chevron-right" style={{ marginLeft: 'auto', color: 'var(--clr-muted)', fontSize: '0.8rem' }}></i>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="card card-body">
            <h3 style={{ marginBottom: 'var(--space-lg)' }}>Account Info</h3>
            {[['Username', user?.username], ['Email', user?.email], ['Name', `${user?.first_name || ''} ${user?.last_name || ''}`.trim()]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--clr-border)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--clr-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
 