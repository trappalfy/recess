import { Hero } from "@/components/sections/Hero";
import { HeroMobile } from "@/components/sections/HeroMobile";
import { Features } from "@/components/sections/Features";
import { BlueSection } from "@/components/sections/BlueSection";
import { Solution } from "@/components/sections/Solution";
import { Showcase } from "@/components/sections/Showcase";
import { Cta } from "@/components/sections/Cta";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <HeroMobile />
      <Features />
      <BlueSection>
        <Solution />
        <Showcase />
        <Cta />
        <Footer />
      </BlueSection>
    </main>
  );
}
