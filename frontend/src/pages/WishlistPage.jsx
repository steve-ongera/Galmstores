// WishlistPage.jsx
import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/product/ProductCard'
import { EmptyState, Breadcrumb } from '../components/common/Toast'

export default function WishlistPage() {
  const { wishlist } = useWishlist()

  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'My Wishlist' }]} />
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>My Wishlist <span style={{ color: 'var(--clr-muted)', fontSize: '1.2rem' }}>({wishlist.total_items})</span></h1>
      {wishlist.items.length === 0 ? (
        <EmptyState icon="bi-heart" title="Your wishlist is empty" description="Save your favourite items and shop later!" action={<Link to="/products" className="btn btn-primary">Browse Products</Link>} />
      ) : (
        <div className="grid-products">
          {wishlist.items.map(item => item.product && <ProductCard key={item.id} product={item.product} />)}
        </div>
      )}
    </div>
  )
}