import { useEffect, useState } from 'react'
import { products as fallbackProducts } from '../data/products'
import { supabase } from './supabase'

function mapProduct(row) {
  const base = import.meta.env.BASE_URL
  const images = (row.images || []).map((image) =>
    image.startsWith('http') ? image : `${base}${image.replace(/^\\/+/, '')}`
  )
  return {
    id: row.id, name: row.name, price: Number(row.price),
    category: row.category, tag: row.tag || '', season: row.season || '',
    colors: row.colors || [], sizes: row.sizes || [],
    soldOut: Boolean(row.sold_out), images, description: row.description || '',
  }
}

export default function useProducts() {
  const [products, setProducts] = useState(fallbackProducts)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    let active = true
    supabase.from('products')
      .select('id,name,price,category,tag,season,colors,sizes,sold_out,images,description')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!active) return
        if (queryError) { setError(queryError.message); return }
        setProducts((data || []).map(mapProduct))
        setError('')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { products, loading, error }
}
