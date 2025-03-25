"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

const AnimatedBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Generate random particles
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const colors = [
        'rgba(var(--primary), 0.05)',
        'rgba(var(--secondary), 0.05)',
        'rgba(var(--primary), 0.07)',
        'rgba(var(--secondary), 0.07)',
      ];
      
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 15 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
        });
      }
      
      setParticles(newParticles);
    };
    
    generateParticles();
    
    return () => {
      setParticles([]);
    };
  }, []);

  if (!mounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background" />
      
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            rotate: `${particle.rotation}deg`,
          }}
          animate={{
            y: [0, Math.random() * 50 - 25],
            x: [0, Math.random() * 50 - 25],
            rotate: [particle.rotation, particle.rotation + 180],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: Math.random() * 20 + 15,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Blurred circles */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow opacity-40" />
      <div className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] animate-pulse-slow opacity-40" />
      
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] bg-[size:60px_60px]" />
      
      {/* Light beams */}
      <motion.div 
        className="absolute -top-20 left-1/4 w-[2px] h-[200px] bg-gradient-to-b from-primary/0 via-primary/30 to-primary/0 rotate-[20deg]"
        animate={{
          opacity: [0, 0.5, 0],
          height: ['200px', '300px', '200px'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute -top-10 right-1/3 w-[1px] h-[150px] bg-gradient-to-b from-secondary/0 via-secondary/20 to-secondary/0 -rotate-[15deg]"
        animate={{
          opacity: [0, 0.4, 0],
          height: ['150px', '250px', '150px'],
        }}
        transition={{
          duration: 6,
          delay: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
      
      {/* Animated radial gradient */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.03)_0%,transparent_60%)]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default AnimatedBackground; 