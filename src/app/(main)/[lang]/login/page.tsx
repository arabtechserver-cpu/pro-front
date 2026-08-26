import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import LoginClient from "./LoginClient";

export default async function Login({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return <LoginClient lang={params.lang} dict={dict} />;
}
