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
});
