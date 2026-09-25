import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getOwnedDocument } from "./lib/access";
import { authedQuery } from "./lib/customFunctions";

const chatMessageFieldsValidator = v.object({
  _id: v.id("chatMessages"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  editSummary: v.optional(v.string()),
  createdAt: v.number(),
});

const roleValidator = v.union(v.literal("user"), v.literal("assistant"));

export const listForDocument = authedQuery({
  args: {
    documentId: v.id("documents"),
  },
  returns: v.array(chatMessageFieldsValidator),
  handler: async (ctx, args) => {
    await getOwnedDocument(ctx, args.documentId);
    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(100);
    return rows.reverse().map((row) => ({
      _id: row._id,
      role: row.role,
      content: row.content,
      editSummary: row.editSummary,
      createdAt: row.createdAt,
    }));
  },
});

export const getContext = internalQuery({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
  },
  returns: v.object({
    document: v.object({
      title: v.string(),
      content: v.string(),
    }),
    knowledge: v.array(
      v.object({
        title: v.string(),
        content: v.string(),
      }),
    ),
    messages: v.array(chatMessageFieldsValidator),
  }),
  handler: async (ctx, args) => {
    const document = await getOwnedDocument(
      { db: ctx.db, userId: args.userId },
      args.documentId,
    );

    const knowledgeRows = await ctx.db
      .query("knowledge")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("asc")
      .take(25);

    const messageRows = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .order("desc")
      .take(20);

    return {
      document: {
        title: document.title,
        content: document.content,
      },
      knowledge: knowledgeRows.map((row) => ({
        title: row.title,
        content: row.content,
      })),
      messages: messageRows.reverse().map((row) => ({
        _id: row._id,
        role: row.role,
        content: row.content,
        editSummary: row.editSummary,
        createdAt: row.createdAt,
      })),
    };
  },
});

export const saveMessage = internalMutation({
  args: {
    documentId: v.id("documents"),
    userId: v.id("users"),
    role: roleValidator,
    content: v.string(),
    editSummary: v.optional(v.string()),
  },
  returns: v.id("chatMessages"),
  handler: async (ctx, args) => {
    await getOwnedDocument(
      { db: ctx.db, userId: args.userId },
      args.documentId,
    );

    return await ctx.db.insert("chatMessages", {
      documentId: args.documentId,
      ownerId: args.userId,
      role: args.role,
      content: args.content,
      editSummary: args.editSummary,
      createdAt: Date.now(),
    });
  },
});
