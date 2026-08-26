import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import WalletClient from "./WalletClient";

export default async function WalletPage({
  params
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <WalletClient lang={lang} dict={dict} />;
}
