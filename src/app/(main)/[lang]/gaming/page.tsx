import { Metadata } from "next";
import { Locale, i18n } from "@/i18n/config";
import { notFound } from "next/navigation";
import GamingClient from "./GamingClient";

type Props = {
  params: Promise<{ lang: Locale }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const isAr = params.lang === "ar";

  const rawSection = searchParams?.section || searchParams?.bundle || searchParams?.group || searchParams?.search;
  let section = typeof rawSection === "string" ? rawSection : undefined;

  if (section) {
    try {
      section = decodeURIComponent(section);
    } catch {
      // ignore
    }
    section = section.replace(/^%20/, "").trim();
  }

  const title = section
    ? isAr
      ? `باقات وشحن ${section} | عرب تك برو سيرفر`
      : `${section} Top-Up & Vouchers | Arab Tech Pro Server`
    : isAr
    ? "الخدمات الرقمية وشحن الألعاب والبطاقات | عرب تك برو سيرفر"
    : "Digital Services, Gaming & Gift Cards | Arab Tech Pro Server";

  const description = section
    ? isAr
      ? `أسعار باقات وعروض ${section}: شحن فوري وتفعيل مباشر 24/7 عبر رصيد المحفظة على سيرفر عرب تك برو بأفضل الأسعار المعتمدة.`
      : `Live packages and prices for ${section}: instant 24/7 delivery and activation on Arab Tech Pro Server.`
    : isAr
    ? "متجر شحن الألعاب الرسمي والاشتراكات والترفيه وبطاقات الهدايا (PUBG, Free Fire, Roblox, Steam, Telegram, eSIM) بأسعار الجملة المعتمدة وتسليم فوري."
    : "Official digital top-up store for games, subscriptions and digital gift cards (PUBG, Free Fire, Roblox, Steam, Telegram, eSIM) with instant delivery.";

  const currentUrl = `https://arabtechproserver.tech/${params.lang}/gaming${
    section ? `?section=${encodeURIComponent(section)}` : ""
  }`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
    },
  };
}

export default async function GamingPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }

  const rawSection = searchParams?.section || searchParams?.bundle || searchParams?.group || searchParams?.search;
  const initialSectionParam = typeof rawSection === "string" ? rawSection : undefined;

  return <GamingClient lang={params.lang} initialSectionParam={initialSectionParam} />;
}
