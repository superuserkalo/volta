import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
import { ProgressRail } from "@/components/chrome/ProgressRail";
import { StoryDriver } from "@/components/chrome/StoryDriver";
import { Control } from "@/components/sections/Control";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Lab } from "@/components/sections/Lab";
import { Power } from "@/components/sections/Power";
import { Pressure } from "@/components/sections/Pressure";
import { Quote } from "@/components/sections/Quote";
import { Repair } from "@/components/sections/Repair";
import { Specs } from "@/components/sections/Specs";
import { Temperature } from "@/components/sections/Temperature";

export default function Home() {
  return (
    <>
      <StoryDriver />
      <Header />
      <ProgressRail />
      <main className="relative">
        <Hero />
        <Specs />
        <Pressure />
        <Temperature />
        <Control />
        <Power />
        <Repair />
        <Lab />
        <Quote />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
