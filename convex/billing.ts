import { v } from "convex/values";
import { isEntitled } from "./lib/entitlement";
import { authedQuery } from "./lib/customFunctions";

export { assertEntitled } from "./lib/entitlement";

export const access = authedQuery({
  args: {},
  returns: v.object({
    entitled: v.boolean(),
    email: v.union(v.string(), v.null()),
    userId: v.id("users"),
  }),
  handler: async (ctx) => {
    const user = await ctx.db.get("users", ctx.userId);
    if (user === null) {
      throw new Error("User not found");
    }

    const trimmedEmail =
      typeof user.email === "string" ? user.email.trim() : "";
    const email = trimmedEmail.length > 0 ? trimmedEmail : null;
    const entitled = await isEntitled(ctx, ctx.userId);

    return {
      entitled,
      email,
      userId: ctx.userId,
    };
  },
});
