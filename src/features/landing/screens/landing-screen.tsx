'use client';

import { CtaSection } from '../components/cta-section';
import { FeaturesSection } from '../components/features-section';
import { GallerySection } from '../components/gallery-section';
import { HeroSection } from '../components/hero-section';
import { HowItWorksSection } from '../components/how-it-works-section';
import { LandingFooter } from '../components/landing-footer';
import { LandingNavbar } from '../components/landing-navbar';

export function LandingScreen() {
  return (
    <div className="bg-background min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <GallerySection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
