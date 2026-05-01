import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { About } from "@/sections/About";
import { FAQ } from "@/sections/FAQ";
import { Features } from "@/sections/Features";
import { Hero } from "@/sections/Hero";
import { HowItWorks } from "@/sections/HowItWorks";
import { Pricing } from "@/sections/Pricing";
import { Testimonials } from "@/sections/Testimonials";
import { WaitlistCTA } from "@/sections/WaitlistCTA";

// ── Landing Page ──────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <About />
      <FAQ />
      <WaitlistCTA />
      <Footer />
    </div>
  );
}
