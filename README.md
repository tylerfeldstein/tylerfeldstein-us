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

   ```bash
   # == CLERK == #
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain
   # == END CLERK == #

   # == CONVEX == #
   # Deployment used by `npx convex dev`
   CONVEX_DEPLOYMENT=dev:your_convex_deployment_id # team: your_team, project: your_project
   NEXT_PUBLIC_CONVEX_URL=https://your_deployment_id.convex.cloud
   # == END CONVEX == #

   # == APP == #
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your_secret_key_for_chat_tokens
   # == END APP == #
   ```

   You'll need to create accounts and get API keys from:
   - [Clerk](https://clerk.com) for authentication
   - [Convex](https://convex.dev) for the backend database

4. Start the development environment:

   ```bash
   # Start the Convex backend
   pnpm convex dev

   # In a new terminal, start the Next.js frontend
   pnpm dev

   # In a new terminal, start Inngest for background jobs
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

   Your app should now be running at [http://localhost:3000](http://localhost:3000)

## Convex Environment Variables

Convex requires environment variables to be set using the Convex CLI. This is particularly important for the JWT issuer domain:

```bash
# Set environment variables in Convex
npx convex env set CLERK_JWT_ISSUER_DOMAIN "your_clerk_jwt_issuer_domain"

# List all environment variables
npx convex env ls

# Get a specific environment variable
npx convex env get CLERK_JWT_ISSUER_DOMAIN
```

Make sure the `CLERK_JWT_ISSUER_DOMAIN` in Convex matches the one in your `.env.local` file.

## Deployment

To deploy your application:

1. Push your code to a Git repository
2. Set up hosting with Vercel or similar platform
3. Configure environment variables on your hosting platform
4. Deploy your Convex backend with `npx convex deploy`

## Inngest Integration

This project uses [Inngest](https://www.inngest.com) for background job processing and event-driven workflows. The integration enables reliable asynchronous processing for various tasks.

### Setup

1. **Development Environment**
   - Run `pnpm dev` to start the Next.js server, Convex backend, and Inngest Dev Server
   - The Inngest Dev Server dashboard is available at http://localhost:8288
   - No API keys are needed for local development

2. **Production Environment**
   - Create an account at [Inngest](https://www.inngest.com) and get your API keys
   - Add the keys to your environment variables (see below)
   - Deploy your Next.js application with the Inngest integration

### Environment Variables

For local development, set Convex environment variables:
```bash
npx convex env set NEXT_PUBLIC_URL http://host.docker.internal:3000
```

For production, update the URL to your actual deployment:
```bash
npx convex env set NEXT_PUBLIC_URL https://your-production-url.com
```

For detailed information about environment variables, see [convex/README-ENVIRONMENT.md](./convex/README-ENVIRONMENT.md).

### Available Workflows

- **Chat Message Notification**: Triggered when a message is sent in a chat
- **Chat Created Notification**: Triggered when a new chat is created

### Adding New Workflows

To add new Inngest workflows:

1. Create new function files in `inngest/functions/`
2. Register them in `app/api/inngest/route.ts`
3. Trigger them by sending events from Convex

## simple agent chat
```
USE_LOCAL_LLM=true LOCAL_LLM_PROVIDER=lmstudio LOCAL_LLM_NAME=deepseek-r1-distill-qwen-14b LOCAL_LLM_URL=http://localhost:1234/v1/chat/completions npx tsx ./inngest/functions/AgenticChat/agentChat.ts
```