import React from 'react';
import HeroSection from '@/components/HeroSection';
import ExpertiseSection from '@/components/ExpertiseSection';
import ProjectsSection from '@/components/ProjectsSection';
import CtaSection from '@/components/CtaSection';
import PageSection from '@/components/PageSection';

export default function Home() {
  return (
    <main className="overflow-hidden w-full">
      <div className="heroui-gradient w-full">
        <PageSection>
          <HeroSection />
        </PageSection>
      </div>
      
      <div className="bg-black w-full">
        <PageSection>
          <ExpertiseSection />
        </PageSection>
      </div>
      
      <div className="mesh-gradient w-full">
        <PageSection>
          <ProjectsSection />
        </PageSection>
      </div>
      
      <div className="bg-black w-full">
        <PageSection>
          <CtaSection />
        </PageSection>
      </div>
    </main>
  );
}