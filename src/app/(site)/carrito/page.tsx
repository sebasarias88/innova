import type { Metadata } from "next";
import { getShippingOptions } from "@/lib/shop/queries";
import { wompiConfig } from "@/lib/payments/wompi";
import { Checkout } from "./Checkout";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: true },
};

// Shipping zones can change from the admin panel at any time.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const shipping = await getShippingOptions();
  return (
    <section className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Tu carrito</h1>
        <div className="mt-8">
          <Checkout shipping={shipping} onlinePayments={wompiConfig() !== null} />
        </div>
      </div>
    </section>
  );
}
