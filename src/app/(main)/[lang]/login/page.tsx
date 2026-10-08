import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import LoginClient from "./LoginClient";

export function generateStaticParams() {
  return i18n.locales.map(lang => ({ lang }));
}

export default async function Login(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <LoginClient lang={params.lang} dict={dict} />;
}
