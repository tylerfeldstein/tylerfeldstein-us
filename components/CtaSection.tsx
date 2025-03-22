"use client";

import React from 'react';

// Social media links component
const FollowOnSocial = () => {
  return (
    <div className="flex gap-4">
      <a href="https://github.com/tylerfeldstein" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      </a>
      <a href="https://www.linkedin.com/in/tylerf1110/" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
    </div>
  );
};

const CtaSection = () => {
  return (
    <section className="bg-background dark:bg-gradient-to-b from-background/95 to-background/70 py-16 sm:py-20 border-t border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-6">
              Cyber Security Expertise
            </h2>
            <p className="text-foreground/80 text-base sm:text-lg mb-8 max-w-[600px] leading-relaxed">
              Senior security architect and full stack developer specializing in secure infrastructure, 
              DevSecOps, and AI systems. With experience securing FedRAMP-accredited environments 
              across AWS, Azure, and GCP, I design automation solutions using Terraform, Kubernetes, 
              and CI/CD pipelines. I also build AI agents and workflows to enhance security operations 
              and incident response capabilities.
            </p>
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                Follow me
              </h3>
              <FollowOnSocial />
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-foreground/5 via-foreground/10 to-foreground/5 dark:from-foreground/10 dark:via-foreground/20 dark:to-foreground/10 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative bg-background/60 dark:bg-background/30 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-border/40 shadow-sm">
              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-foreground/10 dark:bg-foreground/20 ring-1 ring-border backdrop-blur-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      Location
                    </h3>
                    <p className="mt-2 text-foreground/80">
                      Sioux Falls, SD, USA
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start mb-5">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-foreground/10 dark:bg-foreground/20 ring-1 ring-border backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        Certifications
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mt-3">
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">CISSP</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">GCIA</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">CASP+</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">CEH</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">CCNA R&S</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">VCP-NV</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">Pentest+</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">Security+</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">Network+</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">A+</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">Splunk Core</span>
                    </div>
                    <div className="flex items-center px-3 py-2 rounded-lg bg-background/70 dark:bg-background/20 backdrop-blur-sm border border-border/30 hover:bg-background/90 dark:hover:bg-background/30 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-foreground/70 mr-2"></span>
                      <span className="text-foreground">DC3 DCI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection; 