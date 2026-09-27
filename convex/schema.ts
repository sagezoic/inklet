import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  documents: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_owner_updated", ["ownerId", "updatedAt"]),
  knowledge: defineTable({
    documentId: v.id("documents"),
    ownerId: v.id("users"),
    title: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId", "createdAt"]),
  chatMessages: defineTable({
    documentId: v.id("documents"),
    ownerId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    editSummary: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_document", ["documentId", "createdAt"]),
  subscriptions: defineTable({
    userId: v.id("users"),
    polarCustomerId: v.string(),
    polarSubscriptionId: v.string(),
    polarProductId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.union(v.number(), v.null()),
    trialEnd: v.union(v.number(), v.null()),
  })
    .index("by_user", ["userId"])
    .index("by_polar_subscription", ["polarSubscriptionId"]),
  products: defineTable({
    polarProductId: v.string(),
    name: v.string(),
    description: v.union(v.string(), v.null()),
    isArchived: v.boolean(),
    isRecurring: v.boolean(),
    recurringInterval: v.union(v.string(), v.null()),
    priceAmount: v.union(v.number(), v.null()),
    priceCurrency: v.union(v.string(), v.null()),
  }).index("by_polar_product", ["polarProductId"]),
});
