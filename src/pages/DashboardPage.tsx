import { useMutation, usePaginatedQuery } from "convex/react";
import {
  FileText,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AccountMenu } from "../components/AccountMenu";
import { Logo } from "../components/Logo";
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

function greetingFor(timestamp: number): string {
  const hour = new Date(timestamp).getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function countWords(content: string): number {
  const plain = content.replace(/<[^>]*>/g, " ").trim();
  return plain.length === 0 ? 0 : plain.split(/\s+/).length;
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
  const [search, setSearch] = useState("");

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
  const normalizedSearch = search.trim().toLowerCase();
  const visibleDocuments =
    normalizedSearch.length === 0
      ? results
      : results.filter(
          (doc) =>
            doc.title.toLowerCase().includes(normalizedSearch) ||
            excerptFromContent(doc.content)
              .toLowerCase()
              .includes(normalizedSearch),
        );
  const countLabel =
    status === "CanLoadMore" || status === "LoadingMore"
      ? `${results.length}+ documents`
      : `${results.length} ${results.length === 1 ? "document" : "documents"}`;
  const totalWords = results.reduce(
    (sum, doc) => sum + countWords(doc.content),
    0,
  );
  const lastEdited = results.reduce<number | null>(
    (latest, doc) =>
      latest === null || doc.updatedAt > latest ? doc.updatedAt : latest,
    null,
  );
  const stats = [
    {
      label: "Documents",
      value:
        status === "CanLoadMore" || status === "LoadingMore"
          ? `${results.length}+`
          : String(results.length),
    },
    { label: "Words written", value: totalWords.toLocaleString() },
    {
      label: "Last edited",
      value: lastEdited === null ? "—" : formatRelativeTime(lastEdited, now),
    },
  ];

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <Button pending={creating} onClick={() => void handleCreate()}>
            New document
          </Button>
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <section className="mb-16 grid gap-10 pt-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="font-sans text-xs font-medium tracking-[0.2em] text-muted uppercase">
              {greetingFor(now)}
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
              Every draft begins with a{" "}
              <em className="font-display italic">single sentence.</em>
            </h1>
            <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-muted">
              Pick up where you left off, or open a fresh page. Your sources and
              your co-writer are waiting beside the margin.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                pending={creating}
                onClick={() => void handleCreate()}
              >
                Start a new draft
              </Button>
            </div>
          </div>

          <Card className="grid grid-cols-3 divide-x divide-hairline p-0">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center">
                <p className="font-display text-2xl text-ink sm:text-3xl">
                  {status === "LoadingFirstPage" ? "·" : stat.value}
                </p>
                <p className="mt-1 font-sans text-xs text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </Card>
        </section>

        {!isEmpty ? (
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl tracking-tight text-ink">
                Your documents
              </h2>
              {status !== "LoadingFirstPage" ? (
                <p className="mt-1 font-sans text-sm text-muted">
                  {countLabel}
                </p>
              ) : null}
            </div>
            <label className="relative block w-full sm:w-72">
              <span className="sr-only">Search documents</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="Search documents"
                className="w-full rounded-full border border-hairline bg-white py-2 pr-4 pl-9 font-sans text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none"
              />
            </label>
          </div>
        ) : null}

        {status === "LoadingFirstPage" ? (
          <ul
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-label="Loading documents"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <li key={index}>
                <Card className="flex h-44 animate-pulse flex-col gap-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-hairline" />
                  <div className="h-3 w-full rounded bg-hairline/70" />
                  <div className="h-3 w-5/6 rounded bg-hairline/70" />
                  <div className="mt-auto h-3 w-1/3 rounded bg-hairline/70" />
                </Card>
              </li>
            ))}
          </ul>
        ) : isEmpty ? (
          <div className="flex flex-col items-center gap-5 py-24 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-hairline bg-white shadow-sm">
              <FileText className="size-6 text-muted" aria-hidden />
            </div>
            <h2 className="font-display text-3xl tracking-tight text-ink">
              A blank page awaits
            </h2>
            <p className="max-w-sm font-serif text-lg text-muted">
              No documents yet. Create your first one and start writing.
            </p>
            <Button pending={creating} onClick={() => void handleCreate()}>
              New document
            </Button>
          </div>
        ) : visibleDocuments.length === 0 ? (
          <p className="py-16 text-center font-serif text-lg text-muted">
            No documents match “{search.trim()}”.
          </p>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleDocuments.map((doc) => {
                const excerpt = excerptFromContent(doc.content);
                return (
                  <li key={doc._id}>
                    <Card
                      role="link"
                      tabIndex={0}
                      className="group relative flex h-full cursor-pointer flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md focus-visible:border-ink/30 focus-visible:outline-none"
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
                        <h3 className="font-display text-xl leading-snug text-ink">
                          {doc.title}
                        </h3>
                        <button
                          type="button"
                          aria-label={`Delete ${doc.title}`}
                          className="shrink-0 rounded-md p-1.5 text-muted transition-all hover:bg-hairline/60 hover:text-ink sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
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

            {status === "CanLoadMore" || status === "LoadingMore" ? (
              <div className="mt-10 flex justify-center">
                <Button
                  variant="secondary"
                  pending={status === "LoadingMore"}
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

      <footer className="border-t border-hairline py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Logo size="sm" />
            <p className="mt-2 font-serif text-sm leading-relaxed text-muted">
              A quiet place to write with your sources beside you.
            </p>
          </div>
          <div className="flex flex-col gap-2 font-sans text-xs text-muted sm:items-end">
            <Link
              to="/design-system"
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              Style Guide
            </Link>
            <p>© {new Date().getFullYear()} Inklet. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
