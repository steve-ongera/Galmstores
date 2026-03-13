// Toast.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ToastContext = createContext(null)

// ─── useToast hook ─────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext)
  return {
    success: (msg) => ctx?.add(msg, 'success'),
    error:   (msg) => ctx?.add(msg, 'error'),
    info:    (msg) => ctx?.add(msg, 'info'),
  }
}

// ─── ToastProvider ─────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])
  const add = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => remove(id), 3500)
  }, [remove])
  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <ToastDisplay toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  )
}

// ─── Internal display component (always inside provider) ───────────────────────
function ToastDisplay({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => remove(t.id)}>
          <i className={`bi ${t.type === 'success' ? 'bi-check-circle-fill' : t.type === 'error' ? 'bi-x-circle-fill' : 'bi-info-circle-fill'}`}></i>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Toast export (no longer needs context — ToastProvider handles rendering) ──
export function Toast() { return null }
export default Toast

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: 1 }}></div>
      <div style={{ padding: 'var(--space-md)' }}>
        <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }}></div>
        <div className="skeleton" style={{ height: 14, marginBottom: 8 }}></div>
        <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 12 }}></div>
        <div className="skeleton" style={{ height: 18, width: '40%', marginBottom: 12 }}></div>
        <div className="skeleton" style={{ height: 38, borderRadius: 8 }}></div>
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: i === lines - 1 ? '60%' : '100%' }}></div>
      ))}
    </div>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
  return (
    <div className="pagination">
      <button className="page-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <i className="bi bi-chevron-left"></i>
      </button>
      {pages.map(p => (
        <button key={p} className={`page-btn${p === currentPage ? ' active' : ''}`} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      <button className="page-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  )
}

// ─── Stars ─────────────────────────────────────────────────────────────────────
export function Stars({ rating, size = '0.9rem' }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi ${i <= Math.round(rating) ? 'bi-star-fill star' : 'bi-star star empty'}`} style={{ fontSize: size }}></i>
      ))}
    </div>
  )
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex" style={{ alignItems: 'center', gap: 4 }}>
          {i > 0 && <i className="bi bi-chevron-right breadcrumb__sep" style={{ fontSize: '0.7rem' }}></i>}
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span className="breadcrumb__current">{item.label}</span>}
        </span>
      ))}
    </nav>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'bi-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><i className={`bi ${icon}`}></i></div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

// ─── Scroll To Top ─────────────────────────────────────────────────────────────
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      className={`scroll-top${visible ? ' visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <i className="bi bi-arrow-up"></i>
    </button>
  )
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}>
      <div style={{ width: size, height: size, border: '3px solid var(--clr-rose-pale)', borderTopColor: 'var(--clr-rose)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, linkTo, linkLabel = 'View All' }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {linkTo && <Link to={linkTo} className="section-link">{linkLabel} <i className="bi bi-arrow-right"></i></Link>}
    </div>
  )
}