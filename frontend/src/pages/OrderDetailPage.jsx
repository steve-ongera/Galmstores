// OrderDetailPage.jsx
import { useParams } from 'react-router-dom'
export function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  useEffect(() => { ordersAPI.detail(id).then(setOrder) }, [id])
  if (!order) return <div className="container section-sm"><p>Loading...</p></div>
  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Orders', href: '/orders' }, { label: order.order_number }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1>{order.order_number}</h1>
        <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' ? 'badge-error' : 'badge-gold'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>{order.status}</span>
      </div>
      <div className="cart-layout">
        <div>
          {order.items?.map(item => (
            <div key={item.id} className="cart-item">
              {item.image_url && <img src={item.image_url} alt={item.product_name} className="cart-item__img" />}
              <div>
                <div className="cart-item__name">{item.product_name}</div>
                {item.variant_name && <div className="cart-item__variant">{item.variant_name}</div>}
                <div>x{item.quantity}</div>
              </div>
              <strong style={{ color: 'var(--clr-rose-dark)' }}>KES {Number(item.subtotal).toLocaleString()}</strong>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h3>Order Details</h3>
          <div className="order-summary-row"><span>Subtotal</span><span>KES {Number(order.subtotal).toLocaleString()}</span></div>
          <div className="order-summary-row"><span>Shipping</span><span>KES {Number(order.shipping_cost).toLocaleString()}</span></div>
          {order.discount_amount > 0 && <div className="order-summary-row" style={{ color: 'var(--clr-success)' }}><span>Discount</span><span>-KES {Number(order.discount_amount).toLocaleString()}</span></div>}
          <div className="order-summary-row total"><span>Total</span><span>KES {Number(order.total).toLocaleString()}</span></div>
          {order.shipping_address && (
            <>
              <hr className="divider" />
              <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: '0.875rem' }}>Delivery Address</h4>
              <p style={{ fontSize: '0.875rem' }}>{order.shipping_address.full_name}<br />{order.shipping_address.address_line1}, {order.shipping_address.city}<br />{order.shipping_address.phone}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
 