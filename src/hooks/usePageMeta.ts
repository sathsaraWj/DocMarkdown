import { useEffect } from 'react'

import { trackPageView } from '@/services/analytics'
import { SITE_URL } from '@/utils/env'

export interface PageMetaOptions {
  title: string
  description: string
  path: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

/** Sets document title, meta description, canonical URL, and Open Graph/Twitter tags for the current route. */
export function usePageMeta({ title, description, path }: PageMetaOptions): void {
  useEffect(() => {
    const fullTitle = `${title} | DocMarkdown`
    document.title = fullTitle
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:title', fullTitle)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:url', `${SITE_URL}${path}`)
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', fullTitle)
    setMetaTag('name', 'twitter:description', description)
    setCanonical(`${SITE_URL}${path}`)
    trackPageView(path)
  }, [title, description, path])
}
