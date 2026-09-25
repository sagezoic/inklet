import { Button } from "../../components/ui/Button";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  editSummary?: string;
  showUndo?: boolean;
  onUndo?: () => void;
};

export function ChatMessage({
  role,
  content,
  editSummary,
  showUndo = false,
  onUndo,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <li
      className={[
        "flex flex-col gap-1.5 rounded-lg px-3 py-2.5",
        isUser ? "bg-hairline/40" : "bg-surface",
      ].join(" ")}
    >
      <span className="font-sans text-xs tracking-wide text-muted uppercase">
        {isUser ? "You" : "Assistant"}
      </span>
      <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-ink">
        {content}
      </p>
      {editSummary !== undefined && editSummary.length > 0 ? (
        <p className="font-sans text-xs text-muted">{editSummary}</p>
      ) : null}
      {showUndo && onUndo !== undefined ? (
        <div>
          <Button type="button" variant="ghost" size="md" onClick={onUndo}>
            Undo
          </Button>
        </div>
      ) : null}
    </li>
  );
}
