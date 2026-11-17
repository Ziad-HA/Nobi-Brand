import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'Nobi-wishlist'

function readWishlist() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string'))] : []
  } catch { return [] }
}

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readWishlist)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)) } catch { /* Session-only fallback. */ }
  }, [ids])
  const toggleWishlist = (id) => setIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const isWishlisted = (id) => ids.includes(id)
  const value = useMemo(() => ({ ids, toggleWishlist, isWishlisted, count: ids.length }), [ids])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider')
  return context
}
