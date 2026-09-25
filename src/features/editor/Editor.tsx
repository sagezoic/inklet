import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { Toolbar } from "./Toolbar";

type EditorProps = {
  initialHtml: string;
  onChange: (html: string) => void;
};

export function Editor({ initialHtml, onChange }: EditorProps) {
  const hydratedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

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
    </div>
  );
}
