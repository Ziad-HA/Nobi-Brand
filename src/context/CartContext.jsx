import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'Nobi-cart'

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && item.key && item.id && Number(item.qty) > 0)
      : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // The cart remains usable for the current session if storage is unavailable.
    }
  }, [items])

  const addItem = (product, { size, color }) => {
    if (!product || product.soldOut) return
    setItems((prev) => {
      const key = `${product.id}-${size}-${color}`
      const existing = prev.find((item) => item.key === key)
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.images?.[0] ?? '',
          size,
          color,
          qty: 1,
        },
      ]
    })
  }

  const updateQty = (key, qty) => {
    const nextQty = Math.floor(Number(qty))
    setItems((prev) =>
      !Number.isFinite(nextQty) || nextQty < 1
        ? prev.filter((item) => item.key !== key)
        : prev.map((item) => item.key === key ? { ...item, qty: Math.min(nextQty, 99) } : item),
    )
  }

  const removeItem = (key) => setItems((prev) => prev.filter((item) => item.key !== key))
  const clearCart = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const value = useMemo(
    () => ({ items, addItem, updateQty, removeItem, clearCart, count, subtotal }),
    [items, count, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
