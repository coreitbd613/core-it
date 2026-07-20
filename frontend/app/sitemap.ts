import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coreitbd.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/hosting",
    "/domains",
    "/services/web-development",
    "/services/software-development",
    "/services/mobile-app-development",
    "/services/ecommerce",
    "/services/seo",
    "/services/marketing",
    "/services/design-branding",
    "/contact",
    "/login",
    "/signup",
    "/terms",
    "/privacy",
  ]

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))
}
