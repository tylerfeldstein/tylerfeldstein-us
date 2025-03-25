"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Cpu, BarChart4, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    }
  }
};

const highlightGradient = "bg-gradient-to-r from-primary/80 via-primary to-primary/80 text-primary-foreground";

interface FeatureBlockProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureBlock = ({ icon, title, description, delay = 0 }: FeatureBlockProps) => (
  <motion.div 
    className="flex flex-col p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300"
    variants={itemVariants}
    transition={{ delay }}
    whileHover={{ 
      y: -5, 
      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }}
  >
    <div className="mb-4 p-3 w-fit rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    
    <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-foreground/70 mb-4 text-sm flex-grow">{description}</p>
  </motion.div>
);

const HeroFeatures = () => {
  return (
    <div className="mb-24 relative">
      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-40 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000 pointer-events-none"></div>
      
      {/* Feature highlight section */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          {/* <Badge className="mb-3 px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20 rounded-full">
            Industry-Leading Expertise
          </Badge> */}
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground/90 to-foreground/70">
              Transform Your Security & AI
            </span>
          </h2>
          
          <p className="max-w-[800px] mx-auto text-foreground/80 text-lg md:text-xl">
            Partner with a <span className={`px-2 py-1 rounded ${highlightGradient}`}>CISSP-certified</span> security architect 
            and AI systems expert who delivers measurable results for enterprise clients.
          </p>
        </motion.div>
        
        {/* Success metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <FeatureBlock 
            icon={<ShieldCheck size={28} />}
            title="Enhanced Security"
            description="Implement enterprise-grade security frameworks that have protected Fortune 500 companies across hybrid cloud environments."
            delay={0.1}
          />
          
          <FeatureBlock 
            icon={<Zap size={28} />}
            title="AI Automation"
            description="Deploy autonomous AI agents that orchestrate critical operations, eliminating human error and accelerating response times."
            delay={0.2}
          />
          
          <FeatureBlock 
            icon={<Cpu size={28} />}
            title="System Optimization"
            description="Modernize infrastructure with intelligent, self-healing capabilities that dynamically adapt to emerging threats."
            delay={0.3}
          />
          
          <FeatureBlock 
            icon={<BarChart4 size={28} />}
            title="Cost Efficiency"
            description="Implement AI agent workflows that reduce operational overhead while enhancing security posture across all environments."
            delay={0.4}
          />
        </motion.div>
      </div>
      
      {/* Social proof banner */}
      <motion.div 
        className="relative overflow-hidden rounded-xl border border-border/30 bg-primary/5 backdrop-blur-sm p-6 md:p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.8,
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-80"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold mb-2 text-foreground">Trusted by Industry Leaders</h3>
            <p className="text-foreground/70">
              Join organizations like <span className="font-semibold text-foreground">Everbridge</span>, <span className="font-semibold text-foreground">Warner Bros. Discovery</span>, 
              and <span className="font-semibold text-foreground">T-Mobile</span> who have transformed their security and AI operations.
            </p>
          </div>
          
          <div className="flex justify-start md:justify-end items-center space-x-6 md:space-x-8">
            <motion.div 
              className="flex items-center" 
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="font-semibold text-foreground">NIST</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center" 
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="font-semibold text-foreground">FedRAMP</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center" 
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="font-semibold text-foreground">ISO 27001</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center" 
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
              <span className="font-semibold text-foreground">SOC 2</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroFeatures; 