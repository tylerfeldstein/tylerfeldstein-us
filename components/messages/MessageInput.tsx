"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { SendHorizontal } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageInputProps {
  chatId: Id<"chats">;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  const [originalViewport, setOriginalViewport] = useState<string | null>(null);
  const lastTypingUpdate = useRef<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const sendMessage = useMutation(api.secureMessages.sendMessageSecure);
  const setTypingStatus = useMutation(api.secureMessages.setTypingStatusSecure);

  // Update viewport and safe area measurements
  useEffect(() => {
    const updateViewportMeasurements = () => {
      if (!window.visualViewport) return;
      
      // Calculate keyboard height
      const keyboardHeight = Math.max(window.innerHeight - window.visualViewport.height, 0);
      
      // Get header heights
      const navbarElement = document.querySelector('nav') as HTMLElement;
      const chatHeaderElement = document.querySelector('.chat-header') as HTMLElement;
      const headerHeight = (navbarElement?.offsetHeight || 0) + (chatHeaderElement?.offsetHeight || 0);
      
      // Get input height
      const inputContainer = document.querySelector('.message-input-container') as HTMLElement;
      const inputHeight = inputContainer?.offsetHeight || 0;
      
      // Update CSS variables
      document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--input-height', `${inputHeight}px`);
      
      // Scroll to the last message
      if (keyboardHeight > 0) {
        requestAnimationFrame(() => {
          const messageList = document.querySelector('.message-list-container');
          const lastMessage = messageList?.querySelector('.message:last-child');
          lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
      }
    };

    // Initial measurement
    updateViewportMeasurements();
    
    // Update on resize and scroll
    window.visualViewport?.addEventListener('resize', updateViewportMeasurements);
    window.visualViewport?.addEventListener('scroll', updateViewportMeasurements);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportMeasurements);
      window.visualViewport?.removeEventListener('scroll', updateViewportMeasurements);
      
      // Clean up CSS variables
      document.documentElement.style.removeProperty('--keyboard-height');
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--input-height');
    };
  }, []);

  // Prevent page zoom when input is focused on mobile
  useEffect(() => {
    // Store the original viewport meta tag content
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      setOriginalViewport(viewportMeta.getAttribute('content'));
    }

    // Function to handle focus/blur events
    const handleInputFocus = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      document.body.classList.add('keyboard-visible');
      
      // Scroll to the last message after a short delay
      setTimeout(() => {
        const messageList = document.querySelector('.message-list-container');
        const lastMessage = messageList?.querySelector('.message:last-child');
        lastMessage?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    };

    const handleInputBlur = () => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta && originalViewport) {
        viewportMeta.setAttribute('content', originalViewport);
      }
      document.body.classList.remove('keyboard-visible');
      
      // Clean up CSS variables
      document.documentElement.style.removeProperty('--keyboard-height');
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--input-height');
    };

    // Add event listeners to the textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleInputFocus);
      textarea.addEventListener('blur', handleInputBlur);
    }

    // Cleanup event listeners
    return () => {
      if (textarea) {
        textarea.removeEventListener('focus', handleInputFocus);
        textarea.removeEventListener('blur', handleInputBlur);
      }
      document.body.classList.remove('keyboard-visible');
      
      // Clean up CSS variables
      document.documentElement.style.removeProperty('--keyboard-height');
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--input-height');
    };
  }, [originalViewport]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set new height based on scrollHeight
      const scrollHeight = textareaRef.current.scrollHeight;
      // Limit max height to ~4 lines of text (176px)
      textareaRef.current.style.height = `${Math.min(scrollHeight, 176)}px`;
    }
  }, [message]);

  // Function to update typing status with rate limiting
  const updateTypingStatus = useCallback(async () => {
    if (!user || !chatId) return;

    const now = Date.now();
    // Only update if it's been more than 1 minute since last update
    if (now - lastTypingUpdate.current < 60000) {
      return;
    }

    try {
      await setTypingStatus({
        chatId,
        isTyping: true,
        tokenPayload: {
          userId: user.id,
          userRole: "user",
          exp: 0,
          iat: 0,
          jti: ""
        }
      });
      lastTypingUpdate.current = now;

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set a new timeout to clear typing status after 30 seconds
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await setTypingStatus({
            chatId,
            isTyping: false,
            tokenPayload: {
              userId: user.id,
              userRole: "user",
              exp: 0,
              iat: 0,
              jti: ""
            }
          });
        } catch (error) {
          console.error("Error clearing typing status:", error);
        }
      }, 30000);
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  }, [chatId, user, setTypingStatus]);

  // Handle message changes
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    // Only trigger typing indicator when starting to type
    if (newMessage.length > 0 && message.length === 0) {
      updateTypingStatus();
    }
  };

  // Clear typing status on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !chatId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      const result = await sendMessage({ 
        chatId, 
        content: message,
        tokenPayload: {
          userId: user?.id || "",
          userRole: "user",
          exp: 0,
          iat: 0,
          jti: ""
        }
      });
      
      if (result.error) {
        console.error("Failed to send message:", result.error);
        toast.error("Failed to send message. The chat may no longer be available.");
        return;
      }
      
      setMessage("");
      lastTypingUpdate.current = 0; // Reset typing update timer
    } catch (error) {
      console.error("Failed to send message:", error);
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes("not found") || errorMessage.includes("Chat not found")) {
          toast.error("This chat is no longer available. It may have been deleted.");
        } else {
          toast.error("Failed to send message. Please try again later.");
        }
      } else {
        toast.error("Failed to send message. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div 
      className={cn(
        "message-input-container",
        "flex items-center gap-2 p-4",
        "fixed bottom-0",
        "border-t border-border/10",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-t",
        "before:from-background/95 before:via-background/50 before:to-transparent",
        "before:backdrop-blur-md",
        // Position and width calculations based on sidebar state
        "left-0 w-full",
        "md:left-[70px] md:w-[calc(100%-70px)]",
        "lg:left-[var(--sidebar-width,350px)] lg:w-[calc(100%-var(--sidebar-width,350px))]",
        // Handle mobile keyboard
        "keyboard-visible:left-0 keyboard-visible:w-full",
        "md:keyboard-visible:left-[70px] md:keyboard-visible:w-[calc(100%-70px)]",
        "lg:keyboard-visible:left-[var(--sidebar-width,350px)] lg:keyboard-visible:w-[calc(100%-var(--sidebar-width,350px))]"
      )}
    >
      <div className="relative flex-1 w-full max-w-3xl mx-auto">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message here..."
          value={message}
          onChange={handleMessageChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className={cn(
            "min-h-[44px] max-h-[176px] w-full",
            "resize-none overflow-x-hidden overflow-y-auto",
            "whitespace-pre-wrap break-words",
            "px-4 py-2.5",
            "focus:ring-0 focus:ring-offset-0 focus:outline-none",
            "rounded-md border border-input/50",
            "placeholder:text-foreground/50",
            "text-sm leading-relaxed",
            "bg-background/40 dark:bg-background/60",
            "backdrop-blur-md",
            "shadow-sm",
            "transition-colors duration-200",
            "focus:bg-background/60 dark:focus:bg-background/80",
            "hover:bg-background/50 dark:hover:bg-background/70"
          )}
          rows={1}
        />
      </div>
      
      <Button 
        type="submit"
        size="icon"
        disabled={!message.trim()}
        onClick={handleSubmit}
        className={cn(
          "flex-shrink-0 rounded-full",
          "bg-primary/90 hover:bg-primary",
          "text-primary-foreground"
        )}
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
} 