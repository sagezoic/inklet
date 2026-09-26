import { useMutation, usePaginatedQuery } from "convex/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AccountMenu } from "../components/AccountMenu";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Dialog } from "../components/ui/Dialog";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import { useNow } from "../lib/useNow";

const EXCERPT_MAX = 160;

function excerptFromContent(content: string): string {
  const plain = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length === 0) {
    return "";
  }
  if (plain.length <= EXCERPT_MAX) {
    return plain;
  }
  return `${plain.slice(0, EXCERPT_MAX).trimEnd()}…`;
}

type PendingDelete = {
  documentId: Id<"documents">;
  title: string;
};

export function DashboardPage() {
  const navigate = useNavigate();
  const now = useNow();
  const createDocument = useMutation(api.documents.create);
  const removeDocument = useMutation(api.documents.remove);
  const { results, status, loadMore } = usePaginatedQuery(
    api.documents.list,
    {},
    { initialNumItems: 20 },
  );

  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  async function handleCreate() {
    setCreating(true);
    try {
      const id = await createDocument({});
      void navigate(`/documents/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create document",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleConfirmDelete() {
    if (pendingDelete === null) {
      return;
    }
    setDeleting(true);
    try {
      await removeDocument({ documentId: pendingDelete.documentId });
      setPendingDelete(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete document",
      );
    } finally {
      setDeleting(false);
    }
  }

  const isEmpty = status !== "LoadingFirstPage" && results.length === 0;

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-5">
        <p className="font-display text-2xl tracking-tight text-ink">Inklet</p>
        <div className="flex items-center gap-3">
          <Button pending={creating} onClick={() => void handleCreate()}>
            New document
          </Button>
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">

        {status === "LoadingFirstPage" ? (
          <div className="min-h-48 bg-paper" aria-busy="true" />
        ) : isEmpty ? (
          <div className="flex flex-col items-start gap-6 py-16">
            <p className="font-serif text-lg text-muted">
              No documents yet. Start writing.
            </p>
            <Button pending={creating} onClick={() => void handleCreate()}>
              New document
            </Button>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((doc) => {
                const excerpt = excerptFromContent(doc.content);
                return (
                  <li key={doc._id}>
                    <Card
                      role="link"
                      tabIndex={0}
                      className="group relative flex h-full cursor-pointer flex-col gap-3 p-5 transition-colors hover:border-ink/20"
                      onClick={() => {
                        void navigate(`/documents/${doc._id}`);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void navigate(`/documents/${doc._id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-display text-xl leading-snug text-ink">
                          {doc.title}
                        </h2>
                        <button
                          type="button"
                          aria-label={`Delete ${doc.title}`}
                          className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-hairline/60 hover:text-ink"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPendingDelete({
                              documentId: doc._id,
                              title: doc.title,
                            });
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                      {excerpt.length === 0 ? (
                        <p className="font-serif text-sm text-muted">
                          Empty document
                        </p>
                      ) : (
                        <p className="font-serif text-sm leading-relaxed text-ink/80">
                          {excerpt}
                        </p>
                      )}
                      <p className="mt-auto font-sans text-xs text-muted">
                        Edited {formatRelativeTime(doc.updatedAt, now)}
                      </p>
                    </Card>
                  </li>
                );
              })}
            </ul>

            {status === "CanLoadMore" ? (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => {
                    loadMore(20);
                  }}
                >
                  Load more
                </Button>
              </div>
            ) : null}
          </>
        )}
      </main>

      <Dialog
        open={pendingDelete !== null}
        title="Delete this document?"
        body={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently deleted. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmVariant="primary"
        onConfirm={() => {
          if (!deleting) {
            void handleConfirmDelete();
          }
        }}
        onCancel={() => {
          if (!deleting) {
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
