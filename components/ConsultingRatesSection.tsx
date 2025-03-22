"use client";

import React from 'react';
import { CheckIcon, ZapIcon, ShieldCheckIcon, RocketIcon, CoinsIcon } from 'lucide-react';

// Define the service offerings with their details
const serviceOfferings = [
  {
    title: "Hourly Consultation",
    price: "$175",
    unit: "per hour",
    description: "Expert guidance on AI security integration and cybersecurity architecture.",
    features: [
      "One-on-one video consultation",
      "Security architecture assessment",
      "AI integration strategy",
      "Technical recommendation report",
      "Follow-up email support"
    ],
    cta: "Book a Session",
    highlighted: false,
    icon: <ZapIcon className="h-10 w-10 text-primary" />
  },
  {
    title: "Project-Based Engagement",
    price: "$150",
    unit: "per hour",
    description: "Comprehensive support for medium to large-scale projects with dedicated attention.",
    features: [
      "Minimum 20-hour engagement",
      "Full security architecture design",
      "AI system implementation support",
      "Regular progress meetings",
      "30-day post-project support"
    ],
    cta: "Discuss Your Project",
    highlighted: true,
    icon: <RocketIcon className="h-10 w-10 text-primary" />
  },
  {
    title: "Retainer Services",
    price: "$125",
    unit: "per hour",
    description: "Ongoing expert support with priority access for enterprise clients.",
    features: [
      "Minimum 40 hours per month",
      "Dedicated support channel",
      "Emergency incident response",
      "Monthly security assessments",
      "Executive briefings"
    ],
    cta: "Explore Retainer Options",
    highlighted: false,
    icon: <ShieldCheckIcon className="h-10 w-10 text-primary" />
  }
];

// Define value proposition items
const valuePropositions = [
  {
    title: "AI-Driven Security Solutions",
    description: "Leverage advanced machine learning algorithms for predictive threat detection and intelligent automated response systems that outperform traditional security measures."
  },
  {
    title: "Zero Trust Architecture",
    description: "Implement industry-leading zero trust security frameworks that protect critical systems across AWS, Azure, and GCP with FedRAMP and NIST compliance standards."
  },
  {
    title: "Dual Expertise Advantage",
    description: "Benefit from the rare combination of AI engineering and cybersecurity architecture expertise—skills typically requiring separate consultants at higher combined costs."
  },
  {
    title: "Enterprise-Grade Implementation",
    description: "Access the same advanced security methodologies developed for Fortune 500 companies and government agencies, tailored to your organization's specific needs."
  }
];

const ConsultingRatesSection = () => {
  return (
    <section className="py-16 relative z-20">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-2 text-foreground">
            Premium AI Security Consultation
          </h2>
          <p className="max-w-[800px] mx-auto text-foreground/80">
            Access specialized expertise combining advanced AI engineering and enterprise cybersecurity architecture—a rare 
            skillset that strengthens your organization's security posture while accelerating AI implementation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {serviceOfferings.map((service, idx) => (
            <div 
              key={idx} 
              className={`
                relative
                bg-card/80 backdrop-blur-lg border rounded-lg overflow-hidden shadow-sm
                transition-all duration-300 hover:shadow-lg group
                ${service.highlighted ? 'border-primary shadow-md scale-105 md:scale-105' : 'border-border/40 hover:border-primary/50'}
              `}
              style={{
                transform: service.highlighted ? undefined : `perspective(1000px) rotateX(${idx % 2 === 0 ? '1deg' : '-1deg'})`,
                transformStyle: 'preserve-3d',
              }}
            >
              {service.highlighted && (
                <div className="absolute top-0 inset-x-0 h-2 bg-primary rounded-t-lg"></div>
              )}
              
              <div className="p-6">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-foreground">{service.price}</span>
                  <span className="ml-1 text-foreground/70">{service.unit}</span>
                </div>
                
                <p className="text-foreground/70 text-sm mb-6">
                  {service.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary shrink-0 mr-2 mt-0.5" />
                      <span className="text-foreground/90 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`
                    w-full py-2.5 rounded-md font-medium transition-colors
                    ${service.highlighted 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'}
                  `}
                >
                  {service.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Value Proposition Section */}
        <div className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-lg p-8 mb-10">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Why Work With a Senior AI Security Expert?
            </h3>
            <p className="text-foreground/80 max-w-[700px] mx-auto">
              As a CISSP-certified cybersecurity architect with extensive AI engineering experience at companies like Everbridge and Warner Bros. Discovery, I deliver 
              enterprise-grade security solutions that integrate cutting-edge AI capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valuePropositions.map((value, idx) => (
              <div key={idx} className="flex">
                <div className="mr-4 mt-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{value.title}</h4>
                  <p className="text-foreground/70 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call To Action */}
        <div className="text-center">
          <div className="inline-flex items-center mb-3 text-foreground/90">
            <CoinsIcon className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Custom engagement packages available for enterprise clients and specialized requirements</span>
          </div>
          <div>
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
            >
              Schedule a Strategy Session
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultingRatesSection; 