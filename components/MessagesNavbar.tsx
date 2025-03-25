"use client";

import * as React from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronLeft, MessageCircle } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import Image from 'next/image';
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function MessagesNavbar() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  const handleLogout = () => {
    clerk.signOut();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-background/90 backdrop-blur-md border-b border-border/50 shadow-sm z-30"
    >
      <div className="max-w-[2520px] mx-auto">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back button with tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    href="/" 
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Return to Home
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Divider */}
            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Page title with icon */}
            <div className="flex items-center gap-1.5">
              <MessageCircle className="h-5 w-5 text-primary" />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-semibold text-base sm:text-lg text-foreground"
              >
                Messages
              </motion.span>
            </div>
          </div>

          {/* Right side - User section and dark/light mode toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ModeToggle />
            </div>
            
            {/* User dropdown */}
            {isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden p-0 border border-border/50 hover:border-primary/50 transition-colors">
                    {user.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt={user.firstName || "User"} 
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary h-full w-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-sm text-foreground shadow-lg rounded-xl border-border/50">
                  <DropdownMenuLabel className="font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {user.imageUrl ? (
                        <Image 
                          src={user.imageUrl} 
                          alt={user.firstName || "User"} 
                          width={32}
                          height={32}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium leading-none">{user.fullName || user.firstName || "User"}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.emailAddresses[0]?.emailAddress}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Show theme toggle in dropdown for mobile */}
                  <DropdownMenuItem className="sm:hidden focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center w-full">
                      <ModeToggle />
                      <span className="ml-2">Theme</span>
                    </div>
                  </DropdownMenuItem>
                  
                  {/* Logout button */}
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-accent focus:text-accent-foreground text-destructive hover:text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 