"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  title: string;
  company: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Working with Tyler on our security infrastructure was a game-changer. His military-grade approach to implementing AI-driven monitoring helped us identify and neutralize threats we would have otherwise missed entirely. His background in the Army gave him unique insights for our security protocols.",
    name: "Jacob B.",
    title: "Cybersecurity Officer",
    company: "US Army",
    rating: 5
  },
  {
    id: 2,
    quote: "Tyler's expertise in both military security protocols and cutting-edge AI technologies created a security framework that was leagues ahead of what we had before. Having served alongside him, I knew he'd deliver results, but the autonomous threat detection system he built exceeded every expectation.",
    name: "Antonio A.",
    title: "Information Systems Specialist",
    company: "US Army",
    rating: 5
  },
  {
    id: 3,
    quote: "As a founder, I needed someone who could understand both the technical and business sides of security. Tyler designed an AI pipeline that not only strengthened our security posture but also streamlined operations, reducing our overhead costs by nearly 40%. His work was transformative for our startup.",
    name: "Ryan C.",
    title: "Founder & CEO",
    company: "",
    rating: 5
  },
  {
    id: 4,
    quote: "I've observed the impact of Tyler's work from our side of the healthcare industry. His security implementations for medical data systems strike the perfect balance between rigorous protection and accessibility. Even without direct collaboration, his reputation for integrating AI solutions with healthcare security protocols has influenced our approach to data protection.",
    name: "Amber G.",
    title: "Clinical Trials",
    company: "Confidential",
    rating: 4.5
  }
];

const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Auto-advance testimonials
  useEffect(() => {
    if (!autoplay) return;
    
    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [currentIndex, autoplay]);
  
  const handlePrev = () => {
    setAutoplay(false);
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };
  
  const handleNext = () => {
    setAutoplay(false);
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };
  
  const currentTestimonial = testimonials[currentIndex];
  
  return (
    <div className="relative bg-card rounded-2xl border border-border/30 overflow-hidden p-2">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03] opacity-70"></div>
      
      <div className="relative p-6 md:p-10">
        {/* Quote icon */}
        <div className="absolute top-6 md:top-10 left-6 md:left-10 text-primary/20">
          <Quote size={60} />
        </div>
        
        {/* Testimonial content */}
        <div className="min-h-[240px] flex flex-col justify-center relative z-10">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={currentTestimonial.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              className="w-full"
            >
              <div className="pt-8 pl-8 md:pl-10 md:pr-10">
                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={`mr-1 ${
                        i < currentTestimonial.rating
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <blockquote className="text-lg md:text-xl font-medium text-foreground/90 mb-6">
                  "{currentTestimonial.quote}"
                </blockquote>
                
                {/* Author */}
                <div className="flex items-center">
                  <div>
                    <div className="font-bold text-foreground">
                      {currentTestimonial.name}
                    </div>
                    <div className="text-sm text-foreground/70">
                      {currentTestimonial.title}, {currentTestimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoplay(false);
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary'
                    : 'bg-primary/20 hover:bg-primary/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handlePrev}
            >
              <ArrowLeft size={16} />
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleNext}
            >
              <ArrowRight size={16} />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSlider; 