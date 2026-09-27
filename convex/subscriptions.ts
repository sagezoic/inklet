import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internalMutation } from "./_generated/server";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserId(
  ctx: MutationCtx,
  referenceId: string | null,
  email: string | null,
): Promise<Id<"users"> | null> {
  if (referenceId !== null) {
    const normalizedId = ctx.db.normalizeId("users", referenceId);
    if (normalizedId !== null) {
      const user = await ctx.db.get("users", normalizedId);
      if (user !== null) {
        return user._id;
      }
    }
  }

  if (email === null) {
    return null;
  }

  const emailsToTry = new Set<string>();
  const normalized = normalizeEmail(email);
  if (normalized.length > 0) {
    emailsToTry.add(normalized);
  }
  const trimmed = email.trim();
  if (trimmed.length > 0) {
    emailsToTry.add(trimmed);
  }

  for (const candidate of emailsToTry) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", candidate))
      .unique();
    if (user !== null) {
      return user._id;
    }
  }

  return null;
}

export const upsertFromWebhook = internalMutation({
  args: {
    polarSubscriptionId: v.string(),
    polarCustomerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.union(v.number(), v.null()),
    trialEnd: v.union(v.number(), v.null()),
    email: v.union(v.string(), v.null()),
    referenceId: v.union(v.string(), v.null()),
    polarProductId: v.union(v.string(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_subscription", (q) =>
        q.eq("polarSubscriptionId", args.polarSubscriptionId),
      )
      .unique();

    const userId = await findUserId(ctx, args.referenceId, args.email);

    if (existing !== null) {
      await ctx.db.patch("subscriptions", existing._id, {
        ...(userId !== null ? { userId } : {}),
        polarCustomerId: args.polarCustomerId,
        ...(args.polarProductId !== null
          ? { polarProductId: args.polarProductId }
          : {}),
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
        trialEnd: args.trialEnd,
      });
      return null;
    }

    if (userId === null) {
      console.error("Subscription webhook did not match a user", {
        polarSubscriptionId: args.polarSubscriptionId,
      });
      return null;
    }

    await ctx.db.insert("subscriptions", {
      userId,
      polarCustomerId: args.polarCustomerId,
      polarSubscriptionId: args.polarSubscriptionId,
      ...(args.polarProductId !== null
        ? { polarProductId: args.polarProductId }
        : {}),
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      trialEnd: args.trialEnd,
    });
    return null;
  },
});
