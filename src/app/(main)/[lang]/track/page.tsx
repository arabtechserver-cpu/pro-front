import type { Metadata } from "next";
import TrackClient from "./TrackClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ar" ? "تتبع طلب الصيانة | ar-pro" : "Repair Tracker | ar-pro",
    robots: { index: false, follow: false },
  };
}

export default async function TrackIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <TrackClient lang={lang === "ar" ? "ar" : "en"} />;
}
