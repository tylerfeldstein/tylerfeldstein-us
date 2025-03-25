"use client";

import React from 'react';
import { ZapIcon, ClockIcon, BriefcaseIcon, SquareArrowUpIcon } from 'lucide-react';
import HeroFeatures from './HeroFeatures';
import PricingCard from './PricingCard';
import AnimatedBackground from './AnimatedBackground';
import TestimonialsSlider from './TestimonialsSlider';
import PricingCta from './PricingCta';

// Define the pricing tiers with their details
const pricingTiers = [
  {
    id: 'ad-hoc',
    title: "Ad-Hoc Hourly",
    price: "$200 – $250",
    unit: "per hour",
    description: "Ideal for immediate or short-term needs requiring rapid, high-value expertise.",
    features: [
      "Flexible, On-Demand Support: Engage quickly without long-term commitments.",
      "Priority Scheduling: Rapid response for emergency incidents, critical reviews, or urgent fixes.",
      "Minimal Overhead: Simple hourly billing, easy to scale up or down as needed."
    ],
    useCases: [
      "Emergency incident response or threat assessments",
      "Quick code or architecture reviews",
      "Immediate DevSecOps or AI prototype troubleshooting"
    ],
    cta: "Request Consultation",
    highlighted: false,
    icon: <ZapIcon size={28} />
  },
  {
    id: 'contract',
    title: "Contract-Length Hourly",
    price: "$180 – $220",
    unit: "per hour",
    description: "Suited for longer engagements with a defined contract length, offering a slightly reduced rate.",
    features: [
      "Predictable Collaboration: Guaranteed resource availability over an extended period.",
      "Discounted Hourly Rate: Reward for committing to a longer relationship or multi-phase project.",
      "Deeper Partnership: Opportunity to embed into the client's team and processes for ongoing improvements."
    ],
    useCases: [
      "Security transformations over multiple sprints",
      "Continuous AI/ML development and integration",
      "Cloud migration or compliance projects spanning several months"
    ],
    cta: "Request Contract Quote",
    highlighted: true,
    badge: "Popular",
    icon: <ClockIcon size={28} />
  },
  {
    id: 'special-project',
    title: "Special Project (Hourly)",
    price: "TBD",
    priceNote: "typically $170 – $210 range",
    unit: "per hour",
    description: "For large or specialized initiatives requiring a tailored hourly agreement and detailed scope.",
    features: [
      "Custom Scope & Deliverables: Flexible scoping for unique or highly complex projects.",
      "Milestone-Driven: Align payments and progress checks with project milestones.",
      "Specialized Expertise: Focus on advanced security, AI workflows, or full-stack development tasks that require deeper planning."
    ],
    useCases: [
      "Comprehensive platform rebuilds involving Next.js and security modernization",
      "Advanced AI-driven threat detection pipeline set-ups",
      "Multi-cloud infrastructure overhauls requiring high-level architecture design"
    ],
    cta: "Discuss Your Project",
    highlighted: false,
    icon: <BriefcaseIcon size={28} />
  },
  {
    id: 'retainer',
    title: "Retainer",
    price: "$10,000 – $20,000",
    unit: "per month",
    description: "Pre-purchased hours at a discount with guaranteed monthly availability and priority service.",
    features: [
      "Reserved Capacity: 50-100 hours pre-allocated monthly, use as needed across projects.",
      "Priority Response: 24-48 hour availability for critical needs with direct communication channel.",
      "Strategic Partnership: Regular check-ins and proactive recommendations beyond reactive support."
    ],
    useCases: [
      "Ongoing technical leadership without full-time executive hire costs",
      "Consistent security oversight with rapid incident response capability",
      "Long-term AI/ML product development requiring regular expert input"
    ],
    cta: "Explore Retainer Options",
    highlighted: false,
    icon: <SquareArrowUpIcon size={28} />
  }
];

const ConsultingRatesSection = () => {
  return (
    <section id="pricing" className="py-24 pb-0 relative z-20 overflow-hidden">
      {/* Animated background effects */}
      <AnimatedBackground />
      
      <div className="container px-4 md:px-6 mx-auto relative z-10">
        {/* Hero features section */}
        <HeroFeatures />
        
        {/* Pricing cards heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/70">
            Choose Your Service Level
          </h2>
          <p className="max-w-[800px] mx-auto text-foreground/80 text-lg md:text-xl">
            Flexible engagement options to match your specific needs and project requirements
          </p>
        </div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-24">
          {pricingTiers.map((tier, idx) => (
            <PricingCard 
              key={tier.id}
              id={tier.id}
              title={tier.title}
              price={tier.price}
              priceNote={tier.priceNote}
              unit={tier.unit}
              description={tier.description}
              features={tier.features}
              useCases={tier.useCases}
              cta={tier.cta}
              highlighted={tier.highlighted}
              badge={tier.badge}
              icon={tier.icon}
              index={idx}
            />
          ))}
        </div>
        
        {/* Testimonials section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-foreground">
              What Others Are Saying
            </h2>
            <p className="max-w-[700px] mx-auto text-foreground/80">
              Read about the experiences of others that have benefited from expertise
            </p>
          </div>
          
          <TestimonialsSlider />
        </div>
        
        {/* Call to action - Adjusted margin to reduce extra space */}
        <PricingCta />
      </div>
    </section>
  );
};

export default ConsultingRatesSection; 