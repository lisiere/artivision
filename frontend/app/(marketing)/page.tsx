import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/marketing/Hero";
import { LogosStrip } from "@/components/marketing/LogosStrip";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PricingTeaser } from "@/components/marketing/PricingTeaser";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <LogosStrip />
        <Features />
        <HowItWorks />
        <PricingTeaser />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
