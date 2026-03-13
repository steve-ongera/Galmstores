// CategoryPills.jsx
import { Link, useParams } from 'react-router-dom'

const CATS = [
  { label: 'All', slug: '', icon: 'bi-grid' },
  { label: 'Skin Care', slug: 'skincare', icon: 'bi-droplet-fill' },
  { label: 'Human Hair', slug: 'hair', icon: 'bi-scissors' },
  { label: 'Earrings', slug: 'earrings', icon: 'bi-gem' },
  { label: 'Stick-Ons', slug: 'stickons', icon: 'bi-stars' },
  { label: 'Handbags', slug: 'handbags', icon: 'bi-handbag-fill' },
]

export function CategoryPills({ activeSlug = '' }) {
  return (
    <div className="category-pills">
      {CATS.map(cat => (
        <Link
          key={cat.slug}
          to={cat.slug ? `/category/${cat.slug}` : '/products'}
          className={`category-pill${activeSlug === cat.slug ? ' active' : ''}`}
        >
          <i className={`bi ${cat.icon} category-pill__icon`}></i>
          <span className="category-pill__label">{cat.label}</span>
        </Link>
      ))}
    </div>
  )
}

// FlashSaleTimer.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function FlashSaleTimer({ endTime, title = 'Flash Sale', discount = 50 }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) return setTimeLeft({ h: 0, m: 0, s: 0 })
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="flash-sale-banner">
      <div className="flash-sale-banner__left">
        <span className="flash-sale-banner__tag">⚡ Limited Time</span>
        <h2>{title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 16px' }}>
          Up to {discount}% off selected items
        </p>
        <div className="flash-sale-timer">
          <div className="timer-block">
            <span className="timer-block__value">{pad(timeLeft.h)}</span>
            <span className="timer-block__label">Hrs</span>
          </div>
          <span className="timer-sep">:</span>
          <div className="timer-block">
            <span className="timer-block__value">{pad(timeLeft.m)}</span>
            <span className="timer-block__label">Min</span>
          </div>
          <span className="timer-sep">:</span>
          <div className="timer-block">
            <span className="timer-block__value">{pad(timeLeft.s)}</span>
            <span className="timer-block__label">Sec</span>
          </div>
        </div>
      </div>
      <Link to="/flash-sale/current" className="btn btn-gold btn-lg">
        <i className="bi bi-lightning-charge-fill"></i> Shop Now
      </Link>
    </div>
  )
}

// PromoStrip.jsx
export function PromoStrip() {
  const items = [
    { icon: 'bi-truck', text: 'Free Delivery over KES 2,000' },
    { icon: 'bi-shield-check', text: 'Secure Payments' },
    { icon: 'bi-arrow-counterclockwise', text: '7-Day Easy Returns' },
    { icon: 'bi-headset', text: '24/7 Customer Support' },
    { icon: 'bi-award', text: '100% Authentic Products' },
  ]
  return (
    <div className="promo-strip">
      {items.map((item, i) => (
        <div key={i} className="promo-strip-item">
          <i className={`bi ${item.icon}`}></i>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  )
}

// Newsletter.jsx
import { useState as useNewsState } from 'react'
export function Newsletter() {
  const [email, setEmail] = useNewsState('')
  const [sent, setSent] = useNewsState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) { setSent(true) }
  }

  return (
    <div className="newsletter">
      <h2>Join the GlamStore Family 💌</h2>
      <p>Subscribe for exclusive offers, beauty tips & new arrivals.</p>
      {sent ? (
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px 32px', borderRadius: 'var(--radius-full)', display: 'inline-block' }}>
          ✅ You're subscribed! Welcome to the glam squad.
        </div>
      ) : (
        <form className="newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="newsletter__input"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="newsletter__btn">
            Subscribe
          </button>
        </form>
      )}
    </div>
  )
}