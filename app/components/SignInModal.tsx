'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';

export default function SignInModal() {
  const { openSignIn } = useClerk();
  const { isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    const showSignIn = searchParams.get('showSignIn');
    const returnTo = searchParams.get('returnTo');
    
    // Only show sign-in modal if user is not signed in
    if (showSignIn === 'true' && isLoaded && !isSignedIn) {
      // Open the sign-in modal
      openSignIn({
        // If returnTo exists and is a valid URL, use it; otherwise fallback to /messages
        redirectUrl: returnTo ? decodeURIComponent(returnTo) : '/messages',
      });
      
      // Remove the query parameters without triggering a refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('showSignIn');
      newUrl.searchParams.delete('returnTo');
      router.replace(newUrl.pathname);
    }
  }, [searchParams, openSignIn, router, isLoaded, isSignedIn]);

  return null; // This component doesn't render anything
} 