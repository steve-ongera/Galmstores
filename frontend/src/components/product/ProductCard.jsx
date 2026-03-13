import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useToast } from '../common/Toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist()
  const toast = useToast()
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    const ok = await addItem(product.id, 1)
    if (ok) toast.success(`${product.name} added to cart!`)
    else toast.error('Could not add to cart')
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (wishlisted) {
      await removeFromWishlist(product.id)
      toast.info('Removed from wishlist')
    } else {
      const ok = await addToWishlist(product.id)
      if (ok) toast.success('Added to wishlist!')
      else toast.error('Sign in to save to wishlist')
    }
  }

  return (
    <Link to={`/products/${product.slug}`} className="product-card" style={{ display: 'block' }}>
      <div className="product-card__img-wrap">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="product-card__img"
            loading="lazy"
          />
        ) : (
          <div className="product-card__img" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--clr-rose-pale)', color: 'var(--clr-rose)', fontSize: '3rem'
          }}>
            <i className="bi bi-image"></i>
          </div>
        )}

        {/* Badges */}
        <div className="product-card__badges">
          {product.discount_percentage > 0 && (
            <span className="badge badge-sale">-{product.discount_percentage}%</span>
          )}
          {product.is_new_arrival && (
            <span className="badge badge-rose">New</span>
          )}
          {product.is_bestseller && (
            <span className="badge badge-gold">Best</span>
          )}
          {!product.is_in_stock && (
            <span className="badge" style={{ background: '#e0e0e0', color: '#888' }}>Sold Out</span>
          )}
        </div>

        {/* Quick actions */}
        <div className="product-card__actions">
          <button
            className={`product-card__action-btn${wishlisted ? ' active' : ''}`}
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <i className={`bi ${wishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
          <button
            className="product-card__action-btn"
            onClick={(e) => { e.preventDefault(); /* quick view */ }}
            title="Quick view"
          >
            <i className="bi bi-eye"></i>
          </button>
        </div>
      </div>

      <div className="product-card__body">
        <div className="product-card__category">{product.category_name}</div>
        <div className="product-card__name">{product.name}</div>

        {/* Rating */}
        {product.average_rating > 0 && (
          <div className="product-card__rating">
            <div className="product-card__stars">
              {[1,2,3,4,5].map(i => (
                <i key={i} className={`bi ${i <= Math.round(product.average_rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
              ))}
            </div>
            <span className="product-card__rating-count">({product.total_reviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="product-card__price">
          <span className="product-card__price-current">
            KES {Number(product.price).toLocaleString()}
          </span>
          {product.compare_at_price && (
            <span className="product-card__price-original">
              KES {Number(product.compare_at_price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {product.is_in_stock ? (
          <button className="product-card__add-btn" onClick={handleAddToCart}>
            <i className="bi bi-bag-plus"></i> Add to Bag
          </button>
        ) : (
          <button className="product-card__out-of-stock" disabled>
            <i className="bi bi-x-circle"></i> Out of Stock
          </button>
        )}
      </div>
    </Link>
  )
}