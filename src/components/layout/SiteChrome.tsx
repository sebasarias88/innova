import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { MobileDock } from "@/components/layout/MobileDock";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AnimationGate } from "@/components/layout/AnimationGate";
import { Toaster } from "@/components/admin/Toaster";

/** Public website shell: header, footer, floating actions and smooth scroll. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-clip pb-[84px] sm:pb-0">
      <SmoothScroll>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFab />
        <MobileDock />
        <AnimationGate />
        <Toaster />
      </SmoothScroll>
    </div>
  );
}
