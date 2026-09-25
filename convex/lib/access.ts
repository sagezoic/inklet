import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type DbCtx = {
  db: QueryCtx["db"] | MutationCtx["db"];
  userId: Id<"users">;
};

export async function getOwnedDocument(
  ctx: DbCtx,
  documentId: Id<"documents">,
) {
  const document = await ctx.db.get("documents", documentId);
  if (document === null) {
    throw new Error("Document not found");
  }
  if (document.ownerId !== ctx.userId) {
    throw new Error("Unauthorized");
  }
  return document;
}
