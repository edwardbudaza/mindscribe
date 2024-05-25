"use client";

import { useTheme } from "next-themes";
import { PartialBlock, BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useEdgeStore } from "@/lib/edgestore";
import { useCallback, useRef } from "react";
import debounce from "lodash/debounce";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const editorRef = useRef<BlockNoteEditor | null>(null);

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({
      file,
    });
    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  editorRef.current = editor;

  const debouncedHandleEditorChange = useCallback(
    debounce(() => {
      if (editorRef.current) {
        onChange(JSON.stringify(editorRef.current.document, null, 2));
      }
    }, 1000),
    [onChange]
  );

  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      editable={editable}
      onSelectionChange={debouncedHandleEditorChange}
    />
  );
};

export default Editor;
