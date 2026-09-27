import { getAuthUserId } from "@convex-dev/auth/server";
import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalMutation, query } from "./_generated/server";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function polarServer(): "sandbox" | "production" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

/** Used by Polar.getUserInfo — kept as a named query so actions can runQuery it. */
export const getUserInfo = query({
  args: {},
  returns: v.object({
    userId: v.string(),
    email: v.string(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get("users", userId);
    if (user === null) {
      throw new Error("User not found");
    }
    const email = typeof user.email === "string" ? user.email.trim() : "";
    if (email.length === 0) {
      throw new Error("User email is required for billing");
    }
    return { userId, email };
  },
});

export const polar = new Polar(components.polar, {
  getUserInfo: async (
    ctx,
  ): Promise<{ userId: string; email: string }> => {
    return await ctx.runQuery(api.polar.getUserInfo, {});
  },
  server: polarServer(),
});

export const linkCustomerFromSubscription = internalMutation({
  args: {
    customerId: v.string(),
    email: v.optional(v.string()),
    referenceId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    let userId: Id<"users"> | null = null;

    if (args.referenceId !== undefined) {
      const normalizedId = ctx.db.normalizeId("users", args.referenceId);
      if (normalizedId !== null) {
        const user = await ctx.db.get("users", normalizedId);
        if (user !== null) {
          userId = user._id;
        }
      }
    }

    if (userId === null && args.email !== undefined) {
      const emailsToTry = new Set<string>();
      const normalized = normalizeEmail(args.email);
      if (normalized.length > 0) {
        emailsToTry.add(normalized);
      }
      const trimmed = args.email.trim();
      if (trimmed.length > 0) {
        emailsToTry.add(trimmed);
      }
      for (const email of emailsToTry) {
        const user = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", email))
          .unique();
        if (user !== null) {
          userId = user._id;
          break;
        }
      }
    }

    if (userId === null) {
      return null;
    }

    await ctx.runMutation(components.polar.lib.insertCustomer, {
      id: args.customerId,
      userId,
    });
    return null;
  },
});
