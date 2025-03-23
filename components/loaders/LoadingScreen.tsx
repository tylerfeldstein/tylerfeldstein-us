import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, KeyRound, LockIcon, MessageCircle } from "lucide-react";
import { PinWheel } from "./pinwheel";
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message: string;
  title?: string;
  description?: string;
  icon?: 'shield' | 'key' | 'message' | 'lock';
  footerText?: string;
  footerIcon?: 'shield' | 'lock';
  speed?: number;
  phase?: number;
  fullScreen?: boolean;
  className?: string;
  cardClassName?: string;
  customButton?: ReactNode;
  hideLoader?: boolean;
}

export function LoadingScreen({
  message,
  title = "Secure Chat",
  description = "Setting up your secure communication channel",
  icon = 'message',
  footerText = "End-to-end encrypted",
  footerIcon = 'shield',
  speed = 0.8,
  phase,
  fullScreen = true,
  className,
  cardClassName,
  customButton,
  hideLoader = false
}: LoadingScreenProps) {
  
  const iconComponents = {
    'shield': <Shield className="h-5 w-5" />,
    'key': <KeyRound className="h-5 w-5" />,
    'message': <MessageCircle className="h-5 w-5" />,
    'lock': <LockIcon className="h-5 w-5" />
  };

  const footerIconComponents = {
    'shield': <Shield className="h-3 w-3" />,
    'lock': <LockIcon className="h-3 w-3" />
  };

  const containerClasses = fullScreen 
    ? "h-screen w-screen" 
    : "h-full w-full";

  return (
    <div className={cn(
      containerClasses,
      "flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#1a0920] dark:via-[#220a2a] dark:to-[#3a0a47]",
      className
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Card className={cn(
          "w-80 bg-white/90 dark:bg-slate-950/70 backdrop-blur-md border-blue-100/80 dark:border-slate-800/30 shadow-xl",
          cardClassName
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg font-medium flex items-center justify-center gap-2 text-primary">
              {iconComponents[icon]}
              <span>{title}</span>
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground/80">{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-2 pt-4">
            {!hideLoader && (
              <div className="relative mb-4">
                <PinWheel size={45} speed={speed} className="z-10" />
                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary/30 dark:bg-primary/20"></div>
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.p 
                key={phase !== undefined ? phase : message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-sm text-center text-muted-foreground min-h-[20px]"
              >
                {message}
              </motion.p>
            </AnimatePresence>
            
            {customButton && (
              <div className="mt-6 flex justify-center">
                {customButton}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pb-6 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
              {footerIconComponents[footerIcon]}
              <span>{footerText}</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 