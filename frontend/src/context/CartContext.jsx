// CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 })
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get()
      setCart(data)
    } catch {}
  }

  useEffect(() => { fetchCart() }, [])

  const addItem = async (productId, quantity = 1, variantId = null) => {
    setLoading(true)
    try {
      const data = await cartAPI.addItem({ product_id: productId, quantity, variant_id: variantId })
      setCart(data)
      return true
    } catch { return false }
    finally { setLoading(false) }
  }

  const updateItem = async (itemId, quantity) => {
    try {
      const data = await cartAPI.updateItem({ item_id: itemId, quantity })
      setCart(data)
    } catch {}
  }

  const removeItem = async (itemId) => {
    try {
      const data = await cartAPI.removeItem({ item_id: itemId })
      setCart(data)
    } catch {}
  }

  const clearCart = async () => {
    try {
      const data = await cartAPI.clear()
      setCart(data)
    } catch {}
  }

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)