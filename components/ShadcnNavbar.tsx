"use client";

import * as React from "react";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { useState, useEffect } from "react";
import Image from 'next/image';

interface NavItem {
  title: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

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

const mainNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "About",
    href: "/about",
  },
  {
    title: "Services",
    href: "/services",
  },
  {
    title: "Contact",
    href: "/contact",
  },
];

export default function ShadcnNavbar() {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className={cn(
          "transition-all duration-300 ease-in-out pointer-events-auto",
          isHomePage && !scrolled 
            ? "w-full bg-background border-b border-border" 
            : scrolled
              ? "bg-background backdrop-blur-sm shadow-md mt-4 rounded-full border border-border w-[85%] sm:w-[480px] md:w-[580px] lg:w-[680px]"
              : "w-full bg-background border-b border-border"
        )}
      >
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-medium text-foreground">Chasm</span>
            </Link>

            {/* Main Navigation */}
            {isHomePage ? (
              <div className="hidden md:flex items-center space-x-1">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-9 px-3 text-sm bg-background text-foreground hover:bg-accent">Products</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-background text-foreground border border-border shadow-md rounded-md">
                          {productItems.map((item) => (
                            <ListItem
                              key={item.title}
                              title={item.title}
                              href={item.href}
                            >
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-9 px-3 text-sm bg-background text-foreground hover:bg-accent">Resources</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-background text-foreground border border-border shadow-md rounded-md">
                          {resourceItems.map((item) => (
                            <ListItem
                              key={item.title}
                              title={item.title}
                              href={item.href}
                            >
                              <p className="line-clamp-2 text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/pricing" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(
                          navigationMenuTriggerStyle(), 
                          "h-9 px-3 text-sm bg-background text-foreground hover:bg-accent"
                        )}>
                          Pricing
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link href="/enterprise" legacyBehavior passHref>
                        <NavigationMenuLink className={cn(
                          navigationMenuTriggerStyle(), 
                          "h-9 px-3 text-sm bg-background text-foreground hover:bg-accent"
                        )}>
                          Enterprise
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            ) : (
              <div className="hidden sm:flex space-x-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "px-2 sm:px-3 py-2 text-sm rounded-md transition-colors whitespace-nowrap",
                      pathname === item.href
                        ? "text-foreground font-medium" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right side - User section and CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ModeToggle />
            {isHomePage && !scrolled && (
              <Link
                href="/get-started"
                className="hidden md:inline-flex h-9 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90"
              >
                Get Started
              </Link>
            )}
            {isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden outline-none">
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
                <DropdownMenuContent align="end" className="w-56 bg-background text-foreground border border-border shadow-md rounded-md">
                  <DropdownMenuLabel className="font-medium">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-border" />
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground">
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground">
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-border" />
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
                <DropdownMenuContent align="end" className="w-56 bg-background text-foreground border border-border shadow-md rounded-md">
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

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-foreground font-medium",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none mb-1">{title}</div>
          {children}
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem"; 