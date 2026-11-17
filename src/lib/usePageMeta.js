import { useEffect } from 'react'

const SITE = 'Nobi'
const DEFAULT_DESC = 'Nobi — streetwear cut for the night. Limited drops, oversized silhouettes, city-grade construction.'

function setCanonical(pathname) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', new URL(pathname, window.location.origin).href)
}

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Sets the tab title, description and share-card (Open Graph) text for the current page.
// Social crawlers don't run JS, so index.html keeps static defaults too; this keeps the tab,
// history and in-browser shares accurate per route.
export default function usePageMeta(title, description = DEFAULT_DESC, image) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} - Streetwear`
    document.title = full
    setCanonical(window.location.pathname)
    setMeta('property', 'og:url', window.location.href)
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:title', full)
    setMeta('name', 'twitter:description', description)
    if (image) {
      const abs = new URL(image, window.location.origin).href
      setMeta('property', 'og:image', abs)
      setMeta('name', 'twitter:image', abs)
    }
  }, [title, description, image])
}
