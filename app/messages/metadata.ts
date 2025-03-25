import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Messages - Tyler Feldstein',
  description: 'Secure messaging for Tyler Feldstein',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  userScalable: false,
};

export const dynamic = 'force-dynamic';
export const revalidate = 0; 