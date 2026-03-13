// CategoryPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { categoriesAPI, productsAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { SkeletonCard, SectionHeader, Pagination, Breadcrumb, EmptyState } from '../components/common/Toast'

export function CategoryPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    categoriesAPI.detail(slug).then(setCategory)
    setLoading(true)
    productsAPI.list({ category__slug: slug, page }).then(data => {
      setProducts(data.results || data)
      setTotal(data.count || (data.results || data).length)
    }).finally(() => setLoading(false))
  }, [slug, page])

  const ICONS = { skincare: '🌸', hair: '✨', earrings: '💎', stickons: '⭐', handbags: '👜' }

  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: category?.name || slug }]} />
      {category && (
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)', padding: 'var(--space-2xl)', background: 'linear-gradient(135deg, var(--clr-rose-pale), var(--clr-gold-pale))', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>{ICONS[slug] || '✨'}</div>
          <h1>{category.name}</h1>
          {category.description && <p style={{ maxWidth: 500, margin: '8px auto 0' }}>{category.description}</p>}
        </div>
      )}
      <div className="grid-products">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : products.length === 0
            ? <div style={{ gridColumn: '1 / -1' }}><EmptyState icon="bi-inbox" title="No products found" description="Check back soon for new arrivals!" /></div>
            : products.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>
      <Pagination currentPage={page} totalPages={Math.ceil(total / 20)} onPageChange={setPage} />
    </div>
  )
}
export default CategoryPage