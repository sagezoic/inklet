import { useMutation } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

const DEBOUNCE_MS = 1000;

export function useAutosave(
  documentId: Id<"documents">,
  initialContent: string,
): {
  status: AutosaveStatus;
  onChange: (html: string) => void;
} {
  const saveContent = useMutation(api.documents.saveContent);
  const [status, setStatus] = useState<AutosaveStatus>("idle");

  const lastSavedHtmlRef = useRef(initialContent);
  const pendingHtmlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const toastedErrorRef = useRef(false);
  const documentIdRef = useRef(documentId);
  const saveContentRef = useRef(saveContent);

  documentIdRef.current = documentId;
  saveContentRef.current = saveContent;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const persist = useCallback(async (html: string) => {
    if (html === lastSavedHtmlRef.current) {
      pendingHtmlRef.current = null;
      return;
    }
    if (savingRef.current) {
      pendingHtmlRef.current = html;
      return;
    }

    savingRef.current = true;
    pendingHtmlRef.current = null;
    setStatus("saving");

    try {
      await saveContentRef.current({
        documentId: documentIdRef.current,
        content: html,
      });
      lastSavedHtmlRef.current = html;
      toastedErrorRef.current = false;
      setStatus("saved");

      // If something arrived while we were saving, schedule it.
      if (
        pendingHtmlRef.current !== null &&
        pendingHtmlRef.current !== lastSavedHtmlRef.current
      ) {
        const next = pendingHtmlRef.current;
        clearTimer();
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          void persist(next);
        }, DEBOUNCE_MS);
      }
    } catch (err) {
      setStatus("error");
      if (!toastedErrorRef.current) {
        toastedErrorRef.current = true;
        toast.error(
          err instanceof Error ? err.message : "Could not save document",
        );
      }
    } finally {
      savingRef.current = false;
    }
  }, [clearTimer]);

  const flush = useCallback(() => {
    clearTimer();
    const html = pendingHtmlRef.current;
    if (html === null) {
      return;
    }
    void persist(html);
  }, [clearTimer, persist]);

  const onChange = useCallback(
    (html: string) => {
      pendingHtmlRef.current = html;
      clearTimer();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        const next = pendingHtmlRef.current;
        if (next !== null) {
          void persist(next);
        }
      }, DEBOUNCE_MS);
    },
    [clearTimer, persist],
  );

  useEffect(() => {
    const onBeforeUnload = () => {
      const html = pendingHtmlRef.current;
      if (html === null || html === lastSavedHtmlRef.current) {
        return;
      }
      clearTimer();
      pendingHtmlRef.current = null;
      void saveContentRef.current({
        documentId: documentIdRef.current,
        content: html,
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimer();
      const html = pendingHtmlRef.current;
      if (html !== null && html !== lastSavedHtmlRef.current) {
        pendingHtmlRef.current = null;
        void saveContentRef.current({
          documentId: documentIdRef.current,
          content: html,
        });
      }
    };
  }, [clearTimer, flush]);

  return { status, onChange };
}
