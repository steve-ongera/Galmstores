// NotFoundPage.jsx
export function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
      <div style={{ fontSize: '6rem', marginBottom: 'var(--space-md)' }}>🌸</div>
      <h1 style={{ color: 'var(--clr-rose)', marginBottom: 'var(--space-md)' }}>404</h1>
      <h2 style={{ marginBottom: 'var(--space-md)' }}>Oops! Page Not Found</h2>
      <p style={{ maxWidth: 400, margin: '0 auto var(--space-xl)' }}>This page seems to have walked off the runway. Let's get you back to the glam.</p>
      <Link to="/" className="btn btn-primary btn-lg"><i className="bi bi-house"></i> Back to Home</Link>
    </div>
  )
}