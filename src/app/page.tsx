"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ApplicationFlow from "@/components/ApplicationFlow";
import Architecture from "@/components/Architecture";
import TerminalDemo from "@/components/TerminalDemo";
import FeatureCards from "@/components/FeatureCards";
import TechStack from "@/components/TechStack";
import DesignDecisions from "@/components/DesignDecisions";
import Roadmap from "@/components/Roadmap";
import FeedbackCTA from "@/components/FeedbackCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ApplicationFlow />
      <Architecture />
      <TerminalDemo />
      <FeatureCards />
      <TechStack />
      <DesignDecisions />
      <Roadmap />
      <FeedbackCTA />
      <Footer />
    </main>
  );
}
