import { Link } from 'react-router-dom'
import usePageMeta from '../lib/usePageMeta'

export default function NotFound() {
  usePageMeta('Page not found', 'The page you are looking for is not in the NOBI archive.')
  return <section className="section not-found-page"><p className="eyebrow">404 / NOBI archive</p><h1>Wrong turn<span>.</span></h1><p className="muted">This page doesn't exist or has moved.</p><Link to="/" className="btn btn-primary">Back to NOBI ↗</Link></section>
}
