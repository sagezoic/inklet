import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

type DialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "ghost";
  onConfirm: () => void;
  onCancel: () => void;
  initialFocus?: "confirm" | "cancel";
};

export function Dialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  initialFocus = "confirm",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const focusTarget =
        initialFocus === "cancel" ? cancelRef.current : confirmRef.current;
      focusTarget?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialFocus]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="m-auto w-full max-w-md rounded-2xl border border-hairline bg-surface p-0 shadow-soft backdrop:bg-ink/30"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCancel();
        }
      }}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="font-display text-2xl text-ink">
          {title}
        </h2>
        <p id={bodyId} className="font-serif text-base leading-relaxed text-muted">
          {body}
        </p>
        <div className="mt-2 flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={confirmVariant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
