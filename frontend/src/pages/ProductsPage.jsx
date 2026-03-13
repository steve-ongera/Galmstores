import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import { SkeletonCard, Pagination, EmptyState, SectionHeader } from '../components/common/Toast'
import { Breadcrumb } from '../components/common/Toast'
import { productsAPI, categoriesAPI } from '../services/api'

const SORT_OPTIONS = [
  { label: 'Latest', value: '-created_at' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-average_rating' },
  { label: 'Most Popular', value: '-total_sold' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [view, setView] = useState('grid')

  const selectedCats = searchParams.getAll('cat')
  const sort = searchParams.get('sort') || '-created_at'
  const minPrice = searchParams.get('min') || ''
  const maxPrice = searchParams.get('max') || ''
  const featured = searchParams.get('featured')
  const bestseller = searchParams.get('bestseller')

  useEffect(() => {
    categoriesAPI.list().then(data => setCategories(data.results || data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {
      page: currentPage,
      ordering: sort,
      ...(selectedCats.length && { category__slug: selectedCats.join(',') }),
      ...(minPrice && { price__gte: minPrice }),
      ...(maxPrice && { price__lte: maxPrice }),
      ...(featured && { is_featured: true }),
      ...(bestseller && { is_bestseller: true }),
    }
    productsAPI.list(params)
      .then(data => {
        setProducts(data.results || data)
        setTotalCount(data.count || (data.results || data).length)
      })
      .finally(() => setLoading(false))
  }, [searchParams, currentPage])

  const toggleCat = (slug) => {
    const newParams = new URLSearchParams(searchParams)
    const cats = newParams.getAll('cat')
    if (cats.includes(slug)) {
      newParams.delete('cat')
      cats.filter(c => c !== slug).forEach(c => newParams.append('cat', c))
    } else {
      newParams.append('cat', slug)
    }
    setSearchParams(newParams)
    setCurrentPage(1)
  }

  const setSort = (val) => {
    const p = new URLSearchParams(searchParams)
    p.set('sort', val)
    setSearchParams(p)
  }

  return (
    <div className="container section-sm">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'All Products' }]} />
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>All Products</h1>

      <div className="shop-layout">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="flex-between mb-lg">
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)' }}>Filters</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSearchParams({}); setCurrentPage(1) }}
            >
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div className="filter-group">
            <h4>Category</h4>
            {categories.map(cat => (
              <label key={cat.slug} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.slug)}
                  onChange={() => toggleCat(cat.slug)}
                />
                {cat.name}
                <span style={{ marginLeft: 'auto', color: 'var(--clr-muted)', fontSize: '0.75rem' }}>
                  ({cat.product_count})
                </span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <h4>Price Range (KES)</h4>
            <div className="price-range">
              <input
                type="number"
                className="form-control"
                placeholder="Min"
                value={minPrice}
                onChange={e => {
                  const p = new URLSearchParams(searchParams)
                  p.set('min', e.target.value)
                  setSearchParams(p)
                }}
                style={{ padding: '8px 12px' }}
              />
              <span style={{ color: 'var(--clr-muted)' }}>—</span>
              <input
                type="number"
                className="form-control"
                placeholder="Max"
                value={maxPrice}
                onChange={e => {
                  const p = new URLSearchParams(searchParams)
                  p.set('max', e.target.value)
                  setSearchParams(p)
                }}
                style={{ padding: '8px 12px' }}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="filter-group">
            <h4>Quick Filters</h4>
            {[
              { label: '⭐ Featured', key: 'featured', val: 'true' },
              { label: '🔥 Bestsellers', key: 'bestseller', val: 'true' },
              { label: '✨ New Arrivals', key: 'new', val: 'true' },
            ].map(f => (
              <label key={f.key} className="filter-item">
                <input
                  type="checkbox"
                  checked={searchParams.get(f.key) === f.val}
                  onChange={() => {
                    const p = new URLSearchParams(searchParams)
                    if (p.get(f.key)) p.delete(f.key)
                    else p.set(f.key, f.val)
                    setSearchParams(p)
                  }}
                />
                {f.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <div>
          {/* Sort Bar */}
          <div className="sort-bar">
            <span className="sort-bar__count">
              {loading ? '...' : `${totalCount} products`}
            </span>
            <div className="sort-bar__right">
              <select
                className="form-control form-select"
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ width: 'auto', padding: '8px 36px 8px 12px' }}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="sort-bar__view-btns">
                {[['grid', 'bi-grid-3x3-gap'], ['list', 'bi-list-ul']].map(([v, icon]) => (
                  <button key={v} className={`sort-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                    <i className={`bi ${icon}`}></i>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid-products">
              {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title="No products found"
              description="Try adjusting your filters or search for something else."
              action={<button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear Filters</button>}
            />
          ) : (
            <div className={view === 'grid' ? 'grid-products' : 'flex-col'} style={view === 'list' ? { display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' } : {}}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / 20)}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}