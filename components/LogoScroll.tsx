"use client";

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';

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

  // Calculate animation duration based on speed
  const getSpeed = () => {
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
  };

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
  }, [direction, pauseOnHover, speed]);

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
            <div className="flex items-center justify-center w-full h-full">
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
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Company logos from resume
  const companies = [
    {
      name: "Everbridge",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src={isDarkMode ? "/companies/everbridge_dark.svg" : "/companies/everbridge.png"} 
              alt="Everbridge - Company where Tyler Feldstein applied AI security expertise" 
              width={180} 
              height={72} 
              className="object-contain h-18 filter hover:drop-shadow-md" 
            />
          </div>
        </div>
      )
    },
    {
      name: "Warner Bros. Discovery",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src="/companies/Warner_Bros._Discovery.png" 
              alt="Warner Bros. Discovery - Where Tyler Feldstein worked as a Cybersecurity Architect" 
              width={180} 
              height={72} 
              className={`object-contain h-18 filter hover:drop-shadow-md ${isDarkMode ? 'brightness-0 invert' : ''}`}
            />
          </div>
        </div>
      )
    },
    {
      name: "CACI",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src={isDarkMode ? "/companies/caci_dark.svg" : "/companies/caci.svg"} 
              alt="CACI - Where Tyler Feldstein implemented AI security solutions" 
              width={180} 
              height={72} 
              className="object-contain h-18 filter hover:drop-shadow-md" 
            />
          </div>
        </div>
      )
    },
    {
      name: "T-Mobile",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src="/companies/tmobile.svg" 
              alt="T-Mobile - Where Tyler Feldstein developed cloud security architecture" 
              width={180} 
              height={72} 
              className={`object-contain h-18 filter hover:drop-shadow-md ${isDarkMode ? 'brightness-0 invert' : ''}`}
            />
          </div>
        </div>
      )
    },
    {
      name: "US Army",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src="/companies/army.png" 
              alt="US Army" 
              width={180} 
              height={72} 
              className={`object-contain h-18 filter hover:drop-shadow-md ${isDarkMode ? 'brightness-0 invert' : ''}`}
            />
          </div>
        </div>
      )
    },
    {
      name: "Department of Defense",
      logo: (
        <div className="flex items-center justify-center h-18 w-auto opacity-80 hover:opacity-100 transition-all duration-300 ease-in-out">
          <div className="bg-white/70 p-4 rounded-md shadow-sm">
            <Image 
              src="/companies/dod.png" 
              alt="Department of Defense" 
              width={180} 
              height={72} 
              className={`object-contain h-18 filter hover:drop-shadow-md ${isDarkMode ? 'brightness-0 invert' : ''}`}
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="w-full overflow-hidden">
      {/* Main content with transparent background */}
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
      
      {/* Removed the bottom gradient transition */}
    </section>
  );
};

export default LogoScroll; 