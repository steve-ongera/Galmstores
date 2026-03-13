import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import HeroBanner from '../components/common/HeroBanner'
import { CategoryPills, FlashSaleTimer, PromoStrip, Newsletter } from '../components/common/Widgets'
import { SectionHeader, SkeletonCard } from '../components/common/Toast'
import ProductCard from '../components/product/ProductCard'
import { productsAPI, flashSalesAPI } from '../services/api'

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [flashSale, setFlashSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productsAPI.featured(),
      productsAPI.bestsellers(),
      productsAPI.newArrivals(),
      flashSalesAPI.list(),
    ]).then(([f, b, n, fs]) => {
      setFeatured(f.results || f)
      setBestsellers(b.results || b)
      setNewArrivals(n.results || n)
      setFlashSale((fs.results || fs)[0] || null)
    }).finally(() => setLoading(false))
  }, [])

  const CATEGORY_SHOWCASE = [
    { label: 'Skin Care', slug: 'skincare', icon: 'bi-droplet-fill', color: '#fce8ef', emoji: '🌸', desc: 'Glow up with premium serums, moisturisers & more' },
    { label: 'Human Hair', slug: 'hair', icon: 'bi-scissors', color: '#f5ede6', emoji: '✨', desc: 'Virgin & remy hair bundles for every style' },
    { label: 'Earrings', slug: 'earrings', icon: 'bi-gem', color: '#fdf6e3', emoji: '💎', desc: 'Studs, hoops, drops & statement pieces' },
    { label: 'Stick-Ons', slug: 'stickons', icon: 'bi-stars', color: '#fce8ef', emoji: '⭐', desc: 'Nail art, face jewels, body stickers & more' },
    { label: 'Handbags', slug: 'handbags', icon: 'bi-handbag-fill', color: '#f5ede6', emoji: '👜', desc: 'Totes, clutches, crossbody & mini bags' },
  ]

  return (
    <>
      <div className="container">
        {/* Hero */}
        <HeroBanner />

        {/* Promo Strip */}
        <div className="section-sm">
          <PromoStrip />
        </div>

        {/* Category Showcase */}
        <section className="section-sm">
          <SectionHeader title="Shop by Category" />
          <div className="grid-products" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {CATEGORY_SHOWCASE.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="card"
                style={{ textAlign: 'center', padding: 'var(--space-xl)', background: cat.color, border: 'none' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>{cat.emoji}</div>
                <h4 style={{ marginBottom: 4 }}>{cat.label}</h4>
                <p style={{ fontSize: '0.8rem' }}>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="section">
          <SectionHeader title="Featured Products" linkTo="/products?featured=true" />
          <div className="grid-products">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Flash Sale */}
        {flashSale && (
          <section className="section-sm">
            <FlashSaleTimer
              endTime={flashSale.end_time}
              title={flashSale.title}
              discount={flashSale.discount_percentage}
            />
            {flashSale.products?.length > 0 && (
              <div className="grid-products mt-xl">
                {flashSale.products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        )}

        {/* Bestsellers */}
        <section className="section">
          <SectionHeader title="Bestsellers" linkTo="/products?bestseller=true" />
          <div className="grid-products">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : bestsellers.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* New Arrivals */}
        <section className="section">
          <SectionHeader title="New Arrivals" linkTo="/products?new=true" />
          <div className="grid-products">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Why GlamStore */}
        <section className="section-sm">
          <div style={{
            background: 'linear-gradient(135deg, var(--clr-rose-pale), var(--clr-gold-pale))',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-2xl)',
          }}>
            <h2 className="text-center mb-xl">Why Choose GlamStore?</h2>
            <div className="grid-4" style={{ gap: 'var(--space-xl)' }}>
              {[
                { icon: 'bi-award', title: '100% Authentic', desc: 'Every product is sourced from verified suppliers' },
                { icon: 'bi-truck', title: 'Fast Delivery', desc: 'Same day delivery in Nairobi, nationwide in 2-3 days' },
                { icon: 'bi-shield-lock', title: 'Secure Checkout', desc: 'Pay via M-Pesa or PayPal with full security' },
                { icon: 'bi-arrow-counterclockwise', title: 'Easy Returns', desc: '7-day hassle-free return policy' },
              ].map((item, i) => (
                <div key={i} className="trust-item" style={{ background: 'white', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{
                    width: 56, height: 56,
                    background: 'var(--clr-rose-pale)',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <i className={`bi ${item.icon}`} style={{ fontSize: '1.5rem', color: 'var(--clr-rose)' }}></i>
                  </div>
                  <h4 style={{ marginBottom: 8 }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="section-sm">
          <Newsletter />
        </section>
      </div>
    </>
  )
}