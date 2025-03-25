"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  id: string;
  title: string;
  price: string;
  priceNote?: string;
  unit: string;
  description: string;
  features: string[];
  useCases: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
  icon: React.ReactNode;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring", 
      mass: 0.8,
      damping: 20,
      stiffness: 100,
      delay: i * 0.15,
    }
  }),
  hover: {
    y: -8,
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      delay: i * 0.05,
    }
  })
};

const PricingCard = ({
  id,
  title,
  price,
  priceNote,
  unit,
  description,
  features,
  useCases,
  cta,
  highlighted = false,
  badge,
  icon,
  index
}: PricingCardProps) => {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Parse features to get title and description
  const parsedFeatures = features.map(feature => {
    const [title, description] = feature.split(': ');
    return { title, description };
  });

  // Parse use cases
  const parsedUseCases = useCases.map(useCase => ({
    text: useCase
  }));

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

  // Colors for highlighted and non-highlighted cards
  const baseColors = highlighted 
    ? "bg-gradient-to-br from-[#243c5a] to-[#0f172a] text-white" 
    : "bg-white text-[#1e293b]";
    
  const headerBgColor = highlighted 
    ? "bg-[#0f172a]/40"
    : "bg-[#f1f5f9]";
    
  const accentColor = highlighted
    ? "from-[#38bdf8] to-[#6366f1]"
    : "from-[#6366f1] to-[#4f46e5]";  

  // Format price to display single rate with starting rate notation
  const formattedPrice = price.includes("–") || price.includes("-") 
    ? price.split(/–|-/)[0].trim()
    : price;

  return (
    <motion.div
      className="relative w-full h-full flex flex-col"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      whileHover="hover"
    >
      <div className={cn(
        "flex flex-col h-full overflow-hidden rounded-2xl",
        "border shadow-lg",
        baseColors,
        highlighted ? "border-[#38bdf8]/40" : "border-[#e2e8f0]"
      )}>
        {/* Badge */}
        {badge && (
          <div className="absolute top-4 right-4 z-10">
            <Badge 
              className={cn(
                "bg-gradient-to-r font-medium px-3 py-1 rounded-full text-white",
                `bg-gradient-to-r ${accentColor}`
              )}
            >
              {badge}
            </Badge>
          </div>
        )}

        {/* Card Header */}
        <div className={cn(
          "p-6 relative",
          headerBgColor
        )}>
          {/* Icon */}
          <div className="h-16 flex items-start">
            <motion.div
              className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl",
                highlighted ? "bg-white/10 text-white" : "bg-gradient-to-r from-[#6366f1]/10 to-[#4f46e5]/10 text-[#4f46e5]"
              )}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {icon}
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold h-8 flex items-center">
            {title}
          </h3>

          {/* Price Section - Fixed Height */}
          <div className="h-24 flex flex-col justify-center my-2">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl font-extrabold",
                highlighted ? "text-white" : "bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#6366f1]"
              )}>
                {formattedPrice}
              </span>
              {unit && (
                <span className="text-base opacity-80">{unit}</span>
              )}
            </div>
            <span className="text-sm opacity-70 block mt-1">
              {price.includes("–") || price.includes("-") ? "starting rate" : priceNote}
            </span>
          </div>

          {/* Description - Fixed Height */}
          <div className="h-24 overflow-hidden">
            <p className="opacity-80 text-base line-clamp-3">
              {description}
            </p>
          </div>

          {/* CTA Button in Header */}
          <div className="mt-4">
            <Button
              onClick={handleContactClick}
              className={cn(
                "w-full group relative overflow-hidden font-medium text-base rounded-xl py-5", 
                highlighted
                  ? "bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-white hover:shadow-lg hover:shadow-[#38bdf8]/20"
                  : "bg-gradient-to-r from-[#6366f1] to-[#4f46e5] text-white hover:shadow-lg hover:shadow-[#6366f1]/20"
              )}
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {cta}
                <motion.div
                  initial={{ x: -5, opacity: 0.8 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ repeat: Infinity, repeatType: "mirror", duration: 0.8 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </span>
              <motion.div 
                className={cn(
                  "absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-r",
                  highlighted ? "from-[#6366f1] to-[#38bdf8]" : "from-[#4f46e5] to-[#6366f1]"
                )}
                initial={{ x: "100%" }}
                whileHover={{ x: "0%" }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              />
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="p-6 flex-grow">
          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Features */}
            <div>
              <h4 className={cn(
                "text-sm font-medium h-8 flex items-center",
                highlighted ? "text-white/80" : "text-[#64748b]"
              )}>
                <span className={cn(
                  "mr-2 h-5 w-5 rounded-full flex items-center justify-center",
                  highlighted ? "bg-white/10" : "bg-[#6366f1]/10"
                )}>
                  <Check className={cn(
                    "h-3 w-3",
                    highlighted ? "text-white" : "text-[#6366f1]"
                  )} />
                </span>
                Features & Benefits
              </h4>

              <ul className="space-y-3 min-h-[140px]">
                {parsedFeatures.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    className="flex gap-3"
                    custom={idx}
                    variants={featureVariants}
                  >
                    <Check className={cn(
                      "h-5 w-5 shrink-0 mt-0.5",
                      highlighted ? "text-[#38bdf8]" : "text-[#6366f1]"
                    )} />
                    <div>
                      <span className={cn(
                        "font-medium block",
                        highlighted ? "text-white" : "text-[#1e293b]"
                      )}>
                        {feature.title}
                      </span>
                      <span className={cn(
                        "text-sm",
                        highlighted ? "text-white/70" : "text-[#64748b]"
                      )}>
                        {feature.description}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Use Cases */}
            <div>
              <h4 className={cn(
                "text-sm font-medium h-8 flex items-center",
                highlighted ? "text-white/80" : "text-[#64748b]"
              )}>
                <span className={cn(
                  "mr-2 h-5 w-5 rounded-full flex items-center justify-center",
                  highlighted ? "bg-white/10" : "bg-[#6366f1]/10"
                )}>
                  <Check className={cn(
                    "h-3 w-3",
                    highlighted ? "text-white" : "text-[#6366f1]"
                  )} />
                </span>
                Use Cases
              </h4>

              <ul className="space-y-2 min-h-[100px]">
                {parsedUseCases.map((useCase, idx) => (
                  <motion.li
                    key={idx}
                    className="flex gap-3 items-start"
                    custom={idx}
                    variants={featureVariants}
                  >
                    <Check className={cn(
                      "h-5 w-5 shrink-0 mt-0.5",
                      highlighted ? "text-[#38bdf8]" : "text-[#6366f1]"
                    )} />
                    <span className={cn(
                      "text-sm",
                      highlighted ? "text-white/90" : "text-[#334155]"
                    )}>
                      {useCase.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative glow effect for highlighted card */}
      {highlighted && (
        <div className="absolute -z-10 inset-0 opacity-70 blur-xl rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#38bdf8]/20 to-[#6366f1]/20 rounded-3xl" />
        </div>
      )}
    </motion.div>
  );
};

export default PricingCard; 