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
  authors: [{ 
    name: "Tyler Feldstein",
    url: "https://tylerfeldstein.com"
  }],
  creator: "Tyler Feldstein",
  publisher: "Tyler Feldstein",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://tylerfeldstein.com',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tylerfeldstein.com",
    siteName: "Tyler Feldstein - AI Engineer & Cybersecurity Architect",
    title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect",
    description: "AI security expert with expertise in machine learning, threat detection, and cloud security architecture. Specializing in Zero Trust frameworks, AWS/Azure/GCP security, CISSP-certified solutions, and expert consulting services.",
    images: [
      {
        url: "https://tylerfeldstein.com/photos/DSC00379-min.JPG",
        width: 1200,
        height: 630,
        alt: "Profile photo of AI Engineer and Cybersecurity Architect Tyler Feldstein",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyler Feldstein | AI Engineer & Cybersecurity Architect",
    description: "AI security expert with expertise in machine learning, threat detection, and cloud security architecture. Specializing in Zero Trust frameworks, AWS/Azure/GCP security, CISSP-certified solutions, and expert consulting services.",
    images: ["https://tylerfeldstein.com/photos/DSC00379-min.JPG"],
    creator: "@tylerfeldstein",
    site: "@tylerfeldstein",
  },
  verification: {
    google: "your-google-site-verification", // You'll need to add your Google verification code
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon_io/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tyler Feldstein",
    startupImage: [
      {
        url: "/photos/DSC00379-min.JPG",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      }
    ]
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
  category: "Technology",
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
