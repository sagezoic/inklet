import { useQuery } from "convex/react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function DocumentPlaceholderPage() {
  const { id } = useParams();
  const documentId =
    id !== undefined && id.length > 0 ? (id as Id<"documents">) : null;

  const document = useQuery(
    api.documents.get,
    documentId !== null ? { documentId } : "skip",
  );

  if (documentId === null) {
    return <DocumentNotFound />;
  }

  if (document === undefined) {
    return <div className="min-h-svh bg-paper" aria-busy="true" />;
  }

  if (document === null) {
    return <DocumentNotFound />;
  }

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center gap-4 border-b border-hairline px-6 py-5">
        <Link
          to="/dashboard"
          className="font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="font-display text-xl text-ink">{document.title}</h1>
      </header>
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="font-serif text-lg text-muted">The editor comes next.</p>
      </main>
    </div>
  );
}

function DocumentNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper px-6">
      <p className="font-serif text-lg text-muted">Document not found</p>
      <Link
        to="/dashboard"
        className="font-sans text-sm text-accent underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
