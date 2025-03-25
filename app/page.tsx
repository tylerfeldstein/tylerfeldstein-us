import React from 'react';
import HeroSection from '@/components/HeroSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ProjectsSection from '@/components/ProjectsSection';
import CtaSection from '@/components/CtaSection';
import PageSection from '@/components/PageSection';
import LogoScroll from '@/components/LogoScroll';
import CareerSections from '@/components/CareerSections';
import ConsultingRatesSection from '@/components/ConsultingRatesSection';
import JsonLdSchema, { createPersonSchema, createWebsiteSchema } from '@/components/JsonLdSchema';
import SignInModal from './components/SignInModal';
import { Metadata } from 'next';

// Additional metadata for the home page
export const metadata: Metadata = {
  title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect | Home",
  description: "Portfolio of Tyler Feldstein, AI security expert specializing in machine learning for threat detection, zero trust architecture, and cloud security implementations across AWS, Azure, and GCP.",
  keywords: "AI Engineer, Cybersecurity Architect, AI Security Expert, Machine Learning Engineer, Cloud Security, Zero Trust Architecture, CISSP",
};

export default function Home() {
  return (
    <main className="overflow-hidden w-full">
      {/* Handle sign-in modal */}
      <SignInModal />
      
      {/* SEO - JSON-LD Structured Data */}
      <JsonLdSchema data={createPersonSchema()} />
      <JsonLdSchema data={createWebsiteSchema()} />
      
      {/* Hero section with counter gradient */}
      <div id="home" className="w-full relative z-10">
        <PageSection className="relative z-10">
          <HeroSection />
        </PageSection>
      </div>
      
      {/* Logo scroll is now positioned with negative margin to overlap with hero section */}
      <div className="w-full relative z-20 mt-[-2vw]">
        <LogoScroll />
      </div>
      
      {/* Expertise section with counter gradient */}
      <div id="about" className="w-full relative z-20 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)] py-50">
          <ExpertiseSection />
        </PageSection>
      </div>
      
      {/* Projects section with counter gradient */}
      <div id="skills" className="w-full relative z-30 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)] py-50">
          <ProjectsSection />
        </PageSection>
      </div>
      
      {/* Career Sections component with Apple-style scrolling */}
      <div id="experience" className="w-full relative z-35 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)] py-50">
          <CareerSections />
        </PageSection>
      </div>
      
      {/* Consulting Rates Section */}
      <div id="consulting" className="w-full relative z-38 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)] pb-0">
          <ConsultingRatesSection />
        </PageSection>
      </div>
      
      {/* CTA section with counter gradient */}
      <div id="contact" className="w-full relative z-40">
        <PageSection className="relative z-10 pt-0">
          <CtaSection />
        </PageSection>
      </div>
    </main>
  );
}