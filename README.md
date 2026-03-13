# 🌸 GlamStore — Beauty & Fashion E-Commerce

> A full-stack e-commerce platform for **Skin Care, Human Hair, Earrings, Stick-Ons & Handbags**.
> Built with **Django REST Framework** (backend) + **React + Vite** (frontend).
> Payments via **M-Pesa STK Push** and **PayPal**.

---

## 📁 Project Structure

```
glam-store/
│
├── backend/                          # Django backend
│   │
│   ├── glam_store/                   # Django project config
│   │   ├── settings.py               # Full settings (DB, JWT, CORS, M-Pesa, PayPal, Email)
│   │   └── urls.py                   # Root URL conf → api/products/, api/orders/, api/payments/, api/auth/
│   │
│   ├── products/                     # Products app
│   │   ├── models.py                 # Category, SubCategory, Brand, Product, ProductImage,
│   │   │                             #   ProductVariant, SkincareProduct, HairProduct,
│   │   │                             #   EarringProduct, StickonProduct, HandbagProduct,
│   │   │                             #   ProductReview, Wishlist, WishlistItem, Banner, FlashSale
│   │   ├── serializers.py            # All product serializers (list/detail/review/wishlist)
│   │   ├── views.py                  # CategoryViewSet, BrandViewSet, ProductViewSet,
│   │   │                             #   BannerViewSet, FlashSaleViewSet, WishlistViewSet
│   │   └── urls.py                   # Router: categories, brands, products, banners,
│   │                                 #   flash-sales, wishlist
│   │
│   ├── orders/                       # Orders app
│   │   ├── models.py                 # Address, Cart, CartItem, Order, OrderItem, Coupon
│   │   ├── serializers.py            # Address, Cart, CartItem, Order, OrderItem, Coupon serializers
│   │   ├── views.py                  # AddressViewSet, CartViewSet, OrderViewSet, CouponViewSet
│   │   └── urls.py                   # Router: addresses, cart, orders, coupons
│   │
│   ├── payments/                     # Payments app
│   │   ├── models.py                 # Payment, MpesaTransaction, PayPalTransaction
│   │   ├── serializers.py            # STK Push, Callback, PayPal Create/Capture serializers
│   │   ├── views.py                  # MpesaViewSet (stk_push, callback, check_status)
│   │   │                             #   PayPalViewSet (create_order, capture)
│   │   └── urls.py                   # Router: mpesa, paypal
│   │
│   └── users/                        # Auth app (JWT login/register/profile)
│       ├── models.py                 # Extended User profile
│       ├── serializers.py            # Auth serializers
│       ├── views.py                  # Login, Register, Profile, ChangePassword
│       └── urls.py                   # /auth/ endpoints
│
└── frontend/                         # React + Vite frontend
    │
    ├── index.html                    # Entry HTML — Bootstrap Icons CDN, Google Fonts,
    │                                 #   Playfair Display + DM Sans
    ├── package.json                  # react, react-dom, react-router-dom
    ├── vite.config.js                # Vite + proxy to Django on :8000
    │
    └── src/
        │
        ├── main.jsx                  # ReactDOM.createRoot → <App />
        ├── App.jsx                   # BrowserRouter + AuthProvider + CartProvider
        │                             #   + WishlistProvider + all Routes
        │
        ├── services/
        │   └── api.js                # Full API client with JWT auto-refresh
        │                             #   authAPI, productsAPI, categoriesAPI, cartAPI,
        │                             #   ordersAPI, addressesAPI, wishlistAPI,
        │                             #   couponsAPI, paymentsAPI, bannersAPI, flashSalesAPI
        │
        ├── context/
        │   ├── AuthContext.jsx       # useAuth() — user, login, register, logout, isAuth
        │   ├── CartContext.jsx       # useCart() — cart, addItem, updateItem, removeItem, clearCart
        │   └── WishlistContext.jsx   # useWishlist() — wishlist, addToWishlist, removeFromWishlist, isWishlisted
        │
        ├── styles/
        │   └── main.css             # Full professional CSS — CSS variables, typography,
        │                             #   buttons, badges, cards, product cards, header,
        │                             #   mega-menu, hero, flash sale timer, cart, checkout,
        │                             #   filter sidebar, reviews, tabs, toast, skeleton loader,
        │                             #   footer, auth pages, pagination, responsive breakpoints
        │
        ├── components/
        │   │
        │   ├── layout/
        │   │   └── Layout.jsx        # Topbar + sticky Header (nav, search, cart badge,
        │   │                         #   wishlist badge, user dropdown, mobile drawer)
        │   │                         #   + Footer (links, socials, payment badges)
        │   │                         #   + <Outlet /> for page content
        │   │
        │   ├── product/
        │   │   └── ProductCard.jsx   # Product card with image, badges (Sale/New/Best/OOS),
        │   │                         #   hover actions (wishlist, quick-view), rating stars,
        │   │                         #   price + compare-at, Add to Bag button
        │   │
        │   └── common/
        │       ├── Toast.jsx         # Toast notifications (success/error/info) + ToastProvider
        │       │                     #   SkeletonCard, SkeletonText, Pagination, Stars,
        │       │                     #   Breadcrumb, EmptyState, ScrollToTop, Spinner, SectionHeader
        │       ├── HeroBanner.jsx    # Auto-rotating hero slider (5 slides, animated emoji,
        │       │                     #   decorative circles, dot navigation)
        │       └── Widgets.jsx       # CategoryPills (horizontal scroll), FlashSaleTimer
        │                             #   (live countdown), PromoStrip (5 trust badges),
        │                             #   Newsletter (subscribe form)
        │
        └── pages/
            ├── HomePage.jsx          # Hero + Promo Strip + Category Showcase + Featured +
            │                         #   Flash Sale + Bestsellers + New Arrivals + Why Us + Newsletter
            ├── ProductsPage.jsx      # Filter sidebar (category, price, quick filters) +
            │                         #   sort bar (5 sort options, grid/list toggle) + paginated grid
            ├── ProductDetailPage.jsx # Gallery with thumbnails, variant selector, qty control,
            │                         #   Add to Bag + Wishlist CTA, tabs (Description/Details/Reviews),
            │                         #   category-specific detail tables, related products
            ├── CategoryPage.jsx      # Category hero banner + paginated product grid
            ├── CartPage.jsx          # Cart items (qty update, remove) + order summary
            │                         #   + free shipping progress indicator + checkout CTA
            ├── CheckoutPage.jsx      # 3-step checkout: Address → Payment → Review
            │                         #   M-Pesa STK Push (with polling) + PayPal redirect
            │                         #   + coupon validation
            ├── CheckoutSuccessPage.jsx  # Order confirmation with order number
            ├── WishlistPage.jsx      # Saved products grid
            ├── OrdersPage.jsx        # Order list with status badges
            ├── OrderDetailPage.jsx   # Order items + totals + delivery address
            ├── AccountPage.jsx       # User profile card + account info + quick links
            ├── LoginPage.jsx         # Auth card with username/password form
            ├── RegisterPage.jsx      # Registration form (6 fields, 2-column grid)
            ├── SearchPage.jsx        # Search results grid
            ├── FlashSalePage.jsx     # Active flash sale with live timer + products
            └── NotFoundPage.jsx      # 404 page
```

---

## 🚀 Quick Start

### Backend

```bash
# 1. Create & activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install django djangorestframework djangorestframework-simplejwt \
  django-cors-headers django-filter Pillow python-decouple \
  psycopg2-binary requests django-storages

# 3. Create .env file (see settings.py for all variables)
cp .env.example .env              # fill in your values

# 4. Run migrations
python manage.py makemigrations products orders payments users
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Start server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

---

## 🌐 API Endpoints

All routes are prefixed with `/api/`

### Products — `/api/products/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `categories/` | List all categories with subcategories |
| GET | `categories/{slug}/` | Category detail |
| GET | `categories/{slug}/products/` | Products in a category |
| GET | `brands/` | All brands |
| GET | `products/` | All products (filterable, searchable, sortable) |
| GET | `products/{slug}/` | Product detail with all nested data |
| GET | `products/featured/` | Featured products |
| GET | `products/bestsellers/` | Bestselling products |
| GET | `products/new_arrivals/` | New arrivals |
| GET | `products/search/?q=` | Full-text search |
| GET | `products/by_category_type/?type=` | Filter by category type |
| GET/POST | `products/{slug}/reviews/` | List or add reviews |
| GET | `banners/` | Hero banners |
| GET | `flash-sales/` | Active flash sales |
| GET/POST/DELETE | `wishlist/my_wishlist/` `add/` `remove/` | Wishlist management |

### Orders — `/api/orders/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| CRUD | `addresses/` | User delivery addresses |
| GET | `cart/my_cart/` | Get current cart |
| POST | `cart/add_item/` | Add product to cart |
| PATCH | `cart/update_item/` | Update cart item qty |
| DELETE | `cart/remove_item/` | Remove cart item |
| DELETE | `cart/clear/` | Empty cart |
| GET | `orders/my_orders/` | User's order history |
| GET | `orders/{id}/detail_order/` | Single order detail |
| POST | `orders/create_from_cart/` | Create order from cart |
| POST | `orders/{id}/cancel/` | Cancel order |
| POST | `coupons/validate/` | Validate & calculate coupon discount |

### Payments — `/api/payments/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `mpesa/stk_push/` | Initiate M-Pesa STK Push |
| POST | `mpesa/callback/` | Safaricom callback (public) |
| GET | `mpesa/check_status/?payment_id=` | Poll payment status |
| POST | `paypal/create_order/` | Create PayPal order → approval URL |
| POST | `paypal/capture/` | Capture PayPal payment |

### Auth — `/api/auth/`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `login/` | Get JWT tokens |
| POST | `register/` | Create account |
| POST | `logout/` | Blacklist refresh token |
| GET/PATCH | `profile/` | Get or update profile |
| POST | `token/refresh/` | Refresh access token |
| POST | `change-password/` | Change password |

---

## 💳 Payment Configuration

### M-Pesa (Safaricom Daraja)
1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app → get **Consumer Key** & **Consumer Secret**
3. Get your **Passkey** from the Lipa Na M-Pesa section
4. Use sandbox shortcode `174379` for testing
5. Set `MPESA_CALLBACK_URL` to a publicly reachable URL (use [ngrok](https://ngrok.com) in dev)
6. Switch URLs from sandbox → production when going live

```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.co.ke/api/payments/mpesa/callback/
```

### PayPal
1. Create app at [developer.paypal.com](https://developer.paypal.com)
2. Get **Client ID** & **Client Secret** from sandbox
3. Switch `PAYPAL_BASE_URL` from sandbox to live for production

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_secret
PAYPAL_RETURN_URL=https://yourdomain.co.ke/checkout/success
PAYPAL_CANCEL_URL=https://yourdomain.co.ke/checkout/cancel
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--clr-rose` | `#d4698a` | Primary brand, CTAs, accents |
| `--clr-rose-dark` | `#b0476a` | Hover states, prices |
| `--clr-rose-pale` | `#fce8ef` | Backgrounds, hover fills |
| `--clr-gold` | `#c9a84c` | Bestseller badges, gold CTAs |
| `--clr-ivory` | `#fdf8f5` | Page background |
| `--clr-charcoal` | `#2c2c2c` | Body text, headings |
| `--font-display` | Playfair Display | Headings, logo, hero |
| `--font-body` | DM Sans | All body text, UI |

---

## 🗃️ Database Models Overview

### Products App
- **Category** — 5 types: `skincare`, `hair`, `earrings`, `stickons`, `handbags`
- **SubCategory** — nested under category with SEO slug
- **Brand** — product brand with logo
- **Product** — core model with SEO slug, pricing, stock, ratings, flags
- **ProductImage** — multiple images per product, one marked primary
- **ProductVariant** — size/color/length variants with price modifiers
- **SkincareProduct** — skin type, ingredients, SPF, vegan/cruelty-free flags
- **HairProduct** — texture, length, origin, density, weft type
- **EarringProduct** — type, material, gemstone, dimensions
- **StickonProduct** — type, pieces per pack, duration, reusable flag
- **HandbagProduct** — type, material, dimensions, compartments
- **ProductReview** — rating 1–5, verified purchase badge
- **Wishlist / WishlistItem** — per-user saved products
- **Banner** — hero carousel images
- **FlashSale** — timed sales with discount % and product selection

### Orders App
- **Address** — delivery addresses with default flag
- **Cart / CartItem** — session or user-linked cart
- **Order / OrderItem** — full order lifecycle with status tracking
- **Coupon** — percentage or fixed discount with usage limits

### Payments App
- **Payment** — base payment record (method, status, amount)
- **MpesaTransaction** — STK Push details + callback data
- **PayPalTransaction** — PayPal order + capture details

---

## 📦 Key Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| `djangorestframework` | REST API framework |
| `djangorestframework-simplejwt` | JWT authentication |
| `django-cors-headers` | CORS for frontend |
| `django-filter` | Query filtering |
| `Pillow` | Image processing |
| `python-decouple` | `.env` config |
| `psycopg2-binary` | PostgreSQL driver |
| `requests` | M-Pesa & PayPal HTTP calls |

### Frontend
| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `vite` | Dev server & bundler |
| Bootstrap Icons CDN | All UI icons |
| Google Fonts CDN | Playfair Display + DM Sans |

---

## 🔧 Environment Variables (`.env`)

```env
# Django
SECRET_KEY=your-super-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=glamstore_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# M-Pesa
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=174379
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://yourdomain.co.ke/api/payments/mpesa/callback/

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_RETURN_URL=http://localhost:5173/checkout/success
PAYPAL_CANCEL_URL=http://localhost:5173/checkout/cancel

# Email
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=yourpassword
DEFAULT_FROM_EMAIL=GlamStore <noreply@glamstore.co.ke>
```

```env
# Frontend (.env in /frontend)
VITE_API_URL=http://localhost:8000/api
```

---

## 📋 Pages Summary

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero slider, category showcase, featured, flash sale, bestsellers, new arrivals |
| Products | `/products` | Filterable/sortable product grid with sidebar |
| Product Detail | `/products/:slug` | Gallery, variants, add to cart, reviews, related |
| Category | `/category/:slug` | Category header + product grid |
| Cart | `/cart` | Cart items, quantities, order summary |
| Checkout | `/checkout` | 3-step: Address → M-Pesa/PayPal → Review |
| Order Success | `/checkout/success` | Confirmation with order number |
| Wishlist | `/wishlist` | Saved products |
| Orders | `/orders` | Order history list |
| Order Detail | `/orders/:id` | Full order detail + status |
| Account | `/account` | Profile info + quick links |
| Login | `/login` | JWT sign-in |
| Register | `/register` | Account creation |
| Search | `/search?q=` | Search results |
| Flash Sale | `/flash-sale/:slug` | Timed sale with countdown |
| 404 | `*` | Not found page |

---

## 🌍 Deployment Notes

- Set `DEBUG=False` in production
- Configure `ALLOWED_HOSTS` with your domain
- Switch M-Pesa URLs from sandbox → production (Safaricom live)
- Switch PayPal `BASE_URL` from sandbox → `api-m.paypal.com`
- Run `python manage.py collectstatic` for static files
- Use **Nginx** + **Gunicorn** for Django in production
- Frontend: `npm run build` → serve `/dist` via Nginx
- Ensure `MPESA_CALLBACK_URL` is publicly accessible (Safaricom must reach it)

---

*Built with 💕 for the GlamStore brand — beauty, hair & fashion for every girl.*