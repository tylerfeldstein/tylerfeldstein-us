#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting deployment of tylerfeldstein.us to Vercel...${NC}"

# Make sure all dependencies are installed
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm install

# Deploy Convex (as specified in vercel.json buildCommand)
#echo -e "${BLUE}Deploying Convex...${NC}"
#npx convex deploy

# Build the project locally with Vercel's build system (use prod environment)
echo -e "${BLUE}Building the project with Vercel...${NC}"
npx vercel build --prod

# Deploy to Vercel using the pre-built project
echo -e "${BLUE}Deploying to Vercel...${NC}"
npx vercel deploy --prebuilt --prod

echo -e "${GREEN}Deployment complete! 🚀${NC}"
echo -e "${GREEN}Your site is now live at https://tylerfeldstein.us${NC}" 