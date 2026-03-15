// AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, setTokens, clearTokens, getAccessToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      authAPI.profile()
        .then(setUser)
        .catch(() => clearTokens())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const data = await authAPI.login(credentials)
    setTokens(data.access, data.refresh)
    const profile = await authAPI.profile()
    setUser(profile)
    return profile
  }

  const register = async (formData) => {
    const data = await authAPI.register(formData)
    setTokens(data.access, data.refresh)
    setUser(data.user)   // backend already returns this — no extra fetch needed
    return data.user
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    clearTokens()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)