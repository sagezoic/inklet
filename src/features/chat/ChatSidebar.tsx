import { useAction, useQuery } from "convex/react";
import type { Editor } from "@tiptap/react";
import { TextQuote, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/Button";
import { applyAiEdit, type SelectionRange } from "./applyAiEdit";
import { ChatMessage } from "./ChatMessage";

const textareaClassName = [
  "w-full resize-y rounded-lg border border-hairline bg-surface px-3 py-2.5 font-serif text-ink",
  "placeholder:text-muted/70",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted",
].join(" ");

export type ChatContextItem = {
  id: string;
  text: string;
};

type ChatSidebarProps = {
  documentId: Id<"documents">;
  editor: Editor | null;
  contextItems: ChatContextItem[];
  onRemoveContextItem: (id: string) => void;
  onClearContext: () => void;
};

function previewContextText(text: string): string {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const preview = words.slice(0, 2).join(" ");
  return words.length > 2 ? `${preview}…` : preview;
}

export function ChatSidebar({
  documentId,
  editor,
  contextItems,
  onRemoveContextItem,
  onClearContext,
}: ChatSidebarProps) {
  const messages = useQuery(api.chat.listForDocument, { documentId });
  const knowledge = useQuery(api.knowledge.listForDocument, { documentId });
  const chat = useAction(api.ai.chat);

  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const knowledgeCount = knowledge?.length ?? 0;

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingUserText, pending]);

  const lastMessage = messages !== undefined ? messages.at(-1) : undefined;
  const showLocalPending =
    pendingUserText !== null &&
    !(
      lastMessage !== undefined &&
      lastMessage.role === "user" &&
      lastMessage.content === pendingUserText
    );

  let undoMessageId: Id<"chatMessages"> | null = null;
  if (messages !== undefined) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const msg = messages[i];
      if (
        msg !== undefined &&
        msg.role === "assistant" &&
        msg.editSummary !== undefined &&
        msg.editSummary.length > 0
      ) {
        undoMessageId = msg._id;
        break;
      }
    }
  }

  async function handleSend() {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || pending) {
      return;
    }

    let selectionRange: SelectionRange = null;
    let selectionText: string | undefined;
    let documentHtml = "";

    if (editor !== null) {
      const { from, to } = editor.state.selection;
      selectionRange = { from, to };
      if (from !== to) {
        const text = editor.state.doc.textBetween(from, to, "\n");
        if (text.length > 0) {
          selectionText = text;
        }
      }
      documentHtml = editor.getHTML();
    }

    const contextSnippets = contextItems.map((item) => item.text);

    setDraft("");
    setPending(true);
    setPendingUserText(trimmed);

    try {
      const result = await chat({
        documentId,
        message: trimmed,
        documentHtml,
        ...(selectionText !== undefined ? { selectionText } : {}),
        ...(contextSnippets.length > 0 ? { contextSnippets } : {}),
      });

      onClearContext();

      if (editor !== null) {
        applyAiEdit(editor, result.edit, selectionRange);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send message",
      );
    } finally {
      setPending(false);
      setPendingUserText(null);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void handleSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  function handleUndo() {
    editor?.commands.undo();
  }

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-l border-hairline bg-paper">
      <div className="flex flex-col gap-2 border-b border-hairline px-4 py-4">
        <h2 className="font-display text-xl text-ink">Assistant</h2>
        <span className="inline-flex w-fit rounded-md border border-hairline bg-surface px-2 py-0.5 font-sans text-xs text-muted">
          Using {knowledgeCount} knowledge{" "}
          {knowledgeCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages === undefined ? (
          <div className="min-h-24 bg-paper" aria-busy="true" />
        ) : messages.length === 0 && !showLocalPending ? (
          <p className="font-serif text-sm text-muted">
            Ask for edits, rewrites, or questions about this document.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {(messages ?? []).map((msg) => (
              <ChatMessage
                key={msg._id}
                role={msg.role}
                content={msg.content}
                editSummary={msg.editSummary}
                showUndo={
                  editor !== null &&
                  undoMessageId !== null &&
                  msg._id === undoMessageId
                }
                onUndo={handleUndo}
              />
            ))}
            {showLocalPending && pendingUserText !== null ? (
              <ChatMessage role="user" content={pendingUserText} />
            ) : null}
          </ul>
        )}
        {pending ? (
          <p className="font-sans text-xs text-muted" aria-live="polite">
            Thinking…
          </p>
        ) : null}
        <div ref={listEndRef} />
      </div>

      <form
        className="flex flex-col gap-3 border-t border-hairline px-4 py-4"
        onSubmit={handleSubmit}
      >
        {contextItems.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Chat context">
            {contextItems.map((item) => (
              <li
                key={item.id}
                title={item.text}
                className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-hairline bg-surface py-1 pr-1 pl-2 font-sans text-xs text-ink"
              >
                <TextQuote className="size-3.5 shrink-0 text-muted" aria-hidden />
                <span className="max-w-[160px] truncate">
                  {previewContextText(item.text)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveContextItem(item.id);
                  }}
                  disabled={pending}
                  aria-label={`Remove "${previewContextText(item.text)}" from context`}
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-hairline/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="flex flex-col gap-1.5 text-left">
          <span className="font-sans text-xs tracking-wide text-muted uppercase">
            Message
          </span>
          <textarea
            name="chat-message"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={pending}
            rows={3}
            placeholder="Ask the assistant…"
            className={textareaClassName}
          />
        </label>
        <Button type="submit" pending={pending} disabled={draft.trim().length === 0}>
          Send
        </Button>
      </form>
    </aside>
  );
}
