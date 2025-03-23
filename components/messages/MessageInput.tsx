"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2, Smile } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface MessageInputProps {
  chatId: Id<"chats">;
}

export function MessageInput({ chatId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();

  const sendMessage = useMutation(api.secureMessages.sendMessageSecure);
  const setTypingStatus = useMutation(api.secureMessages.setTypingStatusSecure);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [message]);

  // Update typing status
  useEffect(() => {
    // Skip the effect if chatId is null or no user
    if (!chatId || !user) return;
    
    let typingTimeout: NodeJS.Timeout;
    
    if (message.trim()) {
      try {
        setTypingStatus({ 
          chatId, 
          isTyping: true,
          tokenPayload: {
            userId: user.id,
            userRole: "user", // This will be overridden by server-side check
            exp: 0, // These will be filled by server
            iat: 0,
            jti: "" // This will be filled by server
          }
        }).catch(err => {
          // Silently handle errors for typing status to prevent UI disruption
          console.error("Error setting typing status:", err);
        });
      } catch (error) {
        console.error("Error initiating typing status:", error);
      }
      
      // Clear the typing status after 2 seconds of no input
      typingTimeout = setTimeout(() => {
        try {
          setTypingStatus({ 
            chatId, 
            isTyping: false,
            tokenPayload: {
              userId: user.id,
              userRole: "user", // This will be overridden by server-side check
              exp: 0, // These will be filled by server
              iat: 0,
              jti: "" // This will be filled by server
            }
          }).catch(err => {
            // Silently handle errors
            console.error("Error clearing typing status:", err);
          });
        } catch (error) {
          console.error("Error clearing typing status:", error);
        }
      }, 2000);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [message, chatId, setTypingStatus, user]);
  
  // Cleanup typing status when component unmounts or chat changes
  useEffect(() => {
    // Skip if no chatId or user
    if (!chatId || !user) return;
    
    // Cleanup function to clear typing status
    const cleanup = () => {
      try {
        setTypingStatus({
          chatId,
          isTyping: false,
          tokenPayload: {
            userId: user.id,
            userRole: "user",
            exp: 0,
            iat: 0,
            jti: ""
          }
        }).catch(err => {
          console.error("Error clearing typing status on cleanup:", err);
        });
      } catch (error) {
        console.error("Error clearing typing status on cleanup:", error);
      }
    };
    
    // Add window beforeunload handler to clean up typing status when user leaves
    const handleBeforeUnload = () => {
      cleanup();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clear typing status when component unmounts or chat changes
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, [chatId, user, setTypingStatus]);

  // If no chat is selected, don't render the input
  if (!chatId) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !chatId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Clear typing status when sending a message
      try {
        await setTypingStatus({ 
          chatId, 
          isTyping: false,
          tokenPayload: {
            userId: user?.id || "",
            userRole: "user", // This will be overridden by server-side check
            exp: 0, // These will be filled by server
            iat: 0,
            jti: "" // This will be filled by server
          }
        });
      } catch (error) {
        console.error("Error clearing typing status:", error);
        // Continue with message send even if typing status fails
      }
      
      const result = await sendMessage({ 
        chatId, 
        content: message,
        tokenPayload: {
          userId: user?.id || "",
          userRole: "user", // This will be overridden by server-side check
          exp: 0, // These will be filled by server
          iat: 0,
          jti: "" // This will be filled by server
        }
      });
      
      if (result.error) {
        console.error("Failed to send message:", result.error);
        toast.error("Failed to send message. The chat may no longer be available.");
        return;
      }
      
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // Show user-friendly error message
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

  const isDarkTheme = resolvedTheme === "dark";

  return (
    <div className="absolute bottom-0 left-0 right-0 w-full">
      <div className={cn(
        "px-2 sm:px-4 md:px-8 pb-4 md:pb-6 pt-10",
        "bg-gradient-to-t",
        isDarkTheme 
          ? "from-[#1a0920]/90 via-[#220a2a]/70 to-transparent" 
          : "from-blue-50/90 via-blue-50/70 to-transparent"
      )}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="max-w-3xl w-full mx-auto"
        >
          <form 
            onSubmit={handleSubmit}
            className={cn(
              "relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300",
              "border backdrop-blur-md",
              isDarkTheme 
                ? "border-slate-700/50 bg-slate-900/70 shadow-slate-900/20" 
                : "border-blue-200 bg-white/90 shadow-blue-100/50",
              message.trim() ? "ring-2 ring-primary/20" : ""
            )}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message here..."
              className={cn(
                "min-h-[56px] md:min-h-[60px] resize-none p-3 sm:p-4 pr-20 sm:pr-24",
                "border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60",
                isDarkTheme 
                  ? "bg-transparent text-white/90" 
                  : "bg-transparent text-gray-900",
                "text-sm md:text-base transition-colors"
              )}
            />
            
            <div className="absolute right-1 sm:right-2 bottom-1 sm:bottom-2 flex items-center gap-1 sm:gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors",
                        isDarkTheme 
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="sr-only">Add emoji</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Add emoji (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-xl transition-colors",
                        isDarkTheme 
                          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Attach file (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div
                    key="loading"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center"
                  >
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-primary" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="button"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Button 
                      type="submit" 
                      size="icon" 
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10 rounded-xl shadow-sm",
                        !message.trim() && "opacity-50 cursor-not-allowed"
                      )}
                      disabled={!message.trim() || isSubmitting}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
          
          <div className="mt-2 text-[10px] text-center text-muted-foreground/70">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Chat Developed By Tyler Feldstein
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 