import { useEffect } from 'react'

/**
 * Sets the title and description per route.
 *
 * This is a client-rendered site, so index.html ships one title for every page. Google
 * does run JavaScript and will pick these up, but other crawlers and most link-preview
 * scrapers (iMessage, WhatsApp, Facebook) read the raw HTML and never see them. So this
 * is the right fix for search, and a real pre-render or SSR is the eventual fix for
 * shared links. Noted in agents/SEO.md rather than left as a silent gap.
 */
export default function PageMeta({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}) {
  useEffect(() => {
    document.title = title

    const set = (selector: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)
      if (!el) {
        el = selector.startsWith('link')
          ? document.createElement('link')
          : document.createElement('meta')
        if (selector.startsWith('link')) {
          ;(el as HTMLLinkElement).rel = 'canonical'
        } else {
          const name = selector.match(/\[(name|property)="([^"]+)"\]/)
          if (name) el.setAttribute(name[1], name[2])
        }
        document.head.appendChild(el)
      }
      el.setAttribute(attr, value)
    }

    set('meta[name="description"]', 'content', description)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    set('meta[property="og:url"]', 'content', `https://lunasbouquet.com${path}`)
    set('link[rel="canonical"]', 'href', `https://lunasbouquet.com${path}`)
  }, [title, description, path])

  return null
}
