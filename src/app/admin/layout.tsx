import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel INNOVA" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-navy-950 text-white">{children}</div>;
}
