const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ─── TOKEN HELPERS ─────────────────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('access_token')
export const getRefreshToken = () => localStorage.getItem('refresh_token')
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// ─── HTTP CLIENT ───────────────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getAccessToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`
      const retry = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
      if (!retry.ok) throw new Error(`HTTP ${retry.status}`)
      return retry.json()
    } else {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw { status: response.status, data: error }
  }

  if (response.status === 204) return null
  return response.json()
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.access, data.refresh || refresh)
    return true
  } catch {
    return false
  }
}

const get = (url, params) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return request(`${url}${query}`)
}
const post = (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) })
const patch = (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) })
const del = (url, body) => request(url, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined })

// ─── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => post('/auth/login/', credentials),
  register: (data) => post('/auth/register/', data),
  logout: () => post('/auth/logout/', { refresh: getRefreshToken() }),
  profile: () => get('/auth/profile/'),
  updateProfile: (data) => patch('/auth/profile/', data),
  changePassword: (data) => post('/auth/change-password/', data),
}

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list: (params) => get('/products/products/', params),
  detail: (slug) => get(`/products/products/${slug}/`),
  featured: () => get('/products/products/featured/'),
  bestsellers: () => get('/products/products/bestsellers/'),
  newArrivals: () => get('/products/products/new_arrivals/'),
  search: (q) => get('/products/products/search/', { q }),
  byCategory: (type) => get('/products/products/by_category_type/', { type }),
  reviews: (slug) => get(`/products/products/${slug}/reviews/`),
  addReview: (slug, data) => post(`/products/products/${slug}/reviews/`, data),
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoriesAPI = {
  list: () => get('/products/categories/'),
  detail: (slug) => get(`/products/categories/${slug}/`),
  products: (slug) => get(`/products/categories/${slug}/products/`),
}

// ─── CART ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => get('/orders/cart/my_cart/'),
  addItem: (data) => post('/orders/cart/add_item/', data),
  updateItem: (data) => patch('/orders/cart/update_item/', data),
  removeItem: (data) => del('/orders/cart/remove_item/', data),
  clear: () => del('/orders/cart/clear/'),
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list: () => get('/orders/orders/my_orders/'),
  detail: (id) => get(`/orders/orders/${id}/detail_order/`),
  createFromCart: (data) => post('/orders/orders/create_from_cart/', data),
  cancel: (id) => post(`/orders/orders/${id}/cancel/`),
}

// ─── ADDRESSES ────────────────────────────────────────────────────────────────
export const addressesAPI = {
  list: () => get('/orders/addresses/'),
  create: (data) => post('/orders/addresses/', data),
  update: (id, data) => patch(`/orders/addresses/${id}/`, data),
  delete: (id) => del(`/orders/addresses/${id}/`),
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
export const wishlistAPI = {
  get: () => get('/products/wishlist/my_wishlist/'),
  add: (productId) => post('/products/wishlist/add/', { product_id: productId }),
  remove: (productId) => del('/products/wishlist/remove/', { product_id: productId }),
}

// ─── COUPONS ──────────────────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (code, orderTotal) => post('/orders/coupons/validate/', { code, order_total: orderTotal }),
}

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  mpesaSTKPush: (data) => post('/payments/mpesa/stk_push/', data),
  mpesaCheckStatus: (paymentId) => get('/payments/mpesa/check_status/', { payment_id: paymentId }),
  paypalCreateOrder: (orderId) => post('/payments/paypal/create_order/', { order_id: orderId }),
  paypalCapture: (data) => post('/payments/paypal/capture/', data),
}

// ─── BANNERS & FLASH SALES ────────────────────────────────────────────────────
export const bannersAPI = {
  list: () => get('/products/banners/'),
}

export const flashSalesAPI = {
  list: () => get('/products/flash-sales/'),
  detail: (slug) => get(`/products/flash-sales/${slug}/`),
}