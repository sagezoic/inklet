import { v } from "convex/values";
import { getOwnedDocument } from "./lib/access";
import { authedMutation, authedQuery } from "./lib/customFunctions";

const knowledgeFieldsValidator = v.object({
  _id: v.id("knowledge"),
  documentId: v.id("documents"),
  ownerId: v.id("users"),
  title: v.string(),
  content: v.string(),
  createdAt: v.number(),
});

function validateKnowledgeFields(title: string, content: string) {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 120) {
    throw new Error("Title must be between 1 and 120 characters");
  }
  if (trimmedContent.length < 1 || trimmedContent.length > 20000) {
    throw new Error("Content must be between 1 and 20000 characters");
  }
  return { title: trimmedTitle, content: trimmedContent };
}

export const listForDocument = authedQuery({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.array(knowledgeFieldsValidator),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    const rows = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .take(100);
    return rows.map((row) => ({
      _id: row._id,
      documentId: row.documentId,
      ownerId: row.ownerId,
      title: row.title,
      content: row.content,
      createdAt: row.createdAt,
    }));
  },
});

export const add = authedMutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    content: v.string(),
  },
  returns: v.id("knowledge"),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    const { title, content } = validateKnowledgeFields(args.title, args.content);

    const existing = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .take(25);
    if (existing.length >= 25) {
      throw new Error("Knowledge limit reached (25 per document)");
    }

    return await ctx.db.insert("knowledge", {
      documentId: args.documentId,
      ownerId: ctx.userId,
      title,
      content,
      createdAt: Date.now(),
    });
  },
});

export const update = authedMutation({
  args: {
    knowledgeId: v.id("knowledge"),
    title: v.string(),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const knowledge = await ctx.db.get("knowledge", args.knowledgeId);
    if (knowledge === null) {
      throw new Error("Knowledge not found");
    }
    await getOwnedDocument(ctx, knowledge.documentId);
    if (knowledge.ownerId !== ctx.userId) {
      throw new Error("Unauthorized");
    }
    const { title, content } = validateKnowledgeFields(args.title, args.content);
    await ctx.db.patch("knowledge", args.knowledgeId, { title, content });
    return null;
  },
});

export const remove = authedMutation({
  args: {
    knowledgeId: v.id("knowledge"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const knowledge = await ctx.db.get("knowledge", args.knowledgeId);
    if (knowledge === null) {
      throw new Error("Knowledge not found");
    }
    await getOwnedDocument(ctx, knowledge.documentId);
    if (knowledge.ownerId !== ctx.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete("knowledge", args.knowledgeId);
    return null;
  },
});
