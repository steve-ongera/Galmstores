import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import Toast from '../common/Toast'
import ScrollToTop from '../common/ScrollToTop'
import axios from 'axios'

const CATEGORY_ICONS = {
  skincare: 'bi-droplet-fill',
  hair: 'bi-scissors',
  earrings: 'bi-gem',
  stickons: 'bi-stars',
  handbags: 'bi-handbag-fill',
}

const CATEGORY_SUBS = {
  skincare: ['Moisturisers', 'Serums', 'SPF', 'Cleansers', 'Toners', 'Eye Cream'],
  hair: ['Wigs', 'Bundles', 'Frontals', 'Closures', 'Braids', 'Clip-ins'],
  earrings: ['Studs', 'Hoops', 'Drop', 'Huggie', 'Ear Cuffs', 'Clip-On'],
  stickons: ['Nail Art', 'Face Jewels', 'Body Stickers', 'Temp Tattoos', 'Rhinestones'],
  handbags: ['Tote', 'Clutch', 'Crossbody', 'Shoulder', 'Mini Bags', 'Backpacks'],
}

export default function Layout() {
  const { cart } = useCart()
  const { wishlist } = useWishlist()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQ, setSearchQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [userDropdown, setUserDropdown] = useState(false)
  const [categories, setCategories] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const userDropdownRef = useRef(null)
  const menuTimeoutRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch categories from API
  useEffect(() => {
    axios.get('/api/categories/')
      .then(res => {
        const data = Array.isArray(res.data?.results) ? res.data.results : (Array.isArray(res.data) ? res.data : [])
        setCategories(data.map(cat => ({
          label: cat.name,
          slug: cat.slug,
          category_type: cat.category_type,
          icon: CATEGORY_ICONS[cat.category_type] || 'bi-tag',
          sub: cat.subcategories?.map(s => s.name) || CATEGORY_SUBS[cat.category_type] || [],
        })))
      })
      .catch(() => {
        // Fallback to hardcoded if API fails
        setCategories([
          { label: 'Skin Care', slug: 'skincare', icon: 'bi-droplet-fill', sub: CATEGORY_SUBS.skincare },
          { label: 'Human Hair', slug: 'hair', icon: 'bi-scissors', sub: CATEGORY_SUBS.hair },
          { label: 'Earrings', slug: 'earrings', icon: 'bi-gem', sub: CATEGORY_SUBS.earrings },
          { label: 'Stick-Ons', slug: 'stickons', icon: 'bi-stars', sub: CATEGORY_SUBS.stickons },
          { label: 'Handbags', slug: 'handbags', icon: 'bi-handbag-fill', sub: CATEGORY_SUBS.handbags },
        ])
      })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchQ('')
      setSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserDropdown(false)
  }

  const handleMenuEnter = (slug) => {
    clearTimeout(menuTimeoutRef.current)
    setActiveMenu(slug)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 120)
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="container">
          <div className="topbar__inner">
            <div className="topbar__marquee">
              <span>✨ Free delivery on orders over KES 2,000 &nbsp;&nbsp;|&nbsp;&nbsp; 💅 New arrivals every week &nbsp;&nbsp;|&nbsp;&nbsp; 🌸 Use code GLAM10 for 10% off</span>
            </div>
            <div className="topbar__links">
              <Link to="/account">My Account</Link>
              <a href="#help">Help</a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`header${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <div className="header__inner">

            {/* Logo */}
            <Link to="/" className="header__logo">
              <div className="header__logo-mark">
                <i className="bi bi-stars"></i>
              </div>
              <div className="header__logo-text">Glam<span>Store</span></div>
            </Link>

            {/* Desktop Nav — single scrollable row */}
            <nav className="header__nav">
              <ul className="header__nav-list">
                {categories.map(cat => (
                  <li
                    key={cat.slug}
                    className="header__nav-item"
                    onMouseEnter={() => handleMenuEnter(cat.slug)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <NavLink
                      to={`/category/${cat.slug}`}
                      className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className={`bi ${cat.icon}`}></i>
                      <span>{cat.label}</span>
                      <i className="bi bi-chevron-down header__nav-chevron"></i>
                    </NavLink>
                    {activeMenu === cat.slug && cat.sub.length > 0 && (
                      <div
                        className="dropdown"
                        style={{ minWidth: 200 }}
                        onMouseEnter={() => handleMenuEnter(cat.slug)}
                        onMouseLeave={handleMenuLeave}
                      >
                        {cat.sub.map(s => (
                          <Link
                            key={s}
                            to={`/category/${cat.slug}?sub=${encodeURIComponent(s.toLowerCase())}`}
                            className="dropdown__item"
                          >
                            <i className={`bi ${cat.icon}`} style={{ fontSize: '0.8rem' }}></i>
                            {s}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                <li className="header__nav-item">
                  <NavLink
                    to="/flash-sale/current"
                    className={({ isActive }) => `header__nav-link header__nav-link--sale${isActive ? ' active' : ''}`}
                  >
                    <i className="bi bi-lightning-charge-fill"></i>
                    <span>Flash Sale</span>
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Desktop Search */}
            <div className="header__search header__search--desktop">
              <form onSubmit={handleSearch}>
                <input
                  className="header__search-input"
                  type="text"
                  placeholder="Search products..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
                <button type="submit" className="header__search-btn">
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="header__actions">
              {/* Mobile search toggle */}
              <button
                className="header__action-btn header__action-btn--mobile-search"
                onClick={() => setSearchOpen(!searchOpen)}
                title="Search"
              >
                <i className="bi bi-search"></i>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="header__action-btn" title="Wishlist">
                <i className="bi bi-heart"></i>
                {wishlist?.total_items > 0 && (
                  <span className="header__action-count">{wishlist.total_items}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="header__action-btn" title="Cart">
                <i className="bi bi-bag"></i>
                {cart?.item_count > 0 && (
                  <span className="header__action-count">{cart.item_count}</span>
                )}
              </Link>

              {/* User dropdown */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <button
                  className="header__action-btn"
                  onClick={() => setUserDropdown(!userDropdown)}
                  title="Account"
                >
                  <i className={`bi ${user ? 'bi-person-check-fill' : 'bi-person'}`}></i>
                </button>
                {userDropdown && (
                  <div className="dropdown header__user-dropdown">
                    {user ? (
                      <>
                        <div className="dropdown__user-info">
                          <div className="dropdown__avatar">
                            {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <p className="dropdown__user-name">{user.first_name || user.username}</p>
                            <p className="dropdown__user-email">{user.email}</p>
                          </div>
                        </div>
                        <div className="dropdown__divider" />
                        <Link to="/account" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-person"></i> My Account
                        </Link>
                        <Link to="/orders" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-bag-check"></i> My Orders
                        </Link>
                        <Link to="/wishlist" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-heart"></i> Wishlist
                        </Link>
                        <div className="dropdown__divider" />
                        <button
                          className="dropdown__item dropdown__item--danger"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right"></i> Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-box-arrow-in-right"></i> Sign In
                        </Link>
                        <Link to="/register" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-person-plus"></i> Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button className="header__mobile-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar (slides down) */}
        {searchOpen && (
          <div className="header__mobile-search">
            <div className="container">
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="header__search-input"
                  style={{ flex: 1, borderRadius: 'var(--radius-full)' }}
                  type="text"
                  placeholder="Search products..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer__header">
              <Link to="/" className="header__logo" onClick={() => setMobileOpen(false)}>
                <div className="header__logo-mark"><i className="bi bi-stars"></i></div>
                <div className="header__logo-text">Glam<span style={{ color: 'var(--clr-rose)' }}>Store</span></div>
              </Link>
              <button className="drawer__close" onClick={() => setMobileOpen(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* User info in drawer */}
            {user && (
              <div className="drawer__user">
                <div className="dropdown__avatar">{(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--clr-charcoal)' }}>{user.first_name || user.username}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>{user.email}</p>
                </div>
              </div>
            )}

            {/* Drawer Search */}
            <form onSubmit={handleSearch} className="drawer__search">
              <input
                className="form-control"
                placeholder="Search products..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
              />
            </form>

            {/* Nav Categories */}
            <p className="drawer__section-label">Categories</p>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="drawer__nav-item"
                onClick={() => setMobileOpen(false)}
              >
                <span className="drawer__nav-icon">
                  <i className={`bi ${cat.icon}`}></i>
                </span>
                <span>{cat.label}</span>
                <i className="bi bi-chevron-right drawer__nav-arrow"></i>
              </Link>
            ))}
            <Link
              to="/flash-sale/current"
              className="drawer__nav-item drawer__nav-item--sale"
              onClick={() => setMobileOpen(false)}
            >
              <span className="drawer__nav-icon">
                <i className="bi bi-lightning-charge-fill"></i>
              </span>
              <span>Flash Sale</span>
              <i className="bi bi-chevron-right drawer__nav-arrow"></i>
            </Link>

            {/* Drawer Footer Links */}
            <div className="drawer__divider" />
            <p className="drawer__section-label">Account</p>
            {user ? (
              <>
                <Link to="/account" className="drawer__nav-item" onClick={() => setMobileOpen(false)}>
                  <span className="drawer__nav-icon"><i className="bi bi-person"></i></span>
                  <span>My Account</span>
                </Link>
                <Link to="/orders" className="drawer__nav-item" onClick={() => setMobileOpen(false)}>
                  <span className="drawer__nav-icon"><i className="bi bi-bag-check"></i></span>
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="drawer__nav-item" onClick={() => setMobileOpen(false)}>
                  <span className="drawer__nav-icon"><i className="bi bi-heart"></i></span>
                  <span>Wishlist</span>
                </Link>
                <button
                  className="drawer__nav-item drawer__nav-item--danger"
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  <span className="drawer__nav-icon"><i className="bi bi-box-arrow-right"></i></span>
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="drawer__nav-item" onClick={() => setMobileOpen(false)}>
                  <span className="drawer__nav-icon"><i className="bi bi-box-arrow-in-right"></i></span>
                  <span>Sign In</span>
                </Link>
                <Link to="/register" className="drawer__nav-item" onClick={() => setMobileOpen(false)}>
                  <span className="drawer__nav-icon"><i className="bi bi-person-plus"></i></span>
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>

      <Footer categories={categories} />
      <Toast />
      <ScrollToTop />
    </>
  )
}

function Footer({ categories }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="header__logo mb-md">
              <div className="header__logo-mark"><i className="bi bi-stars"></i></div>
              <div className="header__logo-text" style={{ color: 'white' }}>Glam<span>Store</span></div>
            </div>
            <p className="footer__brand-text">
              Your one-stop beauty destination for premium skin care, human hair, earrings, stick-ons & handbags. Looking good is your birthright.
            </p>
            <div className="footer__social">
              {[['bi-instagram', '#'], ['bi-tiktok', '#'], ['bi-facebook', '#'], ['bi-twitter-x', '#']].map(([icon, href]) => (
                <a key={icon} href={href} className="footer__social-btn"><i className={`bi ${icon}`}></i></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer__heading">Categories</h4>
            <div className="footer__links">
              {categories.length > 0
                ? categories.map(cat => (
                    <Link key={cat.slug} to={`/category/${cat.slug}`} className="footer__link">{cat.label}</Link>
                  ))
                : [['Skin Care', 'skincare'], ['Human Hair', 'hair'], ['Earrings', 'earrings'], ['Stick-Ons', 'stickons'], ['Handbags', 'handbags']].map(([l, s]) => (
                    <Link key={s} to={`/category/${s}`} className="footer__link">{l}</Link>
                  ))
              }
            </div>
          </div>
          <div>
            <h4 className="footer__heading">My Account</h4>
            <div className="footer__links">
              {[['My Profile', '/account'], ['My Orders', '/orders'], ['Wishlist', '/wishlist'], ['Track Order', '/orders'], ['Returns', '#']].map(([l, h]) => (
                <Link key={l} to={h} className="footer__link">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer__heading">Help & Info</h4>
            <div className="footer__links">
              {[['About Us', '#'], ['Contact Us', '#'], ['FAQ', '#'], ['Shipping Policy', '#'], ['Privacy Policy', '#']].map(([l, h]) => (
                <a key={l} href={h} className="footer__link">{l}</a>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginBottom: 'var(--space-sm)' }}>📞 +254 700 000 000</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>✉️ hello@glamstore.co.ke</p>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© 2025 GlamStore. All rights reserved.</span>
          <div className="footer__payments">
            {['M-Pesa', 'PayPal', 'Visa', 'Mastercard'].map(p => (
              <span key={p} className="footer__payment-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}