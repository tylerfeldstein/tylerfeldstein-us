import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface PinWheelProps {
  size?: number;
  color?: string;
  speed?: number;
  stroke?: number;
  className?: string;
}

export function PinWheel({
  size = 35,
  color,
  speed = 0.9,
  stroke = 3.5,
  className
}: PinWheelProps) {
  const { resolvedTheme } = useTheme();
  
  // Default color based on theme if not provided
  const defaultColor = resolvedTheme === 'dark' 
    ? 'hsl(var(--primary))' 
    : 'hsl(var(--primary))';
  
  const wheelColor = color || defaultColor;
  
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `calc(50% - ${stroke / 2}px)`,
            left: 0,
            height: `${stroke}px`,
            width: '100%',
            borderRadius: `${stroke / 2}px`,
            backgroundColor: wheelColor,
            opacity: i === 1 ? 1 : (1 - (i - 1) * 0.15),
            animation: `rotate ${speed}s ease-in-out infinite`,
            animationDelay: `calc(${speed}s * -${(i - 1) * 0.075})`,
            transform: 'rotate(0deg)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}