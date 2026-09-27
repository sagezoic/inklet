import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import {
  subscriptionFromWebhook,
  toDatabaseSubscription,
  webhookSignatureMatches,
} from "./polarWebhook";

const http = httpRouter();

auth.addHttpRoutes(http);

async function linkCustomerFromEvent(
  ctx: {
    runMutation: (
      fn: typeof internal.polar.linkCustomerFromSubscription,
      args: {
        customerId: string;
        email?: string;
        referenceId?: string;
      },
    ) => Promise<null>;
  },
  event: {
    data: {
      customerId: string;
      customer: { email?: string | null };
      metadata: Record<string, string | number | boolean>;
    };
  },
): Promise<void> {
  const referenceRaw = event.data.metadata.reference_id;
  const referenceId =
    typeof referenceRaw === "string"
      ? referenceRaw
      : typeof referenceRaw === "number"
        ? String(referenceRaw)
        : undefined;
  const email =
    typeof event.data.customer.email === "string"
      ? event.data.customer.email
      : undefined;

  await ctx.runMutation(internal.polar.linkCustomerFromSubscription, {
    customerId: event.data.customerId,
    ...(email !== undefined ? { email } : {}),
    ...(referenceId !== undefined ? { referenceId } : {}),
  });
}

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
      await ctx.runMutation(components.polar.lib.createSubscription, {
        subscription: toDatabaseSubscription(subscription),
      });
      await linkCustomerFromEvent(ctx, { data: subscription });
    }

    return new Response("Accepted", { status: 202 });
  }),
});

export default http;
