import { useState, useEffect } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import Toast from '../common/Toast'
import ScrollToTop from '../common/ScrollToTop'

const CATEGORIES = [
  { label: 'Skin Care', slug: 'skincare', icon: 'bi-droplet-fill', sub: ['Moisturisers', 'Serums', 'SPF', 'Cleansers', 'Toners', 'Eye Cream'] },
  { label: 'Human Hair', slug: 'hair', icon: 'bi-scissors', sub: ['Wigs', 'Bundles', 'Frontals', 'Closures', 'Braids', 'Clip-ins'] },
  { label: 'Earrings', slug: 'earrings', icon: 'bi-gem', sub: ['Studs', 'Hoops', 'Drop', 'Huggie', 'Ear Cuffs', 'Clip-On'] },
  { label: 'Stick-Ons', slug: 'stickons', icon: 'bi-stars', sub: ['Nail Art', 'Face Jewels', 'Body Stickers', 'Temp Tattoos', 'Rhinestones'] },
  { label: 'Handbags', slug: 'handbags', icon: 'bi-handbag-fill', sub: ['Tote', 'Clutch', 'Crossbody', 'Shoulder', 'Mini Bags', 'Backpacks'] },
]

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`)
      setSearchQ('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setUserDropdown(false)
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

            {/* Desktop Nav */}
            <nav className="header__nav">
              <ul className="header__nav-list">
                {CATEGORIES.map(cat => (
                  <li
                    key={cat.slug}
                    className="header__nav-item"
                    onMouseEnter={() => setActiveMenu(cat.slug)}
                    onMouseLeave={() => setActiveMenu(null)}
                  >
                    <NavLink
                      to={`/category/${cat.slug}`}
                      className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`}
                    >
                      <i className={`bi ${cat.icon}`}></i>
                      {cat.label}
                      <i className="bi bi-chevron-down" style={{ fontSize: '0.65rem' }}></i>
                    </NavLink>
                    {activeMenu === cat.slug && (
                      <div className="dropdown" style={{ minWidth: 200 }}>
                        {cat.sub.map(s => (
                          <Link
                            key={s}
                            to={`/category/${cat.slug}?sub=${encodeURIComponent(s.toLowerCase())}`}
                            className="dropdown__item"
                          >
                            <i className={`bi ${cat.icon}`} style={{ fontSize: '0.85rem' }}></i>
                            {s}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                <li>
                  <NavLink to="/flash-sale/current" className={({ isActive }) => `header__nav-link${isActive ? ' active' : ''}`} style={{ color: 'var(--clr-rose)', fontWeight: 700 }}>
                    <i className="bi bi-lightning-charge-fill"></i>
                    Flash Sale
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Search */}
            <div className="header__search">
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
              {/* Wishlist */}
              <Link to="/wishlist" className="header__action-btn" title="Wishlist">
                <i className="bi bi-heart"></i>
                {wishlist.total_items > 0 && (
                  <span className="header__action-count">{wishlist.total_items}</span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="header__action-btn" title="Cart">
                <i className="bi bi-bag"></i>
                {cart.item_count > 0 && (
                  <span className="header__action-count">{cart.item_count}</span>
                )}
              </Link>

              {/* User */}
              <div style={{ position: 'relative' }}>
                <button
                  className="header__action-btn"
                  onClick={() => setUserDropdown(!userDropdown)}
                  title="Account"
                >
                  <i className={`bi ${user ? 'bi-person-check' : 'bi-person'}`}></i>
                </button>
                {userDropdown && (
                  <div className="dropdown" style={{ right: 0, left: 'auto' }}>
                    {user ? (
                      <>
                        <div className="dropdown__item" style={{ cursor: 'default', fontWeight: 600 }}>
                          <i className="bi bi-person-circle"></i>
                          {user.first_name || user.username}
                        </div>
                        <Link to="/account" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-person"></i> My Account
                        </Link>
                        <Link to="/orders" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-bag-check"></i> My Orders
                        </Link>
                        <Link to="/wishlist" className="dropdown__item" onClick={() => setUserDropdown(false)}>
                          <i className="bi bi-heart"></i> Wishlist
                        </Link>
                        <button className="dropdown__item" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', color: 'var(--clr-error)' }} onClick={handleLogout}>
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

              {/* Mobile menu */}
              <button className="header__mobile-btn" onClick={() => setMobileOpen(true)}>
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="flex-between mb-lg">
              <Link to="/" className="header__logo" onClick={() => setMobileOpen(false)}>
                <div className="header__logo-mark"><i className="bi bi-stars"></i></div>
                <div className="header__logo-text">Glam<span style={{ color: 'var(--clr-rose)' }}>Store</span></div>
              </Link>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <form onSubmit={handleSearch} className="mb-lg">
              <div style={{ position: 'relative' }}>
                <input
                  className="form-control"
                  placeholder="Search..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
            </form>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="dropdown__item"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '12px 0', borderBottom: '1px solid var(--clr-border)' }}
              >
                <i className={`bi ${cat.icon}`}></i> {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
      <Toast />
      <ScrollToTop />
    </>
  )
}

function Footer() {
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
              {[['bi-instagram','#'],['bi-tiktok','#'],['bi-facebook','#'],['bi-twitter-x','#']].map(([icon, href]) => (
                <a key={icon} href={href} className="footer__social-btn"><i className={`bi ${icon}`}></i></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer__heading">Categories</h4>
            <div className="footer__links">
              {[['Skin Care','skincare'],['Human Hair','hair'],['Earrings','earrings'],['Stick-Ons','stickons'],['Handbags','handbags']].map(([l,s]) => (
                <Link key={s} to={`/category/${s}`} className="footer__link">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer__heading">My Account</h4>
            <div className="footer__links">
              {[['My Profile','/account'],['My Orders','/orders'],['Wishlist','/wishlist'],['Track Order','/orders'],['Returns','#']].map(([l,h]) => (
                <Link key={l} to={h} className="footer__link">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer__heading">Help & Info</h4>
            <div className="footer__links">
              {[['About Us','#'],['Contact Us','#'],['FAQ','#'],['Shipping Policy','#'],['Privacy Policy','#']].map(([l,h]) => (
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
            {['M-Pesa','PayPal','Visa','Mastercard'].map(p => (
              <span key={p} className="footer__payment-badge">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}