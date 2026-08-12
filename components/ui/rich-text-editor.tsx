"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

const tools = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "formatBlock", value: "h2", label: "Heading", icon: Heading2 },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote },
  { command: "undo", label: "Undo", icon: Undo2 },
  { command: "redo", label: "Redo", icon: Redo2 },
  { command: "removeFormat", label: "Clear formatting", icon: RemoveFormatting },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
  minHeight = 180,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  return (
    <div className={cn("overflow-hidden rounded-[12px] border border-[#dfe7ef] bg-white focus-within:border-[#7f99bc] focus-within:ring-3 focus-within:ring-[#7f99bc]/20", className)}>
      <div className="flex flex-wrap gap-1 border-b border-[#e4eaf0] bg-[#f8fbfa] p-2" role="toolbar" aria-label="Text formatting">
        {tools.map(({ command, value: toolValue, label, icon: Icon }) => (
          <button
            key={`${command}-${toolValue ?? ""}`}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand(command, toolValue);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#315b50] transition hover:bg-[#e3f1e9] hover:text-[#064b39]"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Add link"
          aria-label="Add link"
          onMouseDown={(event) => { event.preventDefault(); addLink(); }}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#315b50] transition hover:bg-[#e3f1e9] hover:text-[#064b39]"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        style={{ minHeight }}
        className="rich-editor-content px-4 py-3 text-[16px] leading-7 text-[#083f32] outline-none empty:before:pointer-events-none empty:before:text-[#9badc7] empty:before:content-[attr(data-placeholder)] [&_a]:text-[#0969a8] [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8eb9a5] [&_blockquote]:pl-4 [&_h2]:my-3 [&_h2]:text-[24px] [&_h2]:font-semibold [&_li]:ml-6 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc"
      />
    </div>
  );
}
