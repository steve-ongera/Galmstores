import { createContext, useContext, useState, useEffect } from 'react'
import { wishlistAPI } from '../services/api'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { isAuth } = useAuth()
  const [wishlist, setWishlist] = useState({ items: [], total_items: 0 })

  useEffect(() => {
    if (isAuth) {
      wishlistAPI.get().then(setWishlist).catch(() => {})
    }
  }, [isAuth])

  const addToWishlist = async (productId) => {
    if (!isAuth) return false
    try {
      await wishlistAPI.add(productId)
      const data = await wishlistAPI.get()
      setWishlist(data)
      return true
    } catch { return false }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId)
      const data = await wishlistAPI.get()
      setWishlist(data)
    } catch {}
  }

  const isWishlisted = (productId) =>
    wishlist.items.some(item => item.product?.id === productId)

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)