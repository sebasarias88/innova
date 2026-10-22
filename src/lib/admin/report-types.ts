/** Shape returned by public.admin_sales_report. */
export type SalesReport = {
  summary: {
    orders: number;
    sales_count: number;
    sales_total: number;
    products_total: number;
    shipping_total: number;
    avg_ticket: number;
    units: number;
    pending_count: number;
    pending_total: number;
    cancelled_count: number;
    online_total: number;
    whatsapp_total: number;
  };
  series: { bucket: string; orders: number; sales: number; total: number }[];
  products: { name: string; units: number; total: number }[];
  categories: { name: string; units: number; total: number }[];
  payment_methods: { method: string; count: number; total: number }[];
  zones: { name: string; count: number; total: number }[];
  cities: { name: string; count: number; total: number }[];
  statuses: { status: string; count: number }[];
  bookings: { total: number; confirmed: number; pending: number; cancelled: number; services: { service: string; count: number }[] };
};
