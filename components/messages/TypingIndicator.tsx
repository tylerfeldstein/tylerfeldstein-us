import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingUser {
  userId: string;
  name?: string;
  email?: string;
  imageUrl?: string;
  lastUpdated: number;
}

interface TypingIndicatorProps {
  users: TypingUser[];
  className?: string;
}

export default function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (!users || users.length === 0) return null;

  // Only show the indicator for the most recent typing user if there are multiple
  const typingUser = users[0];
  const displayName = typingUser.name || typingUser.email || 'Someone';
  const firstLetter = (displayName[0] || 'U').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-2 py-1 px-3 text-xs text-muted-foreground',
        className
      )}
    >
      <Avatar className="h-6 w-6 border">
        {typingUser.imageUrl ? (
          <AvatarImage src={typingUser.imageUrl} alt={displayName} />
        ) : (
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {firstLetter}
          </AvatarFallback>
        )}
      </Avatar>

      <div className="flex items-center">
        <span className="mr-1 font-medium">{displayName}</span>
        <span>is typing</span>
        <span className="flex ml-1">
          <motion.span
            className="h-1 w-1 rounded-full bg-muted-foreground mx-0.5"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="h-1 w-1 rounded-full bg-muted-foreground mx-0.5"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="h-1 w-1 rounded-full bg-muted-foreground mx-0.5"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </span>
      </div>
    </motion.div>
  );
} 