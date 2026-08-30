import OrdersClient from "./OrdersClient";

export const metadata = {
  title: "الطلبات | لوحة التحكم",
};

export default function AdminOrdersPage() {
  return <OrdersClient />;
}
