const TOLERANCE_SECONDS = 60 * 60 * 24;

export type WebhookSubscription = {
  polarSubscriptionId: string;
  polarCustomerId: string;
  status: string;
  currentPeriodEnd: number | null;
  trialEnd: number | null;
  email: string | null;
  referenceId: string | null;
  polarProductId: string | null;
};

export type WebhookProduct = {
  polarProductId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  isRecurring: boolean;
  recurringInterval: string | null;
  priceAmount: number | null;
  priceCurrency: string | null;
};

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function timeField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (typeof value !== "string") {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function subscriptionFromWebhook(body: string): WebhookSubscription | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  if (
    parsed.type !== "subscription.created" &&
    parsed.type !== "subscription.updated"
  ) {
    return null;
  }
  if (!isRecord(parsed.data)) {
    return null;
  }

  const data = parsed.data;
  const polarSubscriptionId = stringField(data, "id");
  const polarCustomerId = stringField(data, "customer_id");
  const status = stringField(data, "status");
  if (
    polarSubscriptionId === null ||
    polarCustomerId === null ||
    status === null
  ) {
    return null;
  }

  const customer = isRecord(data.customer) ? data.customer : null;
  const metadata = isRecord(data.metadata) ? data.metadata : null;
  const referenceValue = metadata?.reference_id;
  const referenceId =
    typeof referenceValue === "string"
      ? referenceValue
      : typeof referenceValue === "number"
        ? String(referenceValue)
        : null;

  return {
    polarSubscriptionId,
    polarCustomerId,
    status,
    currentPeriodEnd: timeField(data, "current_period_end"),
    trialEnd: timeField(data, "trial_end"),
    email: customer === null ? null : stringField(customer, "email"),
    referenceId,
    polarProductId: stringField(data, "product_id"),
  };
}

function numberField(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  return typeof value === "number" ? value : null;
}

function booleanField(record: Record<string, unknown>, key: string): boolean {
  return record[key] === true;
}

export function productFromWebhook(body: string): WebhookProduct | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  if (parsed.type !== "product.created" && parsed.type !== "product.updated") {
    return null;
  }
  if (!isRecord(parsed.data)) {
    return null;
  }

  const data = parsed.data;
  const polarProductId = stringField(data, "id");
  const name = stringField(data, "name");
  if (polarProductId === null || name === null) {
    return null;
  }

  const prices = Array.isArray(data.prices) ? data.prices : [];
  const firstPrice = prices.find(isRecord) ?? null;

  return {
    polarProductId,
    name,
    description: stringField(data, "description"),
    isArchived: booleanField(data, "is_archived"),
    isRecurring: booleanField(data, "is_recurring"),
    recurringInterval: stringField(data, "recurring_interval"),
    priceAmount:
      firstPrice === null ? null : numberField(firstPrice, "price_amount"),
    priceCurrency:
      firstPrice === null ? null : stringField(firstPrice, "price_currency"),
  };
}
