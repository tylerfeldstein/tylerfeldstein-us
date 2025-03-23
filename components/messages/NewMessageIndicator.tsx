import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewMessageIndicatorProps {
  onClick: () => void;
  className?: string;
  variant?: "button" | "badge" | "dot";
  count?: number;
}

export default function NewMessageIndicator({ 
  onClick, 
  className,
  variant = "button", 
  count 
}: NewMessageIndicatorProps) {
  
  // Simple dot indicator
  if (variant === "dot") {
    return (
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: [0.8, 1, 0.8] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn(
          "absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border border-background",
          className
        )}
      />
    );
  }
  
  // Badge with count
  if (variant === "badge") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "absolute top-1 right-1 bg-red-500 text-white text-xs font-medium py-0.5 px-1.5 rounded-full flex items-center gap-1",
          className
        )}
      >
        <span>{count || "New"}</span>
        <ChevronDown className="h-3 w-3" />
      </motion.div>
    );
  }
  
  // Default button style
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "z-10",
        className
      )}
    >
      <Button 
        variant="default" 
        size="sm" 
        className="rounded-full shadow-md flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground"
        onClick={onClick}
      >
        <div className="relative flex items-center">
          <ChevronDown className="h-4 w-4" />
          <motion.span 
            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"
            animate={{ scale: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
        <span className="font-medium">New messages</span>
      </Button>
    </motion.div>
  );
} 