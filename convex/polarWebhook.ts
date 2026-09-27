import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { webhookSubscriptionCreatedPayloadFromJSON } from "@polar-sh/sdk/models/components/webhooksubscriptioncreatedpayload.js";
import { webhookSubscriptionUpdatedPayloadFromJSON } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload.js";

export function toDatabaseSubscription(subscription: Subscription) {
  return {
    id: subscription.id,
    customerId: subscription.customerId,
    createdAt: subscription.createdAt.toISOString(),
    modifiedAt: subscription.modifiedAt?.toISOString() ?? null,
    productId: subscription.productId,
    checkoutId: subscription.checkoutId,
    amount: subscription.amount,
    currency: subscription.currency,
    recurringInterval: subscription.recurringInterval,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    customerCancellationReason: subscription.customerCancellationReason,
    customerCancellationComment: subscription.customerCancellationComment,
    startedAt: subscription.startedAt?.toISOString() ?? null,
    endedAt: subscription.endedAt?.toISOString() ?? null,
    metadata: subscription.metadata,
    discountId: subscription.discountId,
    canceledAt: subscription.canceledAt?.toISOString() ?? null,
    endsAt: subscription.endsAt?.toISOString() ?? null,
    recurringIntervalCount: subscription.recurringIntervalCount,
    trialStart: subscription.trialStart?.toISOString() ?? null,
    trialEnd: subscription.trialEnd?.toISOString() ?? null,
    seats: subscription.seats ?? null,
    customFieldData: subscription.customFieldData,
  };
}

const TOLERANCE_SECONDS = 60 * 60 * 24;

function decodeBase64(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const binary = atob(value);
    const raw = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(raw);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function secretKeys(secret: string): Uint8Array[] {
  const keys = [new TextEncoder().encode(secret)];
  const stripped = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  const decoded = decodeBase64(stripped);
  if (decoded !== null && decoded.length > 0) {
    keys.push(decoded);
  }
  return keys;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function copyBytes(source: Uint8Array): Uint8Array<ArrayBuffer> {
  const raw = new ArrayBuffer(source.byteLength);
  const copy = new Uint8Array(raw);
  for (let index = 0; index < source.length; index += 1) {
    copy[index] = source[index] ?? 0;
  }
  return copy;
}

async function hmacBase64(key: Uint8Array, content: string): Promise<string> {
  const copy = copyBytes(key);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    copy,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(content),
  );
  return bytesToBase64(new Uint8Array(signature));
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) {
    return false;
  }
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

export async function webhookSignatureMatches(
  body: string,
  headers: Headers,
  secret: string,
): Promise<boolean> {
  if (secret.length === 0) {
    return false;
  }

  const webhookId = headers.get("webhook-id");
  const timestampHeader = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (
    webhookId === null ||
    timestampHeader === null ||
    signatureHeader === null
  ) {
    return false;
  }

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > TOLERANCE_SECONDS) {
    return false;
  }

  const signedContent = `${webhookId}.${timestampHeader}.${body}`;
  for (const key of secretKeys(secret)) {
    const expected = await hmacBase64(key, signedContent);
    for (const candidate of signatureHeader.split(" ")) {
      const [version, signature] = candidate.split(",");
      if (
        version === "v1" &&
        signature !== undefined &&
        timingSafeEqual(signature, expected)
      ) {
        return true;
      }
    }
  }
  return false;
}

export function subscriptionFromWebhook(
  body: string,
): Subscription | null {
  const created = webhookSubscriptionCreatedPayloadFromJSON(body);
  if (created.ok) {
    return created.value.data;
  }
  const updated = webhookSubscriptionUpdatedPayloadFromJSON(body);
  if (updated.ok) {
    return updated.value.data;
  }
  return null;
}
