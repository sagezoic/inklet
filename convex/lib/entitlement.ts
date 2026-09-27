import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type EntitlementCtx = QueryCtx | MutationCtx;

export async function isEntitled(
  ctx: EntitlementCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const subscriptions = await ctx.db
    .query("subscriptions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(20);
  return subscriptions.some(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing",
  );
}

export async function assertEntitled(
  ctx: EntitlementCtx,
  userId: Id<"users">,
): Promise<void> {
  if (!(await isEntitled(ctx, userId))) {
    throw new Error("An active subscription is required");
  }
}
