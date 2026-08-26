import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/wallet", "/login", "/register", "/en/admin", "/ar/admin"],
    },
    sitemap: "https://arabtechproserver.tech/sitemap.xml",
  };
}
