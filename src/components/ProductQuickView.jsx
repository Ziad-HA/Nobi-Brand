import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCart } from '../context/CartContext'

export default function ProductQuickView({ product, onClose }) {
  const [size, setSize] = useState(product?.sizes?.[0] || '')
  const [color, setColor] = useState(product?.colors?.[0] || '')
  const reduceMotion = useReducedMotion()
  const { addItem } = useCart()

  useEffect(() => {
    setSize(product?.sizes?.[0] || '')
    setColor(product?.colors?.[0] || '')
  }, [product?.id])

  useEffect(() => {
    if (!product) return undefined
    const previous = document.activeElement
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    document.querySelector('.quick-view-close')?.focus()
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = ''; previous?.focus?.() }
  }, [product, onClose])

  return (
    <AnimatePresence>
      {product && (
        <div className="quick-view-layer" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
          <motion.div className="quick-view-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.section className="quick-view-panel" role="dialog" aria-modal="true" aria-labelledby="quick-view-title"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }}
            transition={{ duration: reduceMotion ? .01 : .25 }}>
            <button type="button" className="quick-view-close" onClick={onClose} aria-label="Close quick view">×</button>
            <div className="quick-view-image"><img src={product.images?.[0]} alt={product.name} /></div>
            <div className="quick-view-details">
              <p className="eyebrow">{product.tag} · {product.category}</p>
              <h2 id="quick-view-title">{product.name}</h2>
              <strong className="quick-view-price">${product.price}</strong>
              <p>{product.description}</p>
              <div className="quick-view-option"><span>Color · {color}</span><div>{product.colors.map((value) => <button key={value} type="button" className={color === value ? 'active' : ''} aria-pressed={color === value} onClick={() => setColor(value)}>{value}</button>)}</div></div>
              <div className="quick-view-option"><span>Choose size</span><div>{product.sizes.map((value) => <button key={value} type="button" className={size === value ? 'active' : ''} aria-pressed={size === value} onClick={() => setSize(value)}>{value}</button>)}</div></div>
              <button type="button" className="btn btn-primary quick-view-add" disabled={product.soldOut} data-sound="add" onClick={() => { if (addItem(product, { size, color })) onClose() }}>{product.soldOut ? 'Sold out' : 'Add to bag — $' + product.price}</button>
              <Link to={`/product/${product.id}`} className="quick-view-full" onClick={onClose}>View full details ↗</Link>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
