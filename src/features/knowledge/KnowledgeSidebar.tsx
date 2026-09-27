import { useMutation, useQuery } from "convex/react";
import { BookOpen, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { KnowledgeItem } from "./KnowledgeItem";

const MAX_KNOWLEDGE = 25;

const textareaClassName = [
  "w-full resize-y rounded-lg border border-hairline bg-surface px-3 py-2.5 font-serif text-ink",
  "placeholder:text-muted/70",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted",
].join(" ");

type KnowledgeSidebarProps = {
  documentId: Id<"documents">;
};

export function KnowledgeSidebar({ documentId }: KnowledgeSidebarProps) {
  const items = useQuery(api.knowledge.listForDocument, { documentId });
  const addKnowledge = useMutation(api.knowledge.add);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const atLimit = items !== undefined && items.length >= MAX_KNOWLEDGE;

  function closeForm() {
    setTitle("");
    setContent("");
    setFormOpen(false);
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (atLimit) {
      return;
    }
    setAdding(true);
    try {
      await addKnowledge({ documentId, title, content });
      closeForm();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to add knowledge",
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-hairline bg-paper">
      <div className="flex flex-col gap-2 border-b border-hairline px-4 py-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl text-ink">Knowledge</h2>
          <button
            type="button"
            onClick={() => {
              setFormOpen(true);
            }}
            disabled={formOpen || atLimit}
            className="rounded-md p-1 text-ink transition-colors hover:bg-hairline/60 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Add knowledge"
          >
            <Plus className="size-5" aria-hidden />
          </button>
        </div>
        <p className="font-sans text-xs leading-relaxed text-muted">
          Add reference materials for the AI to use when helping you write.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        {formOpen ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => void handleAdd(e)}
          >
            <Input
              label="Title"
              name="knowledge-add-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              disabled={adding || atLimit}
              required
              maxLength={120}
              placeholder="e.g. Brand voice"
              autoFocus
            />
            <label className="flex flex-col gap-1.5 text-left">
              <span className="font-sans text-xs tracking-wide text-muted uppercase">
                Content
              </span>
              <textarea
                name="knowledge-add-content"
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                }}
                disabled={adding || atLimit}
                required
                rows={4}
                maxLength={20000}
                placeholder="Facts, notes, or excerpts…"
                className={textareaClassName}
              />
            </label>
            {atLimit ? (
              <p className="font-sans text-xs text-muted">
                Limit reached (25 items). Remove one to add more.
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit" pending={adding} disabled={atLimit}>
                Add knowledge
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={adding}
                onClick={closeForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        {items === undefined ? (
          <div className="min-h-24 bg-paper" aria-busy="true" />
        ) : items.length === 0 ? (
          formOpen ? null : (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-hairline/60">
                <BookOpen className="size-5 text-muted" aria-hidden />
              </div>
              <p className="font-sans text-sm text-muted">
                No knowledge added yet
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(true);
                }}
                className="font-sans text-sm text-accent underline-offset-4 hover:underline"
              >
                Add your first reference
              </button>
            </div>
          )
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <KnowledgeItem
                key={item._id}
                knowledgeId={item._id}
                title={item.title}
                content={item.content}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
