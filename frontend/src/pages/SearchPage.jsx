// SearchPage.jsx
import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { EmptyState } from '../components/common/Toast'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    productsAPI.search(q).then(d => setResults(d.results || [])).finally(() => setLoading(false))
  }, [q])

  return (
    <div className="container section-sm">
      <h1 style={{ marginBottom: 'var(--space-md)' }}>Search: <em style={{ color: 'var(--clr-rose)' }}>"{q}"</em></h1>
      <p style={{ marginBottom: 'var(--space-xl)' }}>{loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}</p>
      {results.length > 0 ? (
        <div className="grid-products">{results.map(p => <ProductCard key={p.id} product={p} />)}</div>
      ) : !loading && (
        <EmptyState icon="bi-search" title="No results found" description={`We couldn't find anything matching "${q}"`} action={<Link to="/products" className="btn btn-primary">Browse All Products</Link>} />
      )}
    </div>
  )
}