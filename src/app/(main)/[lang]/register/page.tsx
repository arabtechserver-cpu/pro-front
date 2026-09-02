import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import RegisterClient from "./RegisterClient";

export default async function Register(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return <RegisterClient lang={params.lang} dict={dict} />;
}
