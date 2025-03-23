"use client";

import * as React from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, User, ChevronLeft } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import Image from 'next/image';

export default function MessagesNavbar() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  const handleLogout = () => {
    clerk.signOut();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-[2520px] mx-auto">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back button for mobile and tablet */}
            <Link 
              href="/" 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Back</span>
            </Link>

            {/* Divider */}
            <div className="h-4 w-px bg-border hidden sm:block" />

            {/* Page title - different styling for mobile */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg text-foreground">Messages</span>
            </div>
          </div>

          {/* Right side - User section and dark/light mode toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ModeToggle />
            </div>
            
            {isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background text-foreground shadow-md rounded-md">
                  <DropdownMenuLabel className="font-medium">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Show theme toggle in dropdown for mobile */}
                  <DropdownMenuItem className="sm:hidden focus:bg-accent focus:text-accent-foreground">
                    <div className="flex items-center w-full">
                      <ModeToggle />
                      <span className="ml-2">Theme</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 