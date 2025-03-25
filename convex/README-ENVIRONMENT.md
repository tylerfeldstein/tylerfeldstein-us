# Convex Environment Variables Guide

This guide explains how to set up and manage environment variables for the Convex backend, particularly for integrating with Inngest for background functions and event processing.

## Overview

Convex environment variables allow configuration of your backend without hardcoding values. This is essential for:
- Connecting to external services (like Inngest)
- Managing different environments (development, staging, production)
- Securely handling sensitive credentials
- Adapting behavior based on the environment

## Required Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_URL` | URL of your Next.js application | `http://host.docker.internal:3000` (development) or `https://your-app.com` (production) |

## Setting Environment Variables

### Local Development

To set environment variables for local development:

```bash
# Set a single environment variable
npx convex env set VARIABLE_NAME value

# Example
npx convex env set NEXT_PUBLIC_URL http://host.docker.internal:3000
```

For local development with Docker, use `host.docker.internal` instead of `localhost` to allow Convex to reach your local Next.js server.

### Production

For production environments:

```bash
# Set production environment variables
npx convex env set NEXT_PUBLIC_URL https://your-production-url.com
```

## Listing Environment Variables

To view all configured environment variables:

```bash
npx convex env list
```

## Removing Environment Variables

To remove an environment variable:

```bash
npx convex env unset VARIABLE_NAME
```

## Using Environment Variables in Code

Access environment variables in your Convex functions:

```typescript
// In any Convex action, mutation, or query
const url = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
```

## Environment-Specific Setup

### Development

For local development:
1. Set `NEXT_PUBLIC_URL` to `http://host.docker.internal:3000`
2. Ensure your Next.js server is running on port 3000
3. Ensure Inngest Dev Server is running

### Production

For production:
1. Set `NEXT_PUBLIC_URL` to your actual deployed URL (e.g., `https://your-app.com`)
2. Ensure your Inngest API keys are properly configured

## Inngest Integration Environment Variables

The following environment variables are used for Inngest integration:

| Variable | Purpose | Where Set | Example |
|----------|---------|-----------|---------|
| `NEXT_PUBLIC_URL` | URL for Convex to reach your Next.js server | Convex | `https://your-app.com` |
| `INNGEST_EVENT_KEY` | API key for Inngest events | Next.js (.env.local) | `your_inngest_event_key` |
| `INNGEST_SIGNING_KEY` | Signing key for Inngest webhooks | Next.js (.env.local) | `your_inngest_signing_key` |

## Troubleshooting

### Connection Issues

If Convex cannot connect to your Next.js server:
1. Verify the `NEXT_PUBLIC_URL` is correctly set
2. For local development, make sure `host.docker.internal` resolves to your host machine
3. Check if your Next.js server is running on the expected port
4. Ensure network rules allow connections between Convex and your server

### Event Delivery Issues

If events aren't being received by Inngest:
1. Check Convex logs for any errors in the `sendInngestEvent` function
2. Verify the Next.js API route at `/api/inngest/event` is properly configured
3. Make sure Inngest Dev Server is running locally
4. Check for any network or CORS issues

## Best Practices

1. **Never hardcode URLs** or sensitive information in your Convex functions
2. **Use environment-specific defaults** as fallbacks (e.g., `process.env.VAR || "default"`)
3. **Document all required environment variables** in this README
4. **Keep sensitive credentials** out of your code and version control
5. **Test both development and production configurations** before deploying 