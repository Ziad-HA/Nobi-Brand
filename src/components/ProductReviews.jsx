import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const dateLabel = (value) => new Intl.DateTimeFormat('en-EG', { dateStyle: 'medium' }).format(new Date(value))

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([])
  const [user, setUser] = useState(null)
  const [eligible, setEligible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ rating: 5, title: '', body: '' })

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!supabase) { setLoading(false); return }
      const [{ data: reviewRows, error: reviewError }, { data: authData }] = await Promise.all([
        supabase.from('product_reviews').select('id, user_id, rating, title, body, created_at').eq('product_id', productId).order('created_at', { ascending: false }),
        supabase.auth.getUser(),
      ])
      if (!active) return
      if (reviewError) setError(reviewError.message)
      else setReviews(reviewRows || [])
      const currentUser = authData?.user || null
      setUser(currentUser)
      if (currentUser) {
        const { data: deliveredOrders } = await supabase.from('orders').select('id')
          .eq('user_id', currentUser.id).eq('status', 'delivered')
        const orderIds = (deliveredOrders || []).map((order) => order.id)
        if (orderIds.length) {
          const { data: matchingItems } = await supabase.from('order_items').select('id')
            .in('order_id', orderIds).eq('product_id', productId).limit(1)
          if (active) setEligible(Boolean(matchingItems?.length))
        }
      }
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [productId])

  async function submitReview(event) {
    event.preventDefault()
    if (!user || !eligible) return
    setSaving(true); setError(''); setNotice('')
    const { data, error: saveError } = await supabase.from('product_reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating: Number(form.rating),
      title: form.title.trim(),
      body: form.body.trim(),
    }).select('id, user_id, rating, title, body, created_at').single()
    setSaving(false)
    if (saveError) {
      setError(saveError.code === '23505' ? 'You have already reviewed this product.' : saveError.message)
      return
    }
    setReviews((current) => [data, ...current])
    setNotice('Your verified review has been published.')
    setForm({ rating: 5, title: '', body: '' })
  }

  const average = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <section className="product-reviews" id="reviews">
      <div className="product-reviews-heading">
        <div><p className="eyebrow">COMMUNITY / FEEDBACK</p><h2>PRODUCT REVIEWS<span>.</span></h2></div>
        <div className="product-review-summary"><strong>{average}</strong><span>★</span><small>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</small></div>
      </div>

      {loading ? <p className="product-review-empty">Loading reviews…</p> : null}
      {error && <p className="product-review-message" role="alert">{error}</p>}
      {notice && <p className="product-review-message is-success" role="status">{notice}</p>}

      {user && eligible && !reviews.some((review) => review.user_id === user.id) && (
        <form className="product-review-form" onSubmit={submitReview}>
          <label>YOUR RATING<select value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))}>{[5,4,3,2,1].map((rating) => <option value={rating} key={rating}>{rating} / 5</option>)}</select></label>
          <label>REVIEW TITLE<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} minLength="3" maxLength="90" required placeholder="How was the piece?" /></label>
          <label>YOUR REVIEW<textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} minLength="8" maxLength="1200" required rows="4" placeholder="Share your experience…" /></label>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish verified review'}</button>
        </form>
      )}
      {!loading && user && !eligible && <p className="product-review-empty">Reviews are available to customers after their order is marked delivered.</p>}
      {!loading && !user && <p className="product-review-empty"><Link to="/login">Sign in</Link> to check whether you can leave a verified review after delivery.</p>}
      {!loading && reviews.length === 0 && <p className="product-review-empty">No reviews yet. Be the first verified customer to share feedback.</p>}

      <div className="product-review-list">
        {reviews.map((review) => (
          <article className="product-review-card" key={review.id}>
            <div className="product-review-card-top"><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</strong><span>VERIFIED BUYER · {dateLabel(review.created_at)}</span></div>
            <h3>{review.title}</h3><p>{review.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
