"use client";

import React, { ReactNode } from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';

interface SmoothScrollingProps {
  children: ReactNode;
}

function SmoothScrolling({ children }: SmoothScrollingProps) {
  return React.createElement(ReactLenis, {
    root: true,
    options: {
      lerp: 0.1,
      duration: 1.5,
      touchMultiplier: 2,
    }
  }, children);
}

export default SmoothScrolling; 