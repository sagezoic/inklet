import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";

const POLAR_BASE_URL = "https://sandbox-api.polar.sh";

export const emailForUser = internalQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId);
    if (user === null) {
      return null;
    }
    if (typeof user.email !== "string") {
      return null;
    }
    const trimmed = user.email.trim();
    return trimmed.length > 0 ? trimmed : null;
  },
});

function parseCustomerId(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  if (!("items" in raw) || !Array.isArray(raw.items)) {
    return null;
  }
  const first: unknown = raw.items[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  if (!("id" in first) || typeof first.id !== "string" || first.id.length === 0) {
    return null;
  }
  return first.id;
}

function parseCustomerPortalUrl(raw: unknown): string | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  if (
    !("customer_portal_url" in raw) ||
    typeof raw.customer_portal_url !== "string" ||
    raw.customer_portal_url.length === 0
  ) {
    return null;
  }
  return raw.customer_portal_url;
}

function isAllowedReturnUrl(returnUrl: string): boolean {
  try {
    const url = new URL(returnUrl);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const createSession = action({
  args: {
    returnUrl: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const email = await ctx.runQuery(internal.polarPortal.emailForUser, {
      userId,
    });
    if (email === null) {
      throw new Error("An email is required to manage your subscription.");
    }

    if (!isAllowedReturnUrl(args.returnUrl)) {
      throw new Error("Invalid return URL.");
    }

    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (accessToken === undefined || accessToken.trim() === "") {
      throw new Error("Polar is not configured.");
    }

    const customersResponse = await fetch(
      `${POLAR_BASE_URL}/v1/customers/?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
    );

    if (!customersResponse.ok) {
      console.error("Polar customers lookup failed", {
        status: customersResponse.status,
      });
      throw new Error("Could not open the subscription portal.");
    }

    const customersJson: unknown = await customersResponse.json();
    const customerId = parseCustomerId(customersJson);
    if (customerId === null) {
      throw new Error("No subscription found for this email.");
    }

    const sessionResponse = await fetch(
      `${POLAR_BASE_URL}/v1/customer-sessions/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: customerId,
          return_url: args.returnUrl,
        }),
      },
    );

    if (!sessionResponse.ok) {
      console.error("Polar customer session create failed", {
        status: sessionResponse.status,
      });
      throw new Error("Could not open the subscription portal.");
    }

    const sessionJson: unknown = await sessionResponse.json();
    const portalUrl = parseCustomerPortalUrl(sessionJson);
    if (portalUrl === null) {
      console.error("Polar customer session missing portal URL");
      throw new Error("Could not open the subscription portal.");
    }

    return portalUrl;
  },
});
