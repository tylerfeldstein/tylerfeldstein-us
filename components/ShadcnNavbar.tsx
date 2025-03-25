"use client";

import * as React from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, User, MessageSquare, Menu, ChevronDown } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useState, useEffect } from "react";
import Image from 'next/image';

interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

// Commented out but kept for future use
/*
const productItems: NavItem[] = [
  {
    title: "Analytics",
    href: "/analytics",
    description: "View performance metrics and insights",
  },
  {
    title: "Integrations",
    href: "/integrations",
    description: "Connect with your existing tools and workflows",
  },
  {
    title: "Automation",
    href: "/automation",
    description: "Build automated workflows and processes",
  },
];

const resourceItems: NavItem[] = [
  {
    title: "Documentation",
    href: "/docs",
    description: "Detailed guides and API references",
  },
  {
    title: "Community",
    href: "/community",
    description: "Join our community forum and discussions",
  },
  {
    title: "Support",
    href: "/support",
    description: "Get help from our support team",
  },
];
*/

// Updated navigation items to match exact section components 
const mainNavItems: NavItem[] = [
  // {
  //   title: "Hero",
  //   href: "#home",
  // },
  {
    title: "Expertise",
    href: "#about",
  },
  {
    title: "Projects",
    href: "#skills",
  },
  {
    title: "Career",
    href: "#experience",
  },
  {
    title: "Consulting",
    href: "#consulting",
  },
  // {
  //   title: "Contact",
  //   href: "#contact",
  // },
];

export default function ShadcnNavbar() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerHeight = 20;
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Update active section based on scroll position
      const sections = mainNavItems.map(item => item.href.substring(1));
      
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && element.offsetTop - headerHeight <= offset) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogin = () => {
    clerk.openSignIn();
  };

  const handleLogout = () => {
    clerk.signOut();
  };
  
  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = rect.top + scrollTop;
      
      window.scrollTo({
        top: elementTop - headerHeight,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="sticky top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={cn(
          "transition-all duration-300 ease-in-out pointer-events-auto w-full",
          scrolled
            ? "bg-background/80 backdrop-blur-sm shadow-md mt-4 rounded-full border border-border max-w-[85%] sm:max-w-[480px] md:max-w-[580px] lg:max-w-[680px]"
            : "w-full bg-background/90 backdrop-blur-sm border-b border-border"
        )}
      >
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="#home" className="flex items-center" onClick={(e) => handleSectionClick(e, "#home")}>
              <span className="font-bold text-xl text-foreground">T.F.</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={(e) => handleSectionClick(e, item.href)}
                  className={cn(
                    "px-2 sm:px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap",
                    activeSection === item.href.substring(1)
                      ? "text-primary font-medium" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Tablet Navigation Dropdown */}
            <div className="hidden md:flex lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground">
                  <span>Navigation</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {mainNavItems.map((item) => (
                    <DropdownMenuItem key={item.title} asChild>
                      <Link
                        href={item.href}
                        onClick={(e) => handleSectionClick(e, item.href)}
                        className={cn(
                          "w-full",
                          activeSection === item.href.substring(1)
                            ? "text-primary font-medium"
                            : "text-foreground"
                        )}
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right side - Mobile menu, Messages, User section, and dark/light mode toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 sm:w-80">
                <SheetHeader>
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 pt-6">
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={(e) => handleSectionClick(e, item.href)}
                      className={cn(
                        "px-2 py-2 text-sm rounded-md transition-colors",
                        activeSection === item.href.substring(1)
                          ? "text-primary font-medium" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                  
                  {/* Message Button for Mobile */}
                  <div className="px-2 py-2">
                    {isSignedIn ? (
                      <Link 
                        href="/messages" 
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogin();
                        }}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Sign in to message me</span>
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Messages Link - Show for all users but handle differently based on auth state */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden md:flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden lg:inline">Messages</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isSignedIn ? (
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="w-full">
                      Send me a message
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuLabel>Want to get in touch?</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleLogin} className="cursor-pointer gap-2">
                      <LogOut className="h-4 w-4 rotate-180" />
                      Sign in to message me
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:block">
              <ModeToggle />
            </div>
            
            {/* User Menu */}
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
                  {/* Show Messages in dropdown for mobile */}
                  <DropdownMenuItem asChild className="md:hidden focus:bg-accent focus:text-accent-foreground">
                    <Link href="/messages" className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center h-7 w-7 rounded-full bg-muted outline-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background text-foreground shadow-md rounded-md">
                  <DropdownMenuItem onClick={handleLogin} className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                    <LogOut className="mr-2 h-4 w-4 rotate-180" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 