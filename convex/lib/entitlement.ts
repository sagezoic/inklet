import { components } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type EntitlementCtx = QueryCtx | MutationCtx;

export async function isEntitled(
  ctx: EntitlementCtx,
  userId: Id<"users">,
): Promise<boolean> {
  // Prefer the component query (active/non-ended). The Polar class method
  // listUserSubscriptions was removed in favor of listAllUserSubscriptions;
  // this matches the entitlement semantics we need without requiring product rows.
  const subscriptions = await ctx.runQuery(
    components.polar.lib.listUserSubscriptions,
    { userId },
  );
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
