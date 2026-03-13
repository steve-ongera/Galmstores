// CheckoutSuccessPage.jsx
import { Link, useLocation } from 'react-router-dom'

export default function CheckoutSuccessPage() {
  const { state } = useLocation()
  return (
    <div className="container section-sm" style={{ textAlign: 'center', paddingTop: 'var(--space-3xl)' }}>
      <div style={{ fontSize: '5rem', marginBottom: 'var(--space-md)' }}>🎉</div>
      <h1 style={{ marginBottom: 'var(--space-md)', color: 'var(--clr-success)' }}>Order Placed!</h1>
      {state?.order && (
        <div style={{ background: 'var(--clr-rose-pale)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', display: 'inline-block', marginBottom: 'var(--space-xl)' }}>
          Order Number: <strong style={{ color: 'var(--clr-rose-dark)', fontFamily: 'monospace' }}>{state.order.order_number}</strong>
        </div>
      )}
      <p style={{ maxWidth: 480, margin: '0 auto var(--space-xl)' }}>
        Thank you for shopping with GlamStore! You'll receive a confirmation soon. Your order is being processed.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/orders" className="btn btn-primary"><i className="bi bi-bag-check"></i> View My Orders</Link>
        <Link to="/" className="btn btn-outline"><i className="bi bi-shop"></i> Continue Shopping</Link>
      </div>
    </div>
  )
}