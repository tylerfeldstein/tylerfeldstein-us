import { ConvexError } from "convex/values";
import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Get authentication information from the context
 * Does NOT sync the user automatically anymore
 */
export async function getAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    return null;
  }
  
  return identity;
}

/**
 * Ensure user is authenticated and throw if not
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const identity = await getAuth(ctx);
  
  if (!identity) {
    throw new ConvexError("Unauthorized");
  }
  
  return identity;
} 