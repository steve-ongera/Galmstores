// OrdersPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import { Breadcrumb, EmptyState } from '../components/common/Toast'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { ordersAPI.list().then(d => setOrders(d.results || d)).finally(() => setLoading(false)) }, [])

  const STATUS_COLORS = { pending: 'badge-rose', confirmed: 'badge-gold', processing: 'badge-gold', shipped: 'badge-success', delivered: 'badge-success', cancelled: 'badge-error' }

  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Orders' }]} />
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>My Orders</h1>
      {loading ? <p>Loading...</p> : orders.length === 0 ? (
        <EmptyState icon="bi-bag-x" title="No orders yet" description="Place your first order!" action={<Link to="/products" className="btn btn-primary">Shop Now</Link>} />
      ) : (
        orders.map(order => (
          <Link key={order.id} to={`/orders/${order.id}`} style={{ display: 'block', textDecoration: 'none' }}>
            <div className="card card-body mb-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--clr-rose-dark)' }}>{order.order_number}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)', marginTop: 4 }}>{new Date(order.created_at).toLocaleDateString()} · {order.items?.length || 0} item(s)</div>
              </div>
              <span className={`badge ${STATUS_COLORS[order.status] || 'badge-rose'}`}>{order.status}</span>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-rose-dark)' }}>KES {Number(order.total).toLocaleString()}</div>
              <i className="bi bi-chevron-right" style={{ color: 'var(--clr-muted)' }}></i>
            </div>
          </Link>
        ))
      )}
    </div>
  )
}