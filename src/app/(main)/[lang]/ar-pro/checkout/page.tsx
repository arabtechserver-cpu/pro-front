import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getProduct } from "../product";

export const metadata: Metadata = { title: "ar-pro | Wallet checkout", robots: { index: false, follow: false } };

export default async function ArProCheckout({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ plan?: string | string[] }>;
}) {
  const [{ lang }, { plan }] = await Promise.all([params, searchParams]);
  const planId = typeof plan === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(plan) ? plan : null;
  const product = planId ? await getProduct() : null;
  const listedPlan = product?.plans.find(item => item.id === planId && item.currency === "USD");
  return <CheckoutClient key={planId ?? "purchases"} lang={lang === "ar" ? "ar" : "en"} planId={planId} listedPlan={listedPlan && {
    id: listedPlan.id, name: listedPlan.name, durationDays: listedPlan.durationDays, priceMinor: listedPlan.offerAmountMinor,
  }} />;
}
