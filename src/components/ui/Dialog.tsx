import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Button } from "./Button";

type DialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "ghost" | "destructive";
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
      className="m-auto w-full max-w-md rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_40px_rgba(15,17,21,0.12),0_2px_8px_rgba(15,17,21,0.06)] backdrop:bg-[#0F1115]/30 backdrop:backdrop-blur-sm focus:outline-none"
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
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="font-display text-xl text-[#1A1C1F]">
              {title}
            </h3>
            <p id={bodyId} className="mt-1 font-serif text-sm leading-relaxed text-[#5C6068]">
              {body}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onCancel}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[#8B909A] transition hover:bg-[#F1F2F4] hover:text-[#1A1C1F]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2.5">
          <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
