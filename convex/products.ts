import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const upsertFromWebhook = internalMutation({
  args: {
    polarProductId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    isArchived: v.boolean(),
    isRecurring: v.boolean(),
    recurringInterval: v.union(v.string(), v.null()),
    priceAmount: v.union(v.number(), v.null()),
    priceCurrency: v.union(v.string(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_polar_product", (q) =>
        q.eq("polarProductId", args.polarProductId),
      )
      .unique();

    if (existing !== null) {
      await ctx.db.patch("products", existing._id, {
        name: args.name,
        description: args.description,
        isArchived: args.isArchived,
        isRecurring: args.isRecurring,
        recurringInterval: args.recurringInterval,
        priceAmount: args.priceAmount,
        priceCurrency: args.priceCurrency,
      });
      return null;
    }

    await ctx.db.insert("products", args);
    return null;
  },
});
