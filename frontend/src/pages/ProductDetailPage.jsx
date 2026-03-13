// ProductDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../components/common/Toast'
import { Stars, Breadcrumb, SectionHeader, SkeletonCard } from '../components/common/Toast'
import ProductCard from '../components/product/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [activeTab, setActiveTab] = useState('description')
  const { addItem } = useCart()
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist()
  const toast = useToast()

  useEffect(() => {
    setLoading(true)
    productsAPI.detail(slug).then(data => {
      setProduct(data)
      productsAPI.list({ category__slug: data.category?.slug, page: 1 })
        .then(r => setRelated((r.results || r).filter(p => p.slug !== slug).slice(0, 4)))
    }).finally(() => setLoading(false))
  }, [slug])

  if (loading || !product) return (
    <div className="container section-sm">
      <div className="grid-2" style={{ gap: 'var(--space-2xl)' }}>
        <div className="skeleton" style={{ aspectRatio: 1, borderRadius: 'var(--radius-xl)' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: i === 2 ? 48 : 16, width: i % 2 ? '70%' : '100%' }}></div>
          ))}
        </div>
      </div>
    </div>
  )

  const images = product.images || []
  const wishlisted = isWishlisted(product.id)
  const variantGroups = (product.variants || []).reduce((acc, v) => {
    acc[v.name] = acc[v.name] || []
    acc[v.name].push(v)
    return acc
  }, {})

  const handleAddToCart = async () => {
    const ok = await addItem(product.id, qty)
    toast[ok ? 'success' : 'error'](ok ? `${product.name} added to cart!` : 'Failed to add to cart')
  }

  return (
    <div className="container section-sm">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: product.category?.name || 'Products', href: `/category/${product.category?.slug}` },
        { label: product.name }
      ]} />

      <div className="product-detail">
        {/* Gallery */}
        <div className="product-detail__gallery">
          {images.length > 0 ? (
            <img src={images[mainImg]?.image} alt={product.name} className="product-detail__main-img" />
          ) : (
            <div className="product-detail__main-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-rose-pale)', fontSize: '5rem' }}>
              🌸
            </div>
          )}
          <div className="product-detail__thumbs">
            {images.map((img, i) => (
              <button key={i} className={`product-detail__thumb${mainImg === i ? ' active' : ''}`} onClick={() => setMainImg(i)}>
                <img src={img.image} alt={`Thumb ${i}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-sm)' }}>
            {product.is_new_arrival && <span className="badge badge-rose">New Arrival</span>}
            {product.is_bestseller && <span className="badge badge-gold">Bestseller</span>}
            {product.is_in_stock
              ? <span className="badge badge-success"><i className="bi bi-check-circle"></i> In Stock</span>
              : <span className="badge badge-error"><i className="bi bi-x-circle"></i> Out of Stock</span>
            }
          </div>

          <p style={{ color: 'var(--clr-rose)', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
            {product.category?.name}
          </p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 'var(--space-md)' }}>{product.name}</h1>

          {product.average_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
              <Stars rating={product.average_rating} />
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-muted)' }}>
                {product.average_rating} ({product.total_reviews} reviews)
              </span>
              <span style={{ color: 'var(--clr-border)' }}>·</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-muted)' }}>{product.total_sold} sold</span>
            </div>
          )}

          {/* Price */}
          <div className="product-detail__price-row">
            <span className="product-detail__price">KES {Number(product.price).toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="product-detail__compare">KES {Number(product.compare_at_price).toLocaleString()}</span>
            )}
            {product.discount_percentage > 0 && (
              <span className="product-detail__discount">{product.discount_percentage}% OFF</span>
            )}
          </div>

          <p style={{ marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>{product.short_description}</p>

          {/* Variants */}
          {Object.entries(variantGroups).map(([name, variants]) => (
            <div key={name} className="variant-group">
              <div className="variant-group__label">{name}:
                <strong style={{ marginLeft: 8, color: 'var(--clr-charcoal)' }}>
                  {selectedVariants[name] || 'Select'}
                </strong>
              </div>
              <div className="variant-options">
                {variants.map(v => (
                  <button
                    key={v.id}
                    className={`variant-btn${selectedVariants[name] === v.value ? ' active' : ''}`}
                    onClick={() => setSelectedVariants(s => ({ ...s, [name]: v.value }))}
                    disabled={v.stock === 0}
                  >
                    {v.value}
                    {v.price_modifier > 0 && <span style={{ fontSize: '0.7rem', marginLeft: 4 }}>+KES {v.price_modifier}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="qty-control">
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Quantity:</span>
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
              <i className="bi bi-dash"></i>
            </button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>
              <i className="bi bi-plus"></i>
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--clr-muted)' }}>{product.stock} available</span>
          </div>

          {/* CTA */}
          <div className="product-detail__cta">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={!product.is_in_stock} style={{ flex: 1 }}>
              <i className="bi bi-bag-plus"></i> Add to Bag
            </button>
            <button
              className={`btn ${wishlisted ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id)}
              title="Wishlist"
            >
              <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
          </div>

          {/* Trust */}
          <div className="product-trust">
            {[
              ['bi-shield-check', 'Authentic Product'],
              ['bi-truck', 'Fast Delivery'],
              ['bi-arrow-counterclockwise', '7-Day Returns'],
            ].map(([icon, label]) => (
              <div key={label} className="trust-item">
                <i className={`bi ${icon}`}></i>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Details, Reviews */}
      <div className="section-sm">
        <div className="tabs">
          {['description', 'details', 'reviews'].map(tab => (
            <button key={tab} className={`tab-btn${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'reviews' && ` (${product.total_reviews})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div style={{ maxWidth: 720 }}>
            <p style={{ lineHeight: 1.8 }}>{product.description}</p>
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ maxWidth: 600 }}>
            {/* Category specific details */}
            {product.skincare_details && <SkincareDetails d={product.skincare_details} />}
            {product.hair_details && <HairDetails d={product.hair_details} />}
            {product.earring_details && <EarringDetails d={product.earring_details} />}
            {product.stickon_details && <StickonDetails d={product.stickon_details} />}
            {product.handbag_details && <HandbagDetails d={product.handbag_details} />}
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['SKU', product.sku], ['Weight', product.weight ? `${product.weight}g` : '—'], ['Brand', product.brand?.name || '—']].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</dt>
                  <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 720 }}>
            {(product.reviews || []).length === 0 ? (
              <p style={{ color: 'var(--clr-muted)' }}>No reviews yet. Be the first to review!</p>
            ) : (
              product.reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-card__header">
                    <div className="review-card__avatar">{r.username?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="review-card__name">{r.username}</div>
                      <div className="review-card__date">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <Stars rating={r.rating} />
                    {r.is_verified_purchase && (
                      <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                        <i className="bi bi-check2"></i> Verified
                      </span>
                    )}
                  </div>
                  <h5 style={{ marginBottom: 4 }}>{r.title}</h5>
                  <p style={{ fontSize: '0.875rem' }}>{r.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section">
          <SectionHeader title="You May Also Like" />
          <div className="grid-products">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function SkincareDetails({ d }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[
        ['Skin Type', d.skin_type], ['Volume', d.volume_ml ? `${d.volume_ml}ml` : '—'],
        ['SPF', d.spf || '—'], ['Vegan', d.is_vegan ? '✅ Yes' : '❌ No'],
        ['Cruelty Free', d.is_cruelty_free ? '✅ Yes' : '❌ No'],
        ['Fragrance Free', d.is_fragrance_free ? '✅ Yes' : '❌ No'],
      ].map(([k, v]) => v && (
        <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{k}</dt>
          <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
function HairDetails({ d }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[['Type', d.hair_type], ['Texture', d.texture], ['Length', d.length_inches ? `${d.length_inches}"` : '—'], ['Origin', d.origin], ['Density', d.density], ['Color', d.color]].map(([k, v]) => v && (
        <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{k}</dt>
          <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
function EarringDetails({ d }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[['Type', d.earring_type], ['Material', d.material], ['Gemstone', d.gemstone], ['Hypoallergenic', d.is_hypoallergenic ? '✅' : '❌'], ['Waterproof', d.is_waterproof ? '✅' : '❌'], ['Closure', d.closure_type]].map(([k, v]) => v && (
        <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{k}</dt>
          <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
function StickonDetails({ d }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[['Type', d.stickon_type], ['Pieces/Pack', d.pieces_per_pack], ['Duration', d.duration_hours ? `${d.duration_hours}hrs` : '—'], ['Reusable', d.is_reusable ? '✅' : '❌'], ['Waterproof', d.is_waterproof ? '✅' : '❌']].map(([k, v]) => v && (
        <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{k}</dt>
          <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}
function HandbagDetails({ d }) {
  return (
    <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
      {[['Type', d.bag_type], ['Material', d.material], ['Color', d.color], ['Closure', d.closure_type], ['Pockets', d.number_of_pockets], ['Waterproof', d.is_waterproof ? '✅' : '❌']].map(([k, v]) => v && (
        <div key={k} style={{ background: 'var(--clr-ivory-dark)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
          <dt style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{k}</dt>
          <dd style={{ fontWeight: 600, marginTop: 2 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}