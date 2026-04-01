'use client';

import { useState } from 'react';

import { CtaSection } from '../components/cta-section';
import { FeaturesSection } from '../components/features-section';
import { GallerySection } from '../components/gallery-section';
import { HeroSection } from '../components/hero-section';
import { HowItWorksSection } from '../components/how-it-works-section';
import { LandingFooter } from '../components/landing-footer';
import { LandingNavbar } from '../components/landing-navbar';
import { LoginDialog, type LoginMode } from '../components/login-dialog';

export function LandingScreen() {
  const [loginMode, setLoginMode] = useState<LoginMode>(null);

  const onLoginClick = (mode: LoginMode) => setLoginMode(mode);

  return (
    <div className="bg-background min-h-screen">
      <LandingNavbar onLoginClick={onLoginClick} />
      <main>
        <HeroSection onLoginClick={onLoginClick} />
        <FeaturesSection />
        <HowItWorksSection />
        <GallerySection />
        <CtaSection onLoginClick={onLoginClick} />
      </main>
      <LandingFooter onLoginClick={onLoginClick} />
      <LoginDialog mode={loginMode} onModeChange={setLoginMode} />
    </div>
  );
}
