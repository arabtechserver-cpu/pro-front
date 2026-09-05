import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ProfileClient from "./ProfileClient";
import { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.lang === "ar";
  return {
    title: isAr ? "الملف الشخصي والحساب | عرب تك سيرفر" : "User Profile & Account | Arab Tech Server",
    description: isAr 
      ? "إدارة الحساب، رصيد المحفظة، سجل الطلبات، المعاملات، وإعدادات الأمان في عرب تك سيرفر"
      : "Manage account, wallet balance, order history, transactions and security settings on Arab Tech Server",
  };
}

export default async function ProfilePage(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return (
    <ProfileClient lang={params.lang} dict={dict} />
  );
}
