import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const CartContext = createContext(null)
const STORAGE_KEY = 'Nobi-cart'

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item) => {
      const qty = Number(item?.qty), price = Number(item?.price)
      return item && item.key && item.id && Number.isFinite(qty) && qty >= 1 && Number.isFinite(price) && price >= 0
    }).map((item) => ({
      ...item, key: String(item.key), id: String(item.id), name: String(item.name || 'UNSEEN piece'),
      image: typeof item.image === 'string' ? item.image : '', size: String(item.size || ''),
      color: String(item.color || ''), price: Number(item.price), qty: Math.min(99, Math.floor(Number(item.qty))),
    }))
  } catch { return [] }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartToast, setCartToast] = useState(null)
  const [userId, setUserId] = useState(null)
  const [cartReady, setCartReady] = useState(false)

  useEffect(() => {
    if (!supabase) { setCartReady(true); return undefined }
    let active = true
    const restoreForSession = async (session) => {
      const nextUserId = session?.user?.id || null
      setCartReady(false)
      setUserId(nextUserId)
      if (!nextUserId) { setCartReady(true); return }
      const { data, error } = await supabase.from('saved_carts').select('items').eq('user_id', nextUserId).maybeSingle()
      if (!active) return
      if (!error && Array.isArray(data?.items) && data.items.length) {
        setItems((current) => current.length ? current : data.items)
      }
      setCartReady(true)
    }
    supabase.auth.getSession().then(({ data }) => restoreForSession(data?.session ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      restoreForSession(session)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* Session-only fallback. */ }
  }, [items])

  useEffect(() => {
    if (!supabase || !userId || !cartReady) return
    supabase.from('saved_carts').upsert({
      user_id: userId,
      items,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).then(({ error }) => {
      if (error) console.warn('Could not sync saved cart:', error.message)
    })
  }, [items, userId, cartReady])

  const addItem = useCallback((product, { size, color } = {}) => {
    if (!product || product.soldOut || !size || !color) return false
    setItems((prev) => {
      const key = `${product.id}-${size}-${color}`
      const existing = prev.find((item) => item.key === key)
      if (existing) return prev.map((item) => item.key === key ? { ...item, qty: Math.min(99, item.qty + 1) } : item)
      return [...prev, { key, id: product.id, name: product.name, price: Math.max(0, Number(product.price) || 0), image: product.images?.[0] ?? '', size, color, qty: 1 }]
    })
    setCartToast({ id: Date.now(), name: product.name })
    setIsCartOpen(true)
    return true
  }, [])

  const updateQty = useCallback((key, qty) => {
    const nextQty = Math.floor(Number(qty))
    setItems((prev) => !Number.isFinite(nextQty) || nextQty < 1
      ? prev.filter((item) => item.key !== key)
      : prev.map((item) => item.key === key ? { ...item, qty: Math.min(nextQty, 99) } : item))
  }, [])
  const removeItem = useCallback((key) => setItems((prev) => prev.filter((item) => item.key !== key)), [])
  const clearCart = useCallback(() => setItems([]), [])
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const value = useMemo(() => ({ items, addItem, updateQty, removeItem, clearCart, count, subtotal, isCartOpen, openCart, closeCart, cartToast, setCartToast }),
    [items, addItem, updateQty, removeItem, clearCart, count, subtotal, isCartOpen, openCart, closeCart, cartToast])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
