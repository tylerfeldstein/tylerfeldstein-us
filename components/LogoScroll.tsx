"use client";

import React, { useCallback, useState, useEffect } from 'react';
import Image from 'next/image';

// Animation container for continuous scrolling effect
const InfiniteMovingCards = ({ 
  items, 
  direction = "left", 
  speed = "slow", 
  pauseOnHover = true,
  className 
}: {
  items: { name: string; logo: React.ReactNode }[];
  direction?: "left" | "right";
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  // Calculate animation duration based on speed - wrapped in useCallback to avoid dependencies warning
  const getSpeed = useCallback(() => {
    switch (speed) {
      case "slow":
        return 40;
      case "normal":
        return 25;
      case "fast":
        return 15;
      default:
        return 40;
    }
  }, [speed]);

  React.useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    
    const scrollerContent = Array.from(scrollerRef.current.children);
    
    // Add duplicates to create seamless loop
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      if (scrollerRef.current) {
        scrollerRef.current.appendChild(duplicatedItem);
      }
    });

    const animationDirection = direction === "left" ? "normal" : "reverse";
    
    // Set animation
    const animation = scrollerRef.current.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(${direction === "left" ? "-" : ""}${scrollerContent.length * 100}%)` },
      ],
      {
        iterations: Infinity,
        duration: scrollerContent.length * getSpeed() * 1000,
        direction: animationDirection,
      }
    );
    
    // Pause on hover if enabled
    if (pauseOnHover) {
      containerRef.current.addEventListener("mouseenter", () => {
        animation.pause();
      });
      
      containerRef.current.addEventListener("mouseleave", () => {
        animation.play();
      });
    }

    return () => {
      animation.cancel();
    };
  }, [direction, pauseOnHover, speed, getSpeed]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
    >
      <ul
        ref={scrollerRef}
        className="flex min-w-full gap-16 md:gap-24 py-6"
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center justify-center flex-shrink-0 w-[180px] md:w-[240px] p-4 hover:scale-110 transition-transform duration-300"
          >
            <div className="flex items-center justify-center w-full h-full bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              {item.logo}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main component
const LogoScroll = () => {
  const [, setMounted] = useState(false);
  
  // Only enable theme detection after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);
  


  // Company logos from resume
  const companies = [
    {
      name: "Everbridge",
      logo: (
        <Image 
          src="/companies/everbridge.png" 
          alt="Everbridge - Company where Tyler Feldstein applied AI security expertise" 
          width={180} 
          height={72} 
          className="object-contain h-18" 
        />
      )
    },
    {
      name: "Warner Bros. Discovery",
      logo: (
        <Image 
          src="/companies/Warner_Bros._Discovery.png" 
          alt="Warner Bros. Discovery - Where Tyler Feldstein worked as a Cybersecurity Architect" 
          width={180} 
          height={72} 
          className="object-contain h-18"
        />
      )
    },
    {
      name: "CACI",
      logo: (
        <Image 
          src="/companies/caci.svg" 
          alt="CACI - Where Tyler Feldstein implemented AI security solutions" 
          width={180} 
          height={72} 
          className="object-contain h-18" 
        />
      )
    },
    {
      name: "T-Mobile",
      logo: (
        <Image 
          src="/companies/tmobile.svg" 
          alt="T-Mobile - Where Tyler Feldstein developed cloud security architecture" 
          width={180} 
          height={72} 
          className="object-contain h-18"
        />
      )
    },
    {
      name: "US Army",
      logo: (
        <Image 
          src="/companies/army.png" 
          alt="US Army" 
          width={180} 
          height={72} 
          className="object-contain h-18"
        />
      )
    },
    {
      name: "Department of Defense",
      logo: (
        <Image 
          src="/companies/dod.png" 
          alt="Department of Defense" 
          width={180} 
          height={72} 
          className="object-contain h-18"
        />
      )
    }
  ];

  return (
    <section className="w-full overflow-hidden">
      <div className="py-10 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center mb-10">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-2">
              Professional Experience
            </p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
              Trusted by Industry Leaders
            </h3>
          </div>
          
          <div className="overflow-hidden w-full relative z-10">
            <InfiniteMovingCards
              items={companies}
              direction="left"
              speed="slow"
              className="py-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogoScroll; 