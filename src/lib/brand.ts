export const brandAssets = {
  mark: "/images/brand/mark-v2.webp",
  organizationLogo: "/images/brand/logo-512-v2.png",
  favicon: "/images/brand/favicon-v2.ico",
  icon48: "/images/brand/icon-48-v2.png",
  appleIcon: "/images/brand/apple-touch-icon-v2.png",
  shareAr: "/images/brand/share-ar-v2.png",
  shareEn: "/images/brand/share-en-v2.png",
} as const;

export const brandOrigin = "https://arabtechproserver.tech";
export const getBrandShareImage = (lang: string) => `${brandOrigin}${lang === "ar" ? brandAssets.shareAr : brandAssets.shareEn}`;
