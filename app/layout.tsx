import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkAuthSync } from "@/components/clerk-auth-sync";
import LayoutWrapper from "@/components/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect",
  description: "AI security expert with expertise in machine learning, threat detection, and cloud security architecture. Specializing in Zero Trust frameworks, AWS/Azure/GCP security, CISSP-certified solutions, and expert consulting services.",
  keywords: "AI Engineer, Cybersecurity Architect, AI Security Expert, Machine Learning Engineer, Cloud Security Specialist, Zero Trust Architect, CISSP, AWS, Azure, GCP, Security Consultant, AI Consulting",
  metadataBase: new URL('https://tylerfeldstein.com'),
  authors: [{ name: "Tyler Feldstein" }],
  creator: "Tyler Feldstein",
  publisher: "Tyler Feldstein",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tylerfeldstein.com",
    siteName: "Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect",
    description: "AI security expert with expertise in machine learning, threat detection, and cloud security architecture. Specializing in Zero Trust frameworks, AWS/Azure/GCP security, CISSP-certified solutions, and expert consulting services.",
    images: [
      {
        url: "/photos/DSC00379-min.JPG",
        width: 1200,
        height: 630,
        alt: "Profile photo of AI Engineer and Cybersecurity Architect Tyler Feldstein",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect",
    description: "AI security expert with expertise in machine learning, threat detection, and cloud security architecture. Specializing in Zero Trust frameworks, AWS/Azure/GCP security, CISSP-certified solutions, and expert consulting services.",
    images: ["/photos/DSC00379-min.JPG"],
    creator: "@tylerfeldstein",
  },
  icons: {
    icon: "/favicon_io/android-chrome-512x512.png",
  },
};

/**
 * Root layout that provides authentication and theming
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexClientProvider>
              {/* This component syncs Clerk user data to the Convex database */}
              <ClerkAuthSync />
              
              <LayoutWrapper>{children}</LayoutWrapper>
              
              <Toaster />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
