"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon, PaperclipIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";

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
      });
      
      // Clear the typing status after 2 seconds of no input
      typingTimeout = setTimeout(() => {
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
        });
      }, 2000);
    }
    
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [message, chatId, setTypingStatus, user]);

  // If no chat is selected, don't render the input
  if (!chatId) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !chatId || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
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
        return;
      }
      
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0">
      <div className={`px-4 md:px-8 pb-6 ${
        resolvedTheme === "dark" 
          ? "bg-gradient-to-t from-black/50 via-black/20 to-transparent/20 backdrop-blur-sm" 
          : "bg-gradient-to-t from-blue-50/80 via-blue-50/40 to-transparent backdrop-blur-lg"
      }`}>
        <div className="max-w-3xl mx-auto">
          <form 
            onSubmit={handleSubmit}
            className={`
              relative rounded-xl border shadow-sm overflow-hidden
              ${resolvedTheme === "dark" 
                ? "border-white/30 bg-black/50 backdrop-blur-md" 
                : "border-blue-200 bg-white/80 backdrop-blur-md"
              }
              transition-all duration-300
            `}
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
              placeholder="Ask anything..."
              className={`
                min-h-[52px] resize-none px-4 py-3 pr-14 
                border-0 shadow-none focus-visible:ring-0
                ${resolvedTheme === "dark" 
                  ? "bg-transparent text-white/90 placeholder:text-gray-400" 
                  : "bg-transparent text-gray-900 placeholder:text-gray-500"
                }
                text-sm md:text-base
              `}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`
                  h-8 w-8 rounded-md 
                  ${resolvedTheme === "dark" 
                    ? "text-gray-400 hover:bg-[#202123]/30 hover:text-gray-300" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                `}
              >
                <PaperclipIcon className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
              
              <Button 
                type="submit" 
                variant={message.trim() ? "default" : "ghost"}
                size="icon" 
                className={`
                  h-8 w-8 rounded-md
                  ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                  ${resolvedTheme === "dark" && message.trim() 
                    ? "bg-primary hover:bg-primary/90" 
                    : resolvedTheme === "dark" 
                      ? "text-gray-400 hover:bg-[#202123]/30 hover:text-gray-300" 
                      : message.trim() 
                        ? "bg-primary hover:bg-primary/90" 
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }
                `}
                disabled={!message.trim() || isSubmitting}
              >
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
          
          <div className="mt-2 text-[10px] text-center text-muted-foreground">
            Chat Developed By Tyler Feldstein.
          </div>
        </div>
      </div>
    </div>
  );
} 