import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { getOwnedDocument } from "./lib/access";
import { authedMutation, authedQuery } from "./lib/customFunctions";

const documentFieldsValidator = v.object({
  _id: v.id("documents"),
  title: v.string(),
  content: v.string(),
  updatedAt: v.number(),
});

export const list = authedQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(documentFieldsValidator),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("documents")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", ctx.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...result,
      page: result.page.map((doc) => ({
        _id: doc._id,
        title: doc.title,
        content: doc.content,
        updatedAt: doc.updatedAt,
      })),
    };
  },
});

export const get = authedQuery({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.union(documentFieldsValidator, v.null()),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("documents", args.documentId);
    if (existing === null || existing.ownerId !== ctx.userId) {
      return null;
    }
    return {
      _id: existing._id,
      title: existing.title,
      content: existing.content,
      updatedAt: existing.updatedAt,
    };
  },
});

export const create = authedMutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.id("documents"),
  handler: async (ctx, args) => {
    const title = args.title?.trim() || "Untitled document";
    return await ctx.db.insert("documents", {
      ownerId: ctx.userId,
      title,
      content: "",
      updatedAt: Date.now(),
    });
  },
});

export const rename = authedMutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    const title = args.title.trim();
    if (title.length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (title.length > 200) {
      throw new Error("Title must be at most 200 characters");
    }
    await ctx.db.patch("documents", args.documentId, { title });
    return null;
  },
});

export const saveContent = authedMutation({
  args: {
    documentId: v.id("documents"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    await ctx.db.patch("documents", args.documentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = authedMutation({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    await ctx.db.delete("documents", args.documentId);

    for (;;) {
      const knowledgeRows = await ctx.db
        .query("knowledge")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .take(100);
      if (knowledgeRows.length === 0) {
        break;
      }
      for (const row of knowledgeRows) {
        await ctx.db.delete("knowledge", row._id);
      }
    }

    for (;;) {
      const chatRows = await ctx.db
        .query("chatMessages")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .take(100);
      if (chatRows.length === 0) {
        break;
      }
      for (const row of chatRows) {
        await ctx.db.delete("chatMessages", row._id);
      }
    }

    return null;
  },
});
