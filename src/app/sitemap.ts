import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://arabtechproserver.tech";
  const locales = ["en", "ar"];
  const routes = ["", "/pricing", "/login", "/register", "/contact"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add the base index URL
  sitemapEntries.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  });

  // Loop through locales and routes
  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: route === "" ? 1 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
