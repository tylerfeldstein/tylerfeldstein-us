"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CalendarDays, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const ctaPoints = [
  "Free 30-minute consultation to assess your needs",
  "Customized strategy proposal within 48 hours",
  "Flexible start times to align with your schedule",
  "No long-term contracts required for initial engagements"
];

const PricingCta = () => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  
  // Handle contact button click based on authentication state
  const handleContactClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (isLoaded) {
      if (isSignedIn) {
        // User is signed in, navigate directly to messages
        router.push('/messages');
      } else {
        // User is not signed in, show sign-in modal with return URL
        router.push('/?showSignIn=true&returnTo=/messages');
      }
    }
  };
  
  return (
    <div className="relative overflow-hidden rounded-3xl mb-0">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10 opacity-100"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary),0.1)_90%,transparent_90%)]"></div>
      
      {/* Grid pattern */}
      {/* <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:40px_40px]"></div> */}
      
      {/* Content container */}
      <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
          {/* Left side: Heading and subtext */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles size={16} className="text-primary" />
              <span>Limited Availability</span>
            </motion.div>
            
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold mb-4 text-foreground"
            >
              Ready to transform your security and AI operations?
            </motion.h3>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-foreground/80 mb-6 text-base"
            >
              Schedule your strategy session today to discuss your specific needs and discover how you can leverage enterprise-grade AI security expertise for your organization.
            </motion.p>
            
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3,
                  }
                }
              }}
              className="space-y-2 mb-6"
            >
              {ctaPoints.map((point, idx) => (
                <motion.li
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: "spring", stiffness: 300, damping: 24 } 
                    }
                  }}
                  className="flex items-center space-x-2 text-sm"
                >
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span className="text-foreground/90">{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
          
          {/* Right side: Call to action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card/90 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-lg w-full md:max-w-md"
          >
            <h4 className="text-xl font-bold mb-4 text-foreground">
              Book Your Strategy Session
            </h4>
            
            <p className="text-foreground/70 text-sm mb-6">
              Sessions are filling up quickly. Secure your spot now to discuss your needs and explore possible collaboration.
            </p>
            
            <div className="flex flex-col space-y-4">
              <Button size="lg" className="w-full group py-6" onClick={handleContactClick}>
                <CalendarDays className="mr-2 h-5 w-5" />
                <span>Schedule Meeting</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <Button variant="outline" size="lg" className="w-full group py-6" onClick={handleContactClick}>
                <span>Request Custom Quote</span>
              </Button>
            </div>
            
            <p className="text-xs text-center text-foreground/50 mt-4">
              No obligation. Cancel or reschedule anytime.
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Animated accents */}
      <motion.div
        className="absolute top-0 right-0 w-[150px] h-[150px] bg-primary/10 rounded-full blur-[50px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-24 w-[100px] h-[100px] bg-secondary/10 rounded-full blur-[40px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

export default PricingCta; 