import type { MetadataRoute } from "next"

/** /unlock is intentionally absent — it is a form behind a trip, not a landing page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: "https://cabodeals.mx/", lastModified: now, priority: 1 },
    { url: "https://cabodeals.mx/faq", lastModified: now, priority: 0.6 },
    { url: "https://cabodeals.mx/terms-of-service", lastModified: now, priority: 0.3 },
  ]
}
