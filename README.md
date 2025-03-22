# Chasm

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
   git clone https://github.com/yourusername/chasm.git
   cd chasm
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