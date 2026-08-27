import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/wallet",
          "/ar/wallet",
          "/en/wallet",
          "/ar/admin",
          "/en/admin",
          "/ar/admin/*",
          "/en/admin/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/wallet",
        ],
      },
    ],
    sitemap: "https://arabtechproserver.tech/sitemap.xml",
    host: "https://arabtechproserver.tech",
  };
}
