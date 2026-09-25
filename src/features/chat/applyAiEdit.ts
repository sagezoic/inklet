import type { Editor } from "@tiptap/react";

export type AiEdit = {
  type:
    | "none"
    | "replace_document"
    | "replace_selection"
    | "insert_at_cursor"
    | "append";
  html: string;
  summary: string;
};

export type SelectionRange = { from: number; to: number } | null;

export function applyAiEdit(
  editor: Editor,
  edit: AiEdit,
  selectionRange: SelectionRange,
): boolean {
  switch (edit.type) {
    case "none":
      return false;
    case "replace_document":
      return editor.commands.setContent(edit.html);
    case "replace_selection":
      if (
        selectionRange !== null &&
        selectionRange.from !== selectionRange.to
      ) {
        return editor.commands.insertContentAt(
          { from: selectionRange.from, to: selectionRange.to },
          edit.html,
        );
      }
      return editor.commands.insertContent(edit.html);
    case "insert_at_cursor":
      return editor.commands.insertContent(edit.html);
    case "append":
      return editor.commands.insertContentAt(
        editor.state.doc.content.size,
        edit.html,
      );
    default: {
      const _exhaustive: never = edit.type;
      void _exhaustive;
      return false;
    }
  }
}
