import React from 'react';
import HeroSection from '@/components/HeroSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ProjectsSection from '@/components/ProjectsSection';
import CtaSection from '@/components/CtaSection';
import PageSection from '@/components/PageSection';
import LogoScroll from '@/components/LogoScroll';

export default function Home() {
  return (
    <main className="overflow-hidden w-full main-gradient">
      {/* Hero section with counter gradient */}
      <div className=" w-full relative z-10">
        <PageSection className="relative z-10">
          <HeroSection />
        </PageSection>
      </div>
      
      {/* Logo scroll is now positioned with negative margin to overlap with hero section */}
      <div className=" w-full relative z-20 mt-[-2vw]">
        <LogoScroll />
      </div>
      
      {/* Expertise section with counter gradient */}
      <div className=" w-full relative z-20 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)]">
          <ExpertiseSection />
        </PageSection>
      </div>
      
      {/* Projects section with counter gradient */}
      <div className=" w-full relative z-30 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)]">
          <ProjectsSection />
        </PageSection>
      </div>
      
      {/* CTA section with counter gradient */}
      <div className=" w-full relative z-40 mt-[-2vw]">
        <PageSection className="relative z-10 pt-[calc(2vw+4rem)]">
          <CtaSection />
        </PageSection>
      </div>
    </main>
  );
}