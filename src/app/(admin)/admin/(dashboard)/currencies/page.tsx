import CurrenciesClient from "./CurrenciesClient";

export const metadata = {
  title: "أسعار صرف العملات والجنيه السوداني | لوحة التحكم",
};

export default function CurrenciesPage() {
  return <CurrenciesClient />;
}
