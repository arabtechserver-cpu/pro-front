import { Metadata } from "next";
import { Locale, i18n } from "@/i18n/config";
import { notFound } from "next/navigation";
import FaqSection from "@/components/FaqSection";

interface FaqPageProps {
  params: Promise<{ lang: Locale }>;
}

export async function generateMetadata(props: FaqPageProps): Promise<Metadata> {
  const { lang } = await props.params;
  const isAr = lang === "ar";
  return {
    title: isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions (FAQ)",
    description: isAr
      ? "إجابات شاملة لجميع الأسئلة الشائعة حول خدمات فك الشفرات، تفعيل البوكسات والدونجل، ووسائل الدفع المعتمدة."
      : "Comprehensive answers to frequently asked questions about phone unlocking, dongle activations, and accepted payment methods.",
    metadataBase: new URL("https://arabtechproserver.tech"),
  };
}

export default async function FaqPage(props: FaqPageProps) {
  const { lang } = await props.params;
  if (!i18n.locales.includes(lang)) {
    notFound();
  }

  return (
    <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
      <FaqSection lang={lang} />
    </main>
  );
}
