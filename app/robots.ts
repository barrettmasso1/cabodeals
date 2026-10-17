import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/unlock", "/api/"] },
    sitemap: "https://cabodeals.mx/sitemap.xml",
  }
}
