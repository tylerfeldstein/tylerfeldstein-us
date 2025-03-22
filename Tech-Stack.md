# 🧪 Tech Stack & Project Setup Guide

Welcome to the official tech stack guide for this project. This document provides a quick overview of the tools and technologies used, and how to get started developing locally.

---

## 🔧 Stack Overview

| Tool            | Purpose                               |
|-----------------|----------------------------------------|
| **Next.js 15**  | React-based frontend framework         |
| **Tailwind CSS**| Utility-first CSS styling              |
| **TypeScript**  | Type-safe JavaScript                  |
| **Convex**      | Reactive backend & database            |
| **Inngest**     | Durable AI agent & workflow automation |
| **Clerk**       | Authentication (Sign in / Sign up)     |
| **pnpm**        | Fast, modern package manager           |

---

## 📁 Project Structure

```
.
├── actions                  # Server & client-side action handlers
├── app                      # Next.js 15 app directory
│   └── server               # Route handlers, server-side logic
├── components               # Reusable UI components
├── convex                   # Convex schema and backend logic
│   └── _generated           # Auto-generated Convex code
├── lib                      # Helper functions, configuration
└── public                   # Static assets
```

---

## 🚀 Quick Start

### 1. Clone the repository & install dependencies
```bash
git clone <your-repo-url>
cd <your-project-dir>
pnpm install
```

---

### 2. Set up environment variables

Create a `.env.local` file and populate the required keys for:

- Clerk (authentication)
- Convex (deployment URL or dev key)
- Inngest (API key or local dev setup)

> You can find sample values in `.env.example` if included.

---

## ⚙️ Convex Setup

We use [Convex](https://www.convex.dev/) as our backend and real-time database.

### Option 1: Convex Cloud (Dev)

```bash
npx convex dev
```

This runs a local dev instance of Convex with live data reactivity.

### Option 2: Self-hosted Convex

Follow their [self-hosted guide](https://github.com/get-convex/convex-backend/blob/main/self-hosted/README.md).

Basic steps:

```bash
cd convex
docker-compose up -d
```

Generate types after updating schema:

```bash
npx convex codegen
```

Make sure your `.env.local` includes the Convex deployment URL or admin key.

---

## 🤖 Inngest Setup

We use [Inngest](https://www.inngest.com/) to power AI agents and event-driven workflows.

### 1. Install Inngest CLI

```bash
npx inngest-cli@latest dev
```

### 2. Add an Inngest Function

Create an `inngest/` directory (if not present) and define a function like this:

```ts
// inngest/helloWorld.ts
import { inngest } from "@/lib/inngest";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello" },
  async ({ event, step }) => {
    console.log("Hello from Inngest!");
  }
);
```

### 3. Run Dev Server

```bash
pnpm dev
# in another terminal:
npx inngest-cli dev
```

Inngest will detect functions in your project and provide a local dashboard at `http://127.0.0.1:8288`.

### 4. Trigger Events

Send test events to trigger functions:

```bash
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "test/hello", "data": {"message": "world"}}'
```

---

## 🔐 Clerk Setup

1. Add your Clerk keys in `.env.local`:

```env
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

2. Wrap your app in `ClerkProvider` inside `app/layout.tsx`.

3. Use `SignedIn`, `SignedOut`, and `UserButton` for auth UI.

More at: [Clerk Next.js Docs](https://clerk.com/docs/quickstarts/nextjs)

---

## ✅ Run the Dev Server

Start your local dev server:

```bash
pnpm dev
```

Then separately in another terminal:

```bash
npx convex dev
npx inngest-cli dev
```

Visit your app at [http://localhost:3000](http://localhost:3000)

---

## 🧠 AI Agent Overview

Our AI agents (Scrum Master bots) are powered by **Inngest**, and triggered by real-time events or scheduled intervals. Workflows include:

- Daily standups
- Sprint planning
- Backlog grooming
- Jira/Atlassian/Zoom integrations (coming soon)

Agents may consume events and interact with the Convex database or external APIs as needed.

---


## 📄 Example .env.local

Rename this file to `.env.local` and replace the placeholder values with your actual credentials.

```env
# === Clerk Auth ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_jwt_issuer_domain

# === Convex ===
# === Cloud ===
CONVEX_DEPLOYMENT=your-convex-deployment-name
CONVEX_URL=https://your-convex-instance.convex.cloud
CONVEX_ADMIN_KEY=your-convex-admin-key
# == Self Hosted ==
CONVEX_SELF_HOSTED_URL='http://127.0.0.1:3210'
CONVEX_SELF_HOSTED_ADMIN_KEY='convex-self-hosted| <rest_of_key>'
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210


# === Inngest ===
INNGEST_EVENT_KEY=your-inngest-event-key
INNGEST_SIGNING_KEY=your-inngest-signing-key
NEXT_PUBLIC_INNGEST_EVENT_KEY=your-inngest-event-key

# === App URLs (optional) ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
