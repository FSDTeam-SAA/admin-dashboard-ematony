"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
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
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "formatBlock", value: "blockquote", label: "Quote", icon: Quote },
  { command: "undo", label: "Undo", icon: Undo2 },
  { command: "redo", label: "Redo", icon: Redo2 },
  { command: "removeFormat", label: "Clear formatting", icon: RemoveFormatting },
];

const blockFormats = [
  { value: "p", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "h4", label: "Heading 4" },
  { value: "h5", label: "Heading 5" },
  { value: "h6", label: "Heading 6" },
] as const;

type BlockFormat = (typeof blockFormats)[number]["value"];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
  minHeight = 180,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const [blockFormat, setBlockFormat] = useState<BlockFormat>("p");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (editor && selection?.rangeCount && editor.contains(selection.anchorNode)) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const savedSelection = savedSelectionRef.current;

    if (!selection || !savedSelection) return;
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  };

  const updateBlockFormat = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;
    const anchorElement = selection?.anchorNode instanceof Element
      ? selection.anchorNode
      : selection?.anchorNode?.parentElement;
    const block = anchorElement?.closest("p, h1, h2, h3, h4, h5, h6");

    if (editor && block && editor.contains(block)) {
      setBlockFormat(block.tagName.toLowerCase() as BlockFormat);
    } else {
      setBlockFormat("p");
    }
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
    saveSelection();
  };

  const applyBlockFormat = (format: BlockFormat) => {
    runCommand("formatBlock", format);
    setBlockFormat(format);
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  return (
    <div className={cn("overflow-hidden rounded-[12px] border border-[#dfe7ef] bg-white focus-within:border-[#7f99bc] focus-within:ring-3 focus-within:ring-[#7f99bc]/20", className)}>
      <div className="flex flex-wrap gap-1 border-b border-[#e4eaf0] bg-[#f8fbfa] p-2" role="toolbar" aria-label="Text formatting">
        <label className="relative mr-1 inline-flex h-9 items-center">
          <span className="sr-only">Typography</span>
          <select
            aria-label="Typography"
            title="Typography"
            value={blockFormat}
            onMouseDown={saveSelection}
            onChange={(event) => applyBlockFormat(event.target.value as BlockFormat)}
            className="h-9 min-w-32 appearance-none rounded-lg border border-[#dfe7ef] bg-white py-0 pr-8 pl-3 text-[14px] font-medium text-[#315b50] outline-none transition hover:border-[#b8ccc3] hover:bg-[#e3f1e9] focus:border-[#7f99bc] focus:ring-2 focus:ring-[#7f99bc]/20"
          >
            {blockFormats.map((format) => (
              <option key={format.value} value={format.value}>
                {format.value.toUpperCase()} · {format.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 h-4 w-4 text-[#315b50]" />
        </label>
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
        onKeyUp={() => { saveSelection(); updateBlockFormat(); }}
        onMouseUp={() => { saveSelection(); updateBlockFormat(); }}
        onSelect={() => { saveSelection(); updateBlockFormat(); }}
        style={{ minHeight }}
        className="rich-editor-content px-4 py-3 text-[16px] leading-7 text-[#083f32] outline-none empty:before:pointer-events-none empty:before:text-[#9badc7] empty:before:content-[attr(data-placeholder)] [&_a]:text-[#0969a8] [&_a]:underline [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8eb9a5] [&_blockquote]:pl-4 [&_h1]:my-4 [&_h1]:text-[32px] [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:my-3.5 [&_h2]:text-[28px] [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:my-3 [&_h3]:text-[24px] [&_h3]:font-semibold [&_h3]:leading-snug [&_h4]:my-3 [&_h4]:text-[21px] [&_h4]:font-semibold [&_h4]:leading-snug [&_h5]:my-2.5 [&_h5]:text-[18px] [&_h5]:font-semibold [&_h5]:leading-normal [&_h6]:my-2.5 [&_h6]:text-[16px] [&_h6]:font-semibold [&_h6]:leading-normal [&_li]:ml-6 [&_ol]:my-3 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc"
      />
    </div>
  );
}
