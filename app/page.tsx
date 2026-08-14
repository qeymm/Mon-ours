import Image from "next/image";
import Hero from "@/app/components/Hero";
import Testimonials from "./components/Testimonials";
import HowItWorks from "./components/HowItWorks";
import BecomeSellerCTA from "./components/BecomeSellerCTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks></HowItWorks>
      <Testimonials></Testimonials>
      <BecomeSellerCTA></BecomeSellerCTA>
      {/* rest of homepage content, if any */}
    </main>
  );
}
