import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { ServicesSection } from '../components/ServicesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { AboutSection } from '../components/AboutSection';
import { CTASection } from '../components/CTASection';
export function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <AboutSection />
      <CTASection />
    </>);

}