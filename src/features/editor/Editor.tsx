import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  EditorContent,
  useEditor,
  type Editor as TiptapEditor,
} from "@tiptap/react";
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { Toolbar } from "./Toolbar";

type EditorProps = {
  initialHtml: string;
  onChange: (html: string) => void;
  onEditor?: (editor: TiptapEditor | null) => void;
  onAddToChatContext?: (text: string) => void;
};

function getSelectedText(editor: TiptapEditor): string {
  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, "\n").trim();
}

// Must be referentially stable: BubbleMenu dispatches a transaction whenever
// these props change, and the editor re-renders on every transaction.
const addToChatMenuOptions: BubbleMenuProps["options"] = {
  placement: "right",
  offset: 8,
};

const shouldShowAddToChat: BubbleMenuProps["shouldShow"] = ({
  editor,
  state,
}) =>
  editor.isEditable &&
  !state.selection.empty &&
  getSelectedText(editor).length > 0;

export function Editor({
  initialHtml,
  onChange,
  onEditor,
  onAddToChatContext,
}: EditorProps) {
  const hydratedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onEditorRef = useRef(onEditor);
  onEditorRef.current = onEditor;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        underline: false,
        link: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: "",
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor === null || hydratedRef.current) {
      return;
    }
    editor.commands.setContent(initialHtml, { emitUpdate: false });
    hydratedRef.current = true;
  }, [editor, initialHtml]);

  useEffect(() => {
    onEditorRef.current?.(editor);
    return () => {
      onEditorRef.current?.(null);
    };
  }, [editor]);

  useEffect(() => {
    return () => {
      hydratedRef.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Toolbar editor={editor} />
      <div className="prose-inklet">
        <EditorContent editor={editor} />
      </div>
      {editor !== null && onAddToChatContext !== undefined ? (
        <BubbleMenu
          editor={editor}
          options={addToChatMenuOptions}
          shouldShow={shouldShowAddToChat}
        >
          <button
            type="button"
            aria-label="Add selection to chat context"
            title="Add to chat context"
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              const text = getSelectedText(editor);
              if (text.length > 0) {
                onAddToChatContext(text);
              }
            }}
            className="inline-flex size-7 items-center justify-center rounded-full border border-hairline bg-surface text-muted shadow-soft transition-colors hover:bg-hairline/60 hover:text-ink"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </BubbleMenu>
      ) : null}
    </div>
  );
}
