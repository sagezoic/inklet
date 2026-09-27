import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import {
  productFromWebhook,
  subscriptionFromWebhook,
  webhookSignatureMatches,
} from "./polarWebhook";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/polar/events",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const secret = process.env.POLAR_WEBHOOK_SECRET ?? "";
    const valid = await webhookSignatureMatches(body, request.headers, secret);
    if (!valid) {
      console.error("No matching signature found");
      return new Response("Forbidden", { status: 403 });
    }

    const subscription = subscriptionFromWebhook(body);
    if (subscription !== null) {
      await ctx.runMutation(internal.subscriptions.upsertFromWebhook, subscription);
    }

    const product = productFromWebhook(body);
    if (product !== null) {
      await ctx.runMutation(internal.products.upsertFromWebhook, product);
    }

    return new Response("Accepted", { status: 202 });
  }),
});

export default http;
