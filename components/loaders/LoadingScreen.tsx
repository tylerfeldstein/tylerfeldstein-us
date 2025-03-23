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
      "flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950",
      className
    )}>
      <Card className={cn(
        "w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-blue-100 dark:border-slate-800 shadow-xl",
        cardClassName
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg font-medium flex items-center justify-center gap-2">
            {iconComponents[icon]}
            <span>{title}</span>
          </CardTitle>
          <CardDescription className="text-center">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-2 pt-4">
          {!hideLoader && (
            <div className="relative mb-4">
              <PinWheel size={45} speed={speed} className="z-10" />
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary/30"></div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.p 
              key={phase !== undefined ? phase : message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-center text-muted-foreground min-h-[20px]"
            >
              {message}
            </motion.p>
          </AnimatePresence>
          
          {customButton && (
            <div className="mt-4 flex justify-center">
              {customButton}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pb-6 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {footerIconComponents[footerIcon]}
            <span>{footerText}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 