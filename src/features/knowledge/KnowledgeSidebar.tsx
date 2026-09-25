import { useMutation, useQuery } from "convex/react";
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

  const atLimit = items !== undefined && items.length >= MAX_KNOWLEDGE;

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (atLimit) {
      return;
    }
    setAdding(true);
    try {
      await addKnowledge({ documentId, title, content });
      setTitle("");
      setContent("");
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
      <div className="flex flex-col gap-1 border-b border-hairline px-4 py-4">
        <h2 className="font-display text-xl text-ink">Knowledge</h2>
        <p className="font-sans text-xs leading-relaxed text-muted">
          Plain text context for the AI writer.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
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
          <Button type="submit" pending={adding} disabled={atLimit}>
            Add knowledge
          </Button>
        </form>

        {items === undefined ? (
          <div className="min-h-24 bg-paper" aria-busy="true" />
        ) : items.length === 0 ? (
          <p className="font-serif text-sm text-muted">
            No knowledge yet. Add notes the AI can draw on.
          </p>
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
