import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getShippingOptions, getSiteSettings } from "@/lib/shop/queries";
import { ORDER_COOKIE } from "@/lib/payments/cookie";
import { getOrderByReference } from "@/lib/payments/orders";
import { site } from "@/lib/site";
import { wompiConfig } from "@/lib/payments/wompi";
import { Checkout } from "./Checkout";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false, follow: true },
};

// Shipping zones can change from the admin panel at any time.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const reference = (await cookies()).get(ORDER_COOKIE)?.value;
  const [shipping, settings, lastOrder] = await Promise.all([
    getShippingOptions(),
    getSiteSettings(),
    reference ? getOrderByReference(reference) : null,
  ]);
  // The customer paid online and came back to the cart (e.g. with the back button).
  const paidReference = lastOrder?.payment_status === "approved" ? lastOrder.reference : null;
  return (
    <section className="pb-20 pt-28 sm:pb-28 sm:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Tu carrito</h1>
        <div className="mt-8">
          <Checkout
            shipping={shipping}
            onlinePayments={wompiConfig() !== null}
            paidReference={paidReference}
            whatsapp={settings?.whatsapp ?? site.phone.raw}
          />
        </div>
      </div>
    </section>
  );
}
