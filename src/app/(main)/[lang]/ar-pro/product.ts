import { getBackendCandidates } from "@/lib/api-proxy-candidates";

type Plan = {
  id: string;
  name: string;
  description: string;
  amountMinor: number;
  offerAmountMinor: number;
  currency: string;
  durationDays: number;
  discountPercent: number;
  discountUntil: string | null;
};
type Product = { trialDays: number; downloadUrl: string | null; plans: Plan[] };

export async function getProduct(): Promise<Product | null> {
  const signal = AbortSignal.timeout(2500);
  for (const base of getBackendCandidates(null, process.env.INTERNAL_API_URL, true)) {
    try {
      const response = await fetch(base + "/api/mobile-cashier/product", { cache: "no-store", redirect: "error", signal });
      if (response.ok) return await response.json() as Product;
    } catch {
      if (signal.aborted) break;
    }
  }
  return null;
}
