"use node";

import { getAuthUserId } from "@convex-dev/auth/server";
import { ApiError, GoogleGenAI, Type } from "@google/genai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, env } from "./_generated/server";

const GEMINI_MODEL = "gemini-3.8-flash";
const MAX_GENERATE_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1000] as const;

const EDIT_TYPES = [
  "none",
  "replace_document",
  "replace_selection",
  "insert_at_cursor",
  "append",
] as const;

type EditType = (typeof EDIT_TYPES)[number];

type ChatResult = {
  reply: string;
  edit: {
    type: EditType;
    html: string;
    summary: string;
  };
};

const editTypeValidator = v.union(
  v.literal("none"),
  v.literal("replace_document"),
  v.literal("replace_selection"),
  v.literal("insert_at_cursor"),
  v.literal("append"),
);

const chatResultValidator = v.object({
  reply: v.string(),
  edit: v.object({
    type: editTypeValidator,
    html: v.string(),
    summary: v.string(),
  }),
});

const MAX_MESSAGE_LENGTH = 4000;

const SYSTEM_INSTRUCTION = `You are a writing partner editing one document.
Ground claims in the provided knowledge. Do not invent facts beyond that knowledge and the document.
Allowed HTML tags only: p, h1, h2, h3, ul, ol, li, strong, em, blockquote, a, br. No script, style, or class attributes.
Edit types: none (questions, no document change), replace_document (rewrite the whole doc), replace_selection (only when a selection was provided), insert_at_cursor (insert at the user's cursor), append (add at the end). If a selection is present and the user asks to change that passage, use replace_selection. If they ask a question, use none and leave html empty.`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    reply: { type: Type.STRING },
    edit: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          format: "enum",
          enum: [...EDIT_TYPES],
        },
        html: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
      required: ["type", "html", "summary"],
    },
  },
  required: ["reply", "edit"],
};

function escapeKnowledgeTitle(title: string): string {
  return title.replaceAll("<", "").replaceAll(">", "");
}

function isEditType(value: unknown): value is EditType {
  return (
    typeof value === "string" &&
    (EDIT_TYPES as readonly string[]).includes(value)
  );
}

function parseChatResult(raw: unknown): ChatResult | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  if (!("reply" in raw) || typeof raw.reply !== "string") {
    return null;
  }
  if (!("edit" in raw) || typeof raw.edit !== "object" || raw.edit === null) {
    return null;
  }
  const edit = raw.edit;
  if (
    !("type" in edit) ||
    !("html" in edit) ||
    !("summary" in edit) ||
    typeof edit.html !== "string" ||
    typeof edit.summary !== "string" ||
    !isEditType(edit.type)
  ) {
    return null;
  }
  return {
    reply: raw.reply,
    edit: {
      type: edit.type,
      html: edit.html,
      summary: edit.summary,
    },
  };
}

function coerceChatResult(raw: unknown): ChatResult {
  const parsed = parseChatResult(raw);
  if (parsed) {
    return parsed;
  }
  if (typeof raw === "object" && raw !== null && "reply" in raw && typeof raw.reply === "string" && raw.reply.trim() !== "") {
    return {
      reply: raw.reply,
      edit: { type: "none", html: "", summary: "" },
    };
  }
  return {
    reply: "I could not produce a valid edit. Please try again.",
    edit: { type: "none", html: "", summary: "" },
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return undefined;
}

function isTransientGeminiError(error: unknown): boolean {
  const status = getErrorStatus(error);
  if (status === 429 || status === 500 || status === 503) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message;
  return (
    message.includes("UNAVAILABLE") || message.includes("RESOURCE_EXHAUSTED")
  );
}

export const chat = action({
  args: {
    documentId: v.id("documents"),
    message: v.string(),
    documentHtml: v.string(),
    selectionText: v.optional(v.string()),
  },
  returns: chatResultValidator,
  handler: async (ctx, args): Promise<ChatResult> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const trimmed = args.message.trim();
    if (trimmed.length === 0) {
      throw new Error("Message cannot be empty");
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      );
    }

    const context = await ctx.runQuery(internal.chat.getContext, {
      documentId: args.documentId,
      userId,
    });

    await ctx.runMutation(internal.chat.saveMessage, {
      documentId: args.documentId,
      userId,
      role: "user",
      content: trimmed,
    });

    if (!env.GEMINI_API_KEY) {
      throw new Error("AI is not configured");
    }

    const knowledgeBlocks = context.knowledge
      .map(
        (item) =>
          `<knowledge title="${escapeKnowledgeTitle(item.title)}">${item.content}</knowledge>`,
      )
      .join("\n");

    const chatHistory = context.messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const selectionSection =
      args.selectionText !== undefined && args.selectionText !== ""
        ? `\n\nSelection:\n${args.selectionText}`
        : "";

    const userContents = [
      "Knowledge:",
      knowledgeBlocks || "(none)",
      "",
      "Current document HTML:",
      args.documentHtml,
      selectionSection,
      "",
      "Recent chat:",
      chatHistory || "(none)",
      "",
      "User message:",
      trimmed,
    ].join("\n");

    let result: ChatResult;
    let geminiError: unknown;
    let responseText: string | undefined;
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      for (let attempt = 0; attempt < MAX_GENERATE_ATTEMPTS; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: userContents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              responseSchema,
            },
          });
          responseText = response.text;
          geminiError = undefined;
          break;
        } catch (error) {
          geminiError = error;
          const canRetry =
            isTransientGeminiError(error) &&
            attempt < MAX_GENERATE_ATTEMPTS - 1;
          if (!canRetry) {
            throw error;
          }
          const delayMs = RETRY_DELAYS_MS[attempt] ?? 1000;
          await sleep(delayMs);
        }
      }
    } catch (error) {
      console.error(error);
      geminiError = error;
    }

    if (geminiError !== undefined) {
      throw new Error(
        "Unable to write with AI right now. Please try again.",
      );
    }

    if (responseText === undefined || responseText.trim() === "") {
      throw new Error("Empty model response");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(responseText) as unknown;
    } catch {
      parsedJson = null;
    }

    result = coerceChatResult(parsedJson);

    if (
      result.edit.type === "replace_selection" &&
      (args.selectionText === undefined || args.selectionText === "")
    ) {
      result = {
        ...result,
        edit: {
          ...result.edit,
          type: "insert_at_cursor",
        },
      };
    }

    await ctx.runMutation(internal.chat.saveMessage, {
      documentId: args.documentId,
      userId,
      role: "assistant",
      content: result.reply,
      ...(result.edit.type !== "none"
        ? { editSummary: result.edit.summary }
        : {}),
    });

    return result;
  },
});
