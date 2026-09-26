import { v } from "convex/values";
import { authedMutation, authedQuery } from "./lib/customFunctions";

function displayField(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const current = authedQuery({
  args: {},
  returns: v.object({
    name: v.union(v.string(), v.null()),
    email: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.get("users", ctx.userId);
    if (user === null) {
      throw new Error("User not found");
    }
    return {
      name: displayField(user.name),
      email: displayField(user.email),
    };
  },
});

export const updateProfile = authedMutation({
  args: {
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const trimmed = args.name.trim();
    if (trimmed.length > 80) {
      throw new Error("Name must be at most 80 characters");
    }

    const user = await ctx.db.get("users", ctx.userId);
    if (user === null) {
      throw new Error("User not found");
    }

    if (trimmed.length === 0) {
      await ctx.db.patch("users", ctx.userId, { name: undefined });
    } else {
      await ctx.db.patch("users", ctx.userId, { name: trimmed });
    }

    return null;
  },
});
