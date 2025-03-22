"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const HeroSection = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we only render theme-dependent elements after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/tylerfeldstein',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/tylerfeldstein',
      icon: (
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    },
    // {
    //   name: 'Twitter',
    //   url: 'https://twitter.com/username',
    //   icon: (
    //     <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    //       <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
    //     </svg>
    //   )
    // }
  ];

  // Keywords for SEO optimization - for static rendering
  const seoKeywords = [
    "AI Engineer", "Cybersecurity Architect", "Cloud Security", "CISSP", "Zero Trust", 
    "Machine Learning", "Threat Detection", "DevSecOps", "AWS", "Azure", "GCP"
  ];

  return (
    <section className="relative pt-24 pb-24 overflow-hidden" id="home">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter mb-4 text-foreground">
              Tyler Feldstein
            </h1>
            <h2 className="text-2xl mb-6 text-foreground/90">
              <span className="font-semibold">Cybersecurity Architect</span> & <span className="font-semibold">AI Engineer</span>
            </h2>

            {/* Static SEO content - no client-side hydration issues */}
            <div className="hidden" aria-hidden="true">
              <h2>CISSP Certified Cybersecurity Architect and AI Engineer</h2>
              <h3>Expert in Zero Trust, Cloud Security, Machine Learning for Threat Detection</h3>
              {seoKeywords.map((keyword, index) => (
                <span key={`seo-${index}`}>{keyword}</span>
              ))}
            </div>
            
            <p className="text-lg mb-4 text-foreground/80 max-w-[600px]">
              CISSP-certified cybersecurity leader with proven expertise in AI-driven security solutions, zero trust architecture, and cloud security across AWS, Azure, and GCP environments.
            </p>
            
            <p className="text-lg mb-8 text-foreground/80 max-w-[600px]">
              I architect and implement advanced security frameworks leveraging machine learning for threat detection, automate security operations (SOAR), and design resilient cloud infrastructures that meet stringent compliance requirements including FedRAMP, NIST, and ISO 27001.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "ML/AI", "SOAR", "Zero Trust", "CISSP", "DevSecOps"].map((tag, idx) => (
                <span key={`tag-${idx}`} className="px-3 py-1 bg-secondary/15 text-foreground/90 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="flex gap-4 mb-8">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-foreground transition-colors"
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href="#experience" 
                className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-md hover:bg-secondary/90 transition-colors"
              >
                View Experience
              </a>
              <a 
                href="#contact" 
                className="bg-foreground/10 text-foreground px-6 py-2.5 rounded-md hover:bg-foreground/20 transition-colors border border-foreground/20"
              >
                Contact Me
              </a>
            </div>
          </div>
          
          <div className="relative">
            {/* Outer circular container for the gradient ring */}
            <div className="aspect-square gradient-ring">
              {/* Main circular gradient ring */}
              <div className="absolute inset-[-5%] rounded-full conic-gradient-ring animate-rotate-slow" 
                style={{ 
                  filter: 'blur(12px)', 
                  zIndex: 1,
                  background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.9), rgba(79, 70, 229, 0.9), rgba(147, 51, 234, 0.9), rgba(236, 72, 153, 0.9), rgba(59, 130, 246, 0.9))'
                }} 
              />
              
              {/* Secondary spinning gradient for more dimension */}
              <div className="absolute inset-[-3%] rounded-full conic-gradient-ring animate-rotate-slow-reverse opacity-80" 
                style={{ 
                  filter: 'blur(8px)',
                  transform: 'rotate(90deg)',
                  zIndex: 1,
                  background: 'conic-gradient(from 90deg, rgba(236, 72, 153, 0.9), rgba(147, 51, 234, 0.9), rgba(79, 70, 229, 0.9), rgba(59, 130, 246, 0.9), rgba(236, 72, 153, 0.9))'
                }} 
              />
              
              {/* Enhanced glow around the ring */}
              <div className="absolute inset-[-2%] rounded-full bg-white/5" style={{ filter: 'blur(20px)', zIndex: 1 }} />
              
              {/* Light spots to enhance the ring effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden" style={{ zIndex: 1 }}>
                <div className="absolute w-[80%] h-[80%] top-[-10%] right-[-10%] rounded-full bg-white/8 animate-refraction" style={{ filter: 'blur(20px)' }} />
                <div className="absolute w-[60%] h-[60%] bottom-[-5%] left-[-5%] rounded-full bg-white/8 animate-refraction-reverse" style={{ filter: 'blur(15px)' }} />
              </div>
              
              {/* Photo container - positioned above the gradient ring */}
              <div className="absolute inset-[5%] flex items-center justify-center rounded-full" style={{ zIndex: 3 }}>
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                  {mounted && (
                    <Image 
                      src="/photos/DSC00379-min.JPG"
                      alt="Tyler Feldstein - AI Engineer and Cybersecurity Architect specializing in machine learning for threat detection and zero trust architecture"
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                  
                  {/* Glass shimmer effect over the photo */}
                  <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div 
                      className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] opacity-60"
                      style={{
                        background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%)',
                        animation: 'random-shimmer 8s ease-in-out infinite',
                        zIndex: 10
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Add a subtle highlight rim to emphasize the ring underneath */}
              <div className="absolute inset-[4%] rounded-full" style={{ 
                boxShadow: '0 0 25px 3px rgba(255, 255, 255, 0.1), 0 0 10px 1px rgba(255, 255, 255, 0.05) inset',
                zIndex: 2
              }} />
              
              {/* Additional glass shimmer effect over the entire circle */}
              <div className="absolute inset-0 overflow-hidden rounded-full" style={{ zIndex: 4 }}>
                <div 
                  className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] opacity-30"
                  style={{
                    background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%)',
                    animation: 'random-shimmer-reverse 12s ease-in-out infinite',
                    zIndex: 4
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient fade to black at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"></div>
    </section>
  );
};

export default HeroSection; 