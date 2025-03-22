import React from 'react';

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageSection({ children, className = '' }: PageSectionProps) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
} 