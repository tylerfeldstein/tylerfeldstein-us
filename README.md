# Tyler Feldstein Website

A modern web application built with Next.js 15, Convex, and Clerk authentication.

## Tech Stack

| Technology       | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| **Next.js 15**   | React framework with App Router for server and client components |
| **TypeScript**   | Type-safe JavaScript for robust development                      |
| **Tailwind CSS** | Utility-first CSS framework for styling                          |
| **Shadcn UI**    | Accessible and customizable component library                    |
| **Convex**       | Real-time database and backend functions                         |
| **Inngest**      | Event-driven background jobs and AI workflows                    |
| **Clerk**        | Authentication and user management                               |
| **pnpm**         | Fast, disk-efficient package manager                             |

## Project Structure

```
.
├── app/                    # Next.js 15 app directory
│   ├── actions/            # App-specific server actions
│   ├── server/             # Server-side utilities and handlers
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout component
├── components/             # Reusable UI components
│   ├── ui/                 # Shadcn UI components
│   └── ...                 # Custom components like navbar, etc.
├── convex/                 # Convex database and backend
│   ├── _generated/         # Auto-generated Convex code
│   ├── schema.ts           # Database schema definition
│   └── ...                 # Query and mutation functions
├── hooks/                  # Custom React hooks
│   └── use-mobile.ts       # Hook for responsive design
├── inngest/                # Inngest workflows
│   ├── functions/          # Background job definitions
│   └── client.ts           # Inngest client setup
├── lib/                    # Utility functions and shared code
│   └── utils.ts            # Helper utilities
├── public/                 # Static assets
├── actions/                # Global server actions
├── docker/                 # Docker configuration for local development
└── middleware.ts           # Next.js middleware (Clerk auth routes)
```

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or newer)
- pnpm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone <repo>
   cd tylerfeldstein-website
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

   ```
   # Convex (Self-hosted)
   CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'
   CONVEX_SELF_HOSTED_ADMIN_KEY='convex-self-hosted|your_admin_key'
   NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
   CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

   # Required for Clerk JWT authentication with Convex
   CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
   ```

   > Note: For Clerk values, sign up at [clerk.dev](https://clerk.dev) and create an application to get your API keys.

### Development Environment Setup

1. Start the Next.js development server:

   ```bash
   pnpm dev
   ```

2. In a separate terminal, start Convex:

   ```bash
   npx convex dev
   ```

   To configure Convex with your environment variables:

   ```bash
   # Set up Clerk JWT auth provider in Convex
   npx convex env set CLERK_JWT_ISSUER_DOMAIN

   # Verify your environment variables are set
   npx convex env list
   ```

3. In another terminal, start Inngest:

   ```bash
   npx inngest-cli dev
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Additional Commands

- Generate Convex types after schema changes:

  ```bash
  npx convex codegen
  ```

- Build for production:
  ```bash
  pnpm build
  ```

## Features

- **Real-time data updates** via Convex
- **Authentication** with Clerk
- **Responsive UI** with Tailwind CSS and Shadcn components
- **Dark mode support** with theme toggle
- **Background processing** for complex operations with Inngest
- **Real-time Inngest functions streaming** via Server Actions (no API routes needed)

## Inngest Real-time Streaming

The application uses Next.js 15 Server Actions to handle real-time streaming from Inngest functions:

1. **Server Action**: The `getInngestStream` server action in `app/actions/inngest.ts` subscribes to Inngest real-time channels and returns a ReadableStream.

2. **Client Hook**: The `useInngestRealtime` hook connects to the server action and processes the stream data, providing real-time updates to components.

3. **Usage**: Components can use the hook to display real-time updates by providing a correlation ID:

   ```tsx
   const { results, isConnected, error } = useInngestRealtime(correlationId);
   ```

This approach uses native Next.js 15 features, avoiding API routes for better performance and maintainability.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

Dont steal my shit

# Secure Chat with HTTP-Only Cookies

> **Note**: This is the current implementation for secure chat authentication. We've transitioned from the previous localStorage-based approach to this more secure HTTP-only cookie system.

This project implements a secure chat system using JWT tokens stored in HTTP-only cookies for enhanced security.

## Security Features

- **HTTP-Only Cookies**: Prevents client-side JavaScript from accessing token values
- **Short-Lived Access Tokens**: Access tokens expire quickly to minimize security risks
- **Refresh Token Rotation**: Longer-lived refresh tokens enable seamless re-authentication
- **Server-Side Token Verification**: Token validation happens on the server

## Implementation

The implementation consists of:

1. **Server Actions** (`/actions/auth/cookieTokens.ts`):
   - Set and clear HTTP-only cookies
   - Refresh access tokens using refresh tokens
   - Get token existence status safely

2. **React Hook** (`/hooks/useChatCookieTokens.ts`):
   - Client-side interface to the cookie token system
   - Manages token generation, refreshing, and clearing
   - Tracks token status for UI updates

3. **Convex Functions** (`/convex/jwt.ts`):
   - Generate and verify JWT tokens
   - Store token information in database
   - Enable token invalidation

## Usage

### In Client Components

```tsx
'use client';

import { useChatCookieTokens } from "@/hooks/useChatCookieTokens";

export default function ChatComponent() {
  const { 
    hasToken, 
    isRefreshing, 
    generateChatTokens, 
    refreshToken, 
    clearTokens 
  } = useChatCookieTokens();

  // Generate tokens on chat access
  const handleChatAccess = async () => {
    const success = await generateChatTokens();
    if (success) {
      // Navigate to chat or load chat data
    }
  };

  // Clear tokens on logout
  const handleLogout = async () => {
    await clearTokens();
    // Navigate to login page
  };

  return (
    <div>
      <button onClick={handleChatAccess}>Access Chat</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### In Server Components or Actions

```tsx
import { getTokensForServerUse } from "@/actions/auth/cookieTokens";

export async function YourServerAction() {
  // Get tokens for server-side API calls
  const { accessToken, refreshToken } = await getTokensForServerUse();
  
  if (accessToken) {
    // Make authenticated API call with token
  } else {
    // Handle unauthenticated state
  }
}
```

## Security Benefits

- Prevents XSS attacks from stealing tokens
- Reduces risk of CSRF attacks when proper configurations are applied
- Automatically expires tokens to limit attack window
- Maintains better security in development environments

## Development vs Production

- Development: Cookies work without HTTPS
- Production: Adds `secure: true` flag to ensure cookies only work over HTTPS