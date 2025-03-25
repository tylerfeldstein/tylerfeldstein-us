import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateMessageProps {
  onNewChat: () => void;
}

export function EmptyStateMessage({ onNewChat }: EmptyStateMessageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="mb-5 sm:mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
          >
            <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          </motion.div>
          
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl font-semibold mb-2"
          >
            Start a Conversation
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm sm:text-base text-muted-foreground"
          >
            Select an existing chat or start a new conversation
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            onClick={onNewChat}
            className="gap-2 h-10 px-4 sm:px-5"
            size="lg"
          >
            <span>New Conversation</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 sm:mt-8 text-xs text-muted-foreground/70 max-w-xs mx-auto"
        >
          Your conversations are end-to-end encrypted and visible only to participants
        </motion.div>
      </motion.div>
    </div>
  );
} 