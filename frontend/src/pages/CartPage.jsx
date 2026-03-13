import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { Breadcrumb, EmptyState } from '../components/common/Toast'

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart()
  const { isAuth } = useAuth()
  const navigate = useNavigate()
  const shipping = cart.total >= 2000 ? 0 : 200
  const grandTotal = Number(cart.total) + shipping

  if (cart.item_count === 0) return (
    <div className="container section-sm">
      <EmptyState
        icon="bi-bag-x"
        title="Your bag is empty"
        description="Looks like you haven't added anything yet. Let's change that!"
        action={<Link to="/products" className="btn btn-primary">Start Shopping</Link>}
      />
    </div>
  )

  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shopping Bag' }]} />
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>Shopping Bag <span style={{ color: 'var(--clr-muted)', fontSize: '1.2rem' }}>({cart.item_count})</span></h1>

      <div className="cart-layout">
        {/* Items */}
        <div>
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={item.product?.primary_image || '/placeholder.png'}
                alt={item.product?.name}
                className="cart-item__img"
              />
              <div>
                <Link to={`/products/${item.product?.slug}`} className="cart-item__name">{item.product?.name}</Link>
                {item.variant && <div className="cart-item__variant">{item.variant.name}: {item.variant.value}</div>}
                <div className="cart-item__price">KES {Number(item.unit_price).toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div className="qty-control" style={{ gap: 8 }}>
                    <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <i className="bi bi-dash"></i>
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity + 1)}>
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--clr-error)', fontSize: '1rem' }}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--clr-rose-dark)', fontSize: '1.05rem', textAlign: 'right' }}>
                KES {Number(item.subtotal).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-summary-row">
            <span>Subtotal ({cart.item_count} items)</span>
            <span>KES {Number(cart.total).toLocaleString()}</span>
          </div>
          <div className="order-summary-row">
            <span>Shipping</span>
            <span style={{ color: shipping === 0 ? 'var(--clr-success)' : 'inherit' }}>
              {shipping === 0 ? 'FREE' : `KES ${shipping}`}
            </span>
          </div>
          {shipping > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--clr-rose)', background: 'var(--clr-rose-pale)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
              Add KES {(2000 - Number(cart.total)).toLocaleString()} more for free shipping!
            </p>
          )}
          <div className="order-summary-row total">
            <span>Total</span>
            <span>KES {grandTotal.toLocaleString()}</span>
          </div>

          <button
            className="btn btn-primary btn-full mt-lg"
            onClick={() => isAuth ? navigate('/checkout') : navigate('/login?redirect=/checkout')}
          >
            <i className="bi bi-lock-fill"></i>
            {isAuth ? 'Proceed to Checkout' : 'Sign in to Checkout'}
          </button>

          <Link to="/products" className="btn btn-ghost btn-full mt-sm">
            <i className="bi bi-arrow-left"></i> Continue Shopping
          </Link>

          <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--clr-ivory-dark)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-muted)' }}>
            <i className="bi bi-lock-fill" style={{ marginRight: 4 }}></i>
            Secure checkout via M-Pesa or PayPal
          </div>
        </div>
      </div>
    </div>
  )
}