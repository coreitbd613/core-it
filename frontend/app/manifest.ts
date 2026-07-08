import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Core IT",
    short_name: "Core IT",
    description: "Core IT CRM & ERP platform.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F4EE",
    theme_color: "#FD6005",
    icons: [
      {
        src: "/favicon_io/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon_io/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
