import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersAPI, addressesAPI, paymentsAPI, couponsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../components/common/Toast'
import { Breadcrumb, Spinner } from '../components/common/Toast'

const STEPS = ['Address', 'Payment', 'Review']

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ full_name: '', phone: '', address_line1: '', city: '', county: '', country: 'Kenya' })
  const pollRef = useRef(null)

  useEffect(() => {
    addressesAPI.list().then(data => {
      setAddresses(data.results || data)
      const def = (data.results || data).find(a => a.is_default)
      if (def) setSelectedAddress(def.id)
    })
  }, [])

  const shipping = cart.total >= 2000 ? 0 : 200
  const discount = couponData ? Number(couponData.discount_amount) : 0
  const grandTotal = Number(cart.total) + shipping - discount

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const addr = await addressesAPI.create(newAddress)
    setAddresses(a => [...a, addr])
    setSelectedAddress(addr.id)
    setShowAddressForm(false)
  }

  const handleApplyCoupon = async () => {
    try {
      const data = await couponsAPI.validate(couponCode, cart.total)
      setCouponData(data)
      toast.success(`Coupon applied! You save KES ${data.discount_amount}`)
    } catch (err) {
      toast.error(err.data?.error || 'Invalid coupon code')
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedAddress) return toast.error('Please select an address')
    setLoading(true)
    try {
      const ord = await ordersAPI.createFromCart({ shipping_address_id: selectedAddress })
      setOrder(ord)
      setStep(1)
    } catch { toast.error('Failed to create order') }
    finally { setLoading(false) }
  }

  const handleMpesaPay = async () => {
    if (!mpesaPhone) return toast.error('Enter your M-Pesa number')
    setLoading(true)
    try {
      const res = await paymentsAPI.mpesaSTKPush({
        phone_number: mpesaPhone,
        order_id: order.id,
        amount: grandTotal
      })
      toast.info('Check your phone for M-Pesa PIN prompt...')
      // Poll for status
      pollRef.current = setInterval(async () => {
        const status = await paymentsAPI.mpesaCheckStatus(res.payment_id)
        if (status.order_status === 'paid') {
          clearInterval(pollRef.current)
          toast.success('Payment successful! 🎉')
          fetchCart()
          navigate('/checkout/success', { state: { order } })
        } else if (status.status === 'failed') {
          clearInterval(pollRef.current)
          toast.error('Payment failed. Please try again.')
          setLoading(false)
        }
      }, 3000)
      setTimeout(() => { clearInterval(pollRef.current); setLoading(false) }, 90000)
    } catch { toast.error('STK Push failed'); setLoading(false) }
  }

  const handlePayPalPay = async () => {
    setLoading(true)
    try {
      const res = await paymentsAPI.paypalCreateOrder(order.id)
      window.location.href = res.approval_url
    } catch { toast.error('PayPal error'); setLoading(false) }
  }

  return (
    <div className="container section-sm" style={{ maxWidth: 900 }}>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />

      {/* Steps */}
      <div className="checkout-steps mb-xl">
        {STEPS.map((s, i) => (
          <div key={s} className="checkout-step" style={{ flex: 1 }}>
            <div className={`checkout-step__num${i < step ? ' done' : i === step ? ' active' : ''}`}
              style={{
                background: i < step ? 'var(--clr-success)' : i === step ? 'var(--clr-rose)' : 'transparent',
                borderColor: i < step ? 'var(--clr-success)' : i === step ? 'var(--clr-rose)' : 'var(--clr-border)',
                color: i <= step ? 'white' : 'var(--clr-muted)',
              }}
            >
              {i < step ? <i className="bi bi-check"></i> : i + 1}
            </div>
            <span className="checkout-step__label" style={{ color: i === step ? 'var(--clr-charcoal)' : 'var(--clr-muted)' }}>{s}</span>
            {i < STEPS.length - 1 && <div className="checkout-step__line" style={{ background: i < step ? 'var(--clr-success)' : 'var(--clr-border)' }}></div>}
          </div>
        ))}
      </div>

      <div className="cart-layout">
        <div>
          {/* STEP 0: ADDRESS */}
          {step === 0 && (
            <div className="card card-body">
              <h3 className="mb-lg">Delivery Address</h3>
              {addresses.map(addr => (
                <label
                  key={addr.id}
                  style={{
                    display: 'flex', gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    border: `2px solid ${selectedAddress === addr.id ? 'var(--clr-rose)' : 'var(--clr-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-sm)',
                    cursor: 'pointer',
                    background: selectedAddress === addr.id ? 'var(--clr-rose-pale)' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                  <div>
                    <strong>{addr.full_name}</strong>
                    {addr.is_default && <span className="badge badge-rose" style={{ marginLeft: 8 }}>Default</span>}
                    <div style={{ fontSize: '0.875rem', color: 'var(--clr-muted)', marginTop: 4 }}>
                      {addr.address_line1}, {addr.city}, {addr.county} · {addr.phone}
                    </div>
                  </div>
                </label>
              ))}

              {!showAddressForm ? (
                <button className="btn btn-outline btn-sm mt-md" onClick={() => setShowAddressForm(true)}>
                  <i className="bi bi-plus"></i> Add New Address
                </button>
              ) : (
                <form onSubmit={handleAddAddress} style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-lg)', background: 'var(--clr-ivory-dark)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="grid-2">
                    {[['full_name', 'Full Name'], ['phone', 'Phone'], ['address_line1', 'Address'], ['city', 'City'], ['county', 'County/Area'], ['country', 'Country']].map(([k, label]) => (
                      <div key={k} className="form-group" style={k === 'address_line1' ? { gridColumn: '1 / -1' } : {}}>
                        <label className="form-label">{label}</label>
                        <input className="form-control" value={newAddress[k]} onChange={e => setNewAddress(a => ({ ...a, [k]: e.target.value }))} required />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm">Save Address</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <button className="btn btn-primary btn-full mt-lg" onClick={handleCreateOrder} disabled={!selectedAddress || loading}>
                {loading ? <Spinner size={20} /> : <><i className="bi bi-arrow-right"></i> Continue to Payment</>}
              </button>
            </div>
          )}

          {/* STEP 1: PAYMENT */}
          {step === 1 && (
            <div className="card card-body">
              <h3 className="mb-lg">Payment Method</h3>
              <div className="payment-methods">
                <div
                  className={`payment-method-card${paymentMethod === 'mpesa' ? ' selected' : ''}`}
                  onClick={() => setPaymentMethod('mpesa')}
                >
                  <div style={{ fontSize: '2rem' }}>📱</div>
                  <div>
                    <div className="payment-method-card__name">M-Pesa</div>
                    <div className="payment-method-card__desc">Pay with Safaricom M-Pesa STK Push</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <i className={`bi ${paymentMethod === 'mpesa' ? 'bi-check-circle-fill' : 'bi-circle'}`} style={{ color: 'var(--clr-rose)', fontSize: '1.2rem' }}></i>
                  </div>
                </div>

                <div
                  className={`payment-method-card${paymentMethod === 'paypal' ? ' selected' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div style={{ fontSize: '2rem' }}>💳</div>
                  <div>
                    <div className="payment-method-card__name">PayPal</div>
                    <div className="payment-method-card__desc">Pay securely with PayPal or credit card</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <i className={`bi ${paymentMethod === 'paypal' ? 'bi-check-circle-fill' : 'bi-circle'}`} style={{ color: 'var(--clr-rose)', fontSize: '1.2rem' }}></i>
                  </div>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <div className="form-group">
                    <label className="form-label">M-Pesa Phone Number</label>
                    <input
                      className="form-control"
                      placeholder="0712345678 or 254712345678"
                      value={mpesaPhone}
                      onChange={e => setMpesaPhone(e.target.value)}
                    />
                  </div>
                  <div style={{ background: 'var(--clr-gold-pale)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#6b5a2a' }}>
                    <i className="bi bi-info-circle"></i> You will receive an M-Pesa PIN prompt on your phone. Enter your PIN to complete payment.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-lg)' }}>
                <button className="btn btn-outline" onClick={() => setStep(0)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Review Order <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW */}
          {step === 2 && order && (
            <div className="card card-body">
              <h3 className="mb-lg">Review Your Order</h3>
              {order.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--clr-border)', marginBottom: 'var(--space-md)' }}>
                  {item.image_url && <img src={item.image_url} alt={item.product_name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                    {item.variant_name && <div style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>{item.variant_name}</div>}
                    <div style={{ fontSize: '0.85rem' }}>x{item.quantity} · KES {Number(item.unit_price).toLocaleString()}</div>
                  </div>
                  <strong style={{ color: 'var(--clr-rose-dark)' }}>KES {Number(item.subtotal).toLocaleString()}</strong>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-lg)' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>
                  <i className="bi bi-arrow-left"></i> Back
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={paymentMethod === 'mpesa' ? handleMpesaPay : handlePayPalPay}
                  disabled={loading}
                >
                  {loading
                    ? <><Spinner size={18} /> Processing...</>
                    : paymentMethod === 'mpesa'
                      ? <><i className="bi bi-phone"></i> Pay KES {grandTotal.toLocaleString()} via M-Pesa</>
                      : <><i className="bi bi-paypal"></i> Pay via PayPal</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Summary</h3>
          <div className="order-summary-row"><span>Items</span><span>KES {Number(cart.total).toLocaleString()}</span></div>
          <div className="order-summary-row"><span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--clr-success)' : 'inherit' }}>{shipping === 0 ? 'FREE' : `KES ${shipping}`}</span></div>

          {/* Coupon */}
          {!couponData ? (
            <div style={{ display: 'flex', gap: 8, margin: 'var(--space-md) 0' }}>
              <input
                className="form-control"
                placeholder="Coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                style={{ padding: '8px 12px' }}
              />
              <button className="btn btn-outline btn-sm" onClick={handleApplyCoupon}>Apply</button>
            </div>
          ) : (
            <div className="order-summary-row" style={{ color: 'var(--clr-success)' }}>
              <span>Discount ({couponData.code})</span>
              <span>- KES {Number(couponData.discount_amount).toLocaleString()}</span>
            </div>
          )}

          <div className="order-summary-row total">
            <span>Total</span>
            <span>KES {grandTotal.toLocaleString()}</span>
          </div>

          <div style={{ marginTop: 'var(--space-md)', fontSize: '0.75rem', color: 'var(--clr-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="bi bi-shield-lock-fill" style={{ color: 'var(--clr-success)' }}></i>
            Secured by M-Pesa & PayPal
          </div>
        </div>
      </div>
    </div>
  )
}