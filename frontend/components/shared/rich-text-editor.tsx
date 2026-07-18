"use client"

import * as React from "react"
import { Extension } from "@tiptap/core"
import Color from "@tiptap/extension-color"
import FontFamily from "@tiptap/extension-font-family"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Table } from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  EraserIcon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  TableIcon,
  Underline as UnderlineIcon,
  Undo2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
})

const BackgroundColor = Extension.create({
  name: "backgroundColor",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {}
              return { style: `background-color: ${attributes.backgroundColor}` }
            },
          },
        },
      },
    ]
  },
})

const fontOptions = [
  { value: "default", label: "Default" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Courier New, monospace", label: "Mono" },
]

const sizeOptions = [
  { value: "default", label: "Size" },
  { value: "0.75em", label: "Small" },
  { value: "1em", label: "Normal" },
  { value: "1.5em", label: "Large" },
  { value: "2.5em", label: "Huge" },
]

function ToolbarButton({
  editor,
  label,
  active,
  onClick,
  children,
}: {
  editor: Editor | null
  label: string
  active?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={!editor}
      onClick={onClick}
      className="shrink-0"
    >
      {children}
    </Button>
  )
}

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  minHeight?: string
  maxHeight?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  disabled,
  id,
  minHeight = "160px",
  maxHeight = "420px",
  className,
}: RichTextEditorProps) {
  const lastValueRef = React.useRef(value)

  const extensions = React.useMemo(
    () => [
      StarterKit.configure({ link: false, underline: false }),
      TextStyle,
      FontSize,
      BackgroundColor,
      Color.configure({ types: ["textStyle"] }),
      FontFamily.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto", "tel"],
      }),
      Image.configure({ allowBase64: true, inline: false }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    [placeholder]
  )

  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: id ?? "",
        class: "prose prose-sm max-w-none px-3 py-2 focus:outline-none dark:prose-invert",
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      lastValueRef.current = html
      onChange(html)
    },
  })

  React.useEffect(() => {
    if (!editor) return
    if (value !== lastValueRef.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
      lastValueRef.current = value
    }
  }, [editor, value])

  React.useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  const insertImage = React.useCallback(() => {
    if (!editor) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      editor.chain().focus().setImage({ src: url }).run()
    }
    input.click()
  }, [editor])

  const setLink = React.useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Enter link URL:", previousUrl || "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const setFont = React.useCallback(
    (fontFamily: string) => {
      if (!editor) return
      if (fontFamily === "default") {
        editor.chain().focus().unsetFontFamily().run()
        return
      }
      editor.chain().focus().setFontFamily(fontFamily).run()
    },
    [editor]
  )

  const setFontSize = React.useCallback(
    (fontSize: string) => {
      if (!editor) return
      if (fontSize === "default") {
        editor.chain().focus().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run()
        return
      }
      editor.chain().focus().setMark("textStyle", { fontSize }).run()
    },
    [editor]
  )

  const setBackgroundColor = React.useCallback(
    (backgroundColor: string) => {
      editor?.chain().focus().setMark("textStyle", { backgroundColor }).run()
    },
    [editor]
  )

  const setHeading = React.useCallback(
    (level: string) => {
      if (!editor) return
      if (level === "paragraph") {
        editor.chain().focus().setParagraph().run()
        return
      }
      editor.chain().focus().toggleHeading({ level: Number(level) as 1 | 2 | 3 }).run()
    },
    [editor]
  )

  return (
    <div
      id={id}
      className={cn(
        "rounded-lg border border-input bg-background focus-within:border-ring",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/40 p-2">
        <Select onValueChange={setHeading} disabled={!editor}>
          <SelectTrigger size="sm" className="w-28 bg-background">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="1">Heading 1</SelectItem>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setFont} disabled={!editor}>
          <SelectTrigger size="sm" className="w-27 bg-background">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setFontSize} disabled={!editor}>
          <SelectTrigger size="sm" className="w-22 bg-background">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {sizeOptions.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mx-1 h-7 w-px bg-border" />

        <ToolbarButton editor={editor} label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Underline" active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Strikethrough" active={editor?.isActive("strike")} onClick={() => editor?.chain().focus().toggleStrike().run()}>
          <StrikethroughIcon />
        </ToolbarButton>

        <label className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-muted">
          <span>Text</span>
          <input
            type="color"
            aria-label="Text color"
            className="size-5 cursor-pointer rounded border border-border bg-transparent"
            onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
            disabled={!editor}
          />
        </label>
        <label className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium hover:bg-muted">
          <span>Fill</span>
          <input
            type="color"
            aria-label="Background color"
            className="size-5 cursor-pointer rounded border border-border bg-transparent"
            onChange={(e) => setBackgroundColor(e.target.value)}
            disabled={!editor}
          />
        </label>

        <div className="mx-1 h-7 w-px bg-border" />

        {[
          { label: "Align left", value: "left", icon: AlignLeftIcon },
          { label: "Align center", value: "center", icon: AlignCenterIcon },
          { label: "Align right", value: "right", icon: AlignRightIcon },
          { label: "Justify", value: "justify", icon: AlignJustifyIcon },
        ].map(({ label, value: align, icon: Icon }) => (
          <ToolbarButton
            key={align}
            editor={editor}
            label={label}
            active={editor?.isActive({ textAlign: align })}
            onClick={() => editor?.chain().focus().setTextAlign(align).run()}
          >
            <Icon />
          </ToolbarButton>
        ))}

        <div className="mx-1 h-7 w-px bg-border" />

        <ToolbarButton editor={editor} label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          <ListIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Ordered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          <ListOrderedIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Blockquote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
          <QuoteIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Code block" active={editor?.isActive("codeBlock")} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
          <CodeIcon />
        </ToolbarButton>

        <div className="mx-1 h-7 w-px bg-border" />

        <ToolbarButton editor={editor} label="Link" active={editor?.isActive("link")} onClick={setLink}>
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Image" onClick={insertImage}>
          <ImageIcon />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          label="Insert table"
          onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon />
        </ToolbarButton>
        <ToolbarButton
          editor={editor}
          label="Clear formatting"
          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <EraserIcon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Undo" onClick={() => editor?.chain().focus().undo().run()}>
          <Undo2Icon />
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Redo" onClick={() => editor?.chain().focus().redo().run()}>
          <Redo2Icon />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={cn("overflow-y-auto", !editor && "min-h-[160px]")}
        style={{ maxHeight }}
      />
    </div>
  )
}
