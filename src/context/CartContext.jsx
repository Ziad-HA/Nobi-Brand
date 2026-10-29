import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'Nobi-cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product, { size, color }) => {
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
          price: product.price,
          image: product.images[0],
          size,
          color,
          qty: 1,
        },
      ]
    })
  }

  const updateQty = (key, qty) => {
    setItems((prev) =>
      qty < 1 ? prev.filter((item) => item.key !== key) : prev.map((item) => (item.key === key ? { ...item, qty } : item)),
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
