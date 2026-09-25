import { useMutation } from "convex/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Input } from "../../components/ui/Input";

const PREVIEW_MAX = 120;

const textareaClassName = [
  "w-full resize-y rounded-lg border border-hairline bg-surface px-3 py-2.5 font-serif text-ink",
  "placeholder:text-muted/70",
  "disabled:cursor-not-allowed disabled:bg-paper disabled:text-muted",
].join(" ");

function previewText(content: string): string {
  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length === 0) {
    return "";
  }
  if (plain.length <= PREVIEW_MAX) {
    return plain;
  }
  return `${plain.slice(0, PREVIEW_MAX).trimEnd()}…`;
}

type KnowledgeItemProps = {
  knowledgeId: Id<"knowledge">;
  title: string;
  content: string;
};

export function KnowledgeItem({
  knowledgeId,
  title,
  content,
}: KnowledgeItemProps) {
  const updateKnowledge = useMutation(api.knowledge.update);
  const removeKnowledge = useMutation(api.knowledge.remove);

  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const [contentDraft, setContentDraft] = useState(content);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function startEditing() {
    setTitleDraft(title);
    setContentDraft(content);
    setEditing(true);
  }

  function cancelEditing() {
    setTitleDraft(title);
    setContentDraft(content);
    setEditing(false);
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateKnowledge({
        knowledgeId,
        title: titleDraft,
        content: contentDraft,
      });
      setEditing(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update knowledge",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await removeKnowledge({ knowledgeId });
      setConfirmDelete(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete knowledge",
      );
    } finally {
      setDeleting(false);
    }
  }

  const preview = previewText(content);

  if (editing) {
    return (
      <li className="rounded-2xl border border-hairline bg-surface p-4">
        <form className="flex flex-col gap-3" onSubmit={(e) => void handleSave(e)}>
          <Input
            label="Title"
            name={`knowledge-title-${knowledgeId}`}
            value={titleDraft}
            onChange={(event) => {
              setTitleDraft(event.target.value);
            }}
            disabled={saving}
            required
            maxLength={120}
          />
          <label className="flex flex-col gap-1.5 text-left">
            <span className="font-sans text-xs tracking-wide text-muted uppercase">
              Content
            </span>
            <textarea
              name={`knowledge-content-${knowledgeId}`}
              value={contentDraft}
              onChange={(event) => {
                setContentDraft(event.target.value);
              }}
              disabled={saving}
              required
              rows={5}
              maxLength={20000}
              className={textareaClassName}
            />
          </label>
          <div className="flex gap-2">
            <Button type="submit" size="md" pending={saving}>
              Save
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={cancelEditing}
            >
              Cancel
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="rounded-2xl border border-hairline bg-surface p-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-lg leading-snug text-ink">{title}</h3>
        {preview.length === 0 ? (
          <p className="font-serif text-sm text-muted">Empty</p>
        ) : (
          <p className="font-serif text-sm leading-relaxed text-ink/80">
            {preview}
          </p>
        )}
        <div className="mt-1 flex gap-2">
          <Button type="button" variant="secondary" onClick={startEditing}>
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setConfirmDelete(true);
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        title="Delete this knowledge?"
        body={`“${title}” will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="primary"
        onConfirm={() => {
          if (!deleting) {
            void handleConfirmDelete();
          }
        }}
        onCancel={() => {
          if (!deleting) {
            setConfirmDelete(false);
          }
        }}
      />
    </li>
  );
}
