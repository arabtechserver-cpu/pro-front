import { getBrandShareImage } from "@/lib/brand";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Locale, i18n } from "@/i18n/config";
import StorefrontHome from "@/components/StorefrontHome";

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const isAr = params.lang === "ar";
  const title = isAr
    ? "عرب تك برو سيرفر | سوفت وير الهواتف والخدمات عن بُعد"
    : "Arab Tech Pro Server | Phone Software & Remote Services";
  const description = isAr
    ? "منصة عرب تك برو سيرفر لخدمات سوفت وير الهواتف، التفعيل وفك الشبكات عن بُعد، تراخيص أدوات الصيانة وأرصدة السيرفرات."
    : "Arab Tech Pro Server: phone software, remote activation and network unlocking, repair-tool licenses and server credits.";

  const shareImg = getBrandShareImage(params.lang);

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title,
    description,
    keywords: [
      "عرب تك برو سيرفر",
      "عرب تك سيرفر",
      "سيرفر عرب تك",
      "Arab Tech Pro Server",
      "Arab Tech Pro Server Pro",
      "arabtechproserver.tech",
      "سيرفر فك الهواتف",
      "فك شبكات",
      "تخطي iCloud",
      "تخطي FRP"
    ],
    openGraph: {
      title,
      description,
      url: `https://arabtechproserver.tech/${params.lang}`,
      siteName: isAr ? "عرب تك برو سيرفر - Arab Tech Pro Server" : "Arab Tech Pro Server",
      images: [
        {
          url: shareImg,
          width: 1200,
          height: 630,
          alt: isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImg],
    },
  };
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  if (!i18n.locales.includes(lang)) notFound();
  return <StorefrontHome lang={lang} />;
}
