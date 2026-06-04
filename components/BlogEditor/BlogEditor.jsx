"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Palette,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

const MenuBar = ({ editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const openLinkDialog = () => {
    const existing = editor.getAttributes("link").href || "";
    setLinkUrl(existing);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = url.startsWith("http") ? url : `https://${url}`;
      editor.chain().focus().setLink({ href, target: "_blank" }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
    <div className="p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Negrita"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Cursiva"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("underline") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Subrayado"
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("strike") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("code") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Código"
      >
        <Code size={18} />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("heading", { level: 3 })
            ? "bg-gray-300 dark:bg-gray-600"
            : ""
        }`}
        title="Título 3"
      >
        <Heading3 size={18} />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("bulletList") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Lista con viñetas"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("orderedList") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Lista numerada"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("blockquote") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Cita"
      >
        <Quote size={18} />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Deshacer"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        title="Rehacer"
      >
        <Redo size={18} />
      </button>

      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />

      <button
        onClick={openLinkDialog}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          editor.isActive("link") ? "bg-gray-300 dark:bg-gray-600" : ""
        }`}
        title="Insertar / editar enlace"
      >
        <LinkIcon size={18} />
      </button>
      {editor.isActive("link") && (
        <button
          onClick={removeLink}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-red-500"
          title="Quitar enlace"
        >
          <Unlink size={18} />
        </button>
      )}
    </div>

    {showLinkInput && (
      <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <input
          autoFocus
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyLink();
            if (e.key === "Escape") setShowLinkInput(false);
          }}
          placeholder="https://ejemplo.com"
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={applyLink}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
        >
          Aplicar
        </button>
        <button
          onClick={() => setShowLinkInput(false)}
          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancelar
        </button>
      </div>
    )}
    </div>
  );
};

export default function BlogEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: placeholder || "Escribe el contenido de tu artículo...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
