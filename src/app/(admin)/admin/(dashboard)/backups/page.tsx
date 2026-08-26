import BackupsClient from "./BackupsClient";

export const metadata = {
  title: "النسخ الاحتياطي | لوحة التحكم",
};

export default function AdminBackupsPage() {
  return <BackupsClient />;
}
