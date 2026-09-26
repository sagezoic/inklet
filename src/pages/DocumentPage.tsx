import { useMutation, useQuery } from "convex/react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AccountMenu } from "../components/AccountMenu";
import { ChatSidebar } from "../features/chat/ChatSidebar";
import { Editor } from "../features/editor/Editor";
import { useAutosave } from "../features/editor/useAutosave";
import { KnowledgeSidebar } from "../features/knowledge/KnowledgeSidebar";
import { formatRelativeTime } from "../lib/formatRelativeTime";
import { useNow } from "../lib/useNow";

export function DocumentPage() {
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
    <DocumentEditor
      documentId={documentId}
      title={document.title}
      content={document.content}
      updatedAt={document.updatedAt}
    />
  );
}

function DocumentEditor({
  documentId,
  title,
  content,
  updatedAt,
}: {
  documentId: Id<"documents">;
  title: string;
  content: string;
  updatedAt: number;
}) {
  const now = useNow();
  const rename = useMutation(api.documents.rename);
  const { status, onChange } = useAutosave(documentId, content);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [editor, setEditor] = useState<TiptapEditor | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const committedTitleRef = useRef(title);

  useEffect(() => {
    if (!editingTitle) {
      setTitleDraft(title);
      committedTitleRef.current = title;
    }
  }, [title, editingTitle]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const commitTitle = useCallback(async () => {
    const trimmed = titleDraft.trim();
    if (trimmed.length === 0) {
      setTitleDraft(committedTitleRef.current);
      setEditingTitle(false);
      return;
    }
    if (trimmed === committedTitleRef.current) {
      setEditingTitle(false);
      return;
    }
    try {
      await rename({ documentId, title: trimmed });
      committedTitleRef.current = trimmed;
      setTitleDraft(trimmed);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to rename document",
      );
      setTitleDraft(committedTitleRef.current);
    } finally {
      setEditingTitle(false);
    }
  }, [documentId, rename, titleDraft]);

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void commitTitle();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setTitleDraft(committedTitleRef.current);
      setEditingTitle(false);
    }
  }

  let saveLabel: string;
  if (status === "saving") {
    saveLabel = "Saving…";
  } else if (status === "error") {
    saveLabel = "Could not save";
  } else {
    saveLabel = `Saved · ${formatRelativeTime(updatedAt, now)}`;
  }

  return (
    <div className="flex min-h-svh flex-col bg-paper">
      <header className="flex items-center gap-4 border-b border-hairline px-6 py-4">
        <button
          type="button"
          onClick={() => {
            setSidebarOpen((open) => !open);
          }}
          className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-hairline/60 hover:text-ink"
          aria-label={
            sidebarOpen
              ? "Collapse knowledge sidebar"
              : "Expand knowledge sidebar"
          }
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="size-4" aria-hidden />
          ) : (
            <PanelLeftOpen className="size-4" aria-hidden />
          )}
        </button>

        <Link
          to="/dashboard"
          className="shrink-0 font-sans text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          ← Dashboard
        </Link>

        {editingTitle ? (
          <input
            ref={titleInputRef}
            value={titleDraft}
            onChange={(event) => {
              setTitleDraft(event.target.value);
            }}
            onBlur={() => {
              void commitTitle();
            }}
            onKeyDown={handleTitleKeyDown}
            className="min-w-0 flex-1 bg-transparent font-display text-xl text-ink outline-none"
            aria-label="Document title"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setEditingTitle(true);
            }}
            className="min-w-0 flex-1 truncate text-left font-display text-xl text-ink"
          >
            {titleDraft}
          </button>
        )}

        <p className="shrink-0 font-sans text-xs text-muted" aria-live="polite">
          {saveLabel}
        </p>

        <button
          type="button"
          onClick={() => {
            setChatOpen((open) => !open);
          }}
          className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-hairline/60 hover:text-ink"
          aria-label={chatOpen ? "Collapse AI chat" : "Expand AI chat"}
          aria-expanded={chatOpen}
        >
          {chatOpen ? (
            <PanelRightClose className="size-4" aria-hidden />
          ) : (
            <PanelRightOpen className="size-4" aria-hidden />
          )}
        </button>

        <AccountMenu />
      </header>

      <div className="flex min-h-0 flex-1">
        {sidebarOpen ? (
          <KnowledgeSidebar documentId={documentId} />
        ) : null}

        <main className="flex min-w-0 flex-1 justify-center overflow-y-auto px-4 py-8 sm:px-6">
          <div className="w-full max-w-[760px] rounded-2xl border border-hairline bg-surface p-6 shadow-soft sm:p-8">
            <Editor
              initialHtml={content}
              onChange={onChange}
              onEditor={setEditor}
            />
          </div>
        </main>

        {chatOpen ? (
          <ChatSidebar documentId={documentId} editor={editor} />
        ) : null}
      </div>
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
