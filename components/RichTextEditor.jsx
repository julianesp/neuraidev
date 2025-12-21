"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

export default function RichTextEditor({ value, onChange, label }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: "Escribe la descripción del producto aquí...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value || "",
    immediatelyRender: false, // Necesario para evitar errores de hidratación en SSR
    editable: true, // Asegurar que sea editable
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-3 py-2",
        contenteditable: "true", // Asegurar que sea editable
        role: "textbox",
        "aria-multiline": "true",
      },
    },
  });

  // Sincronizar el contenido cuando cambie el valor externo
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
        isActive ? "bg-gray-300 dark:bg-gray-700" : ""
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 px-3 pt-3">
          {label}
        </label>
      )}

      {/* Barra de herramientas */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        {/* Formato de texto */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Negrita (Ctrl+B)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 4v12h4.5c2.5 0 4.5-1.5 4.5-4s-2-4-4.5-4H6zm3 5h1.5c1 0 1.5.5 1.5 1.5S11.5 12 10.5 12H9V9zm0-3h1c.8 0 1.5.5 1.5 1.5S10.8 9 10 9H9V6z" />
          </svg>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Cursiva (Ctrl+I)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4h6v2h-2l-2 8h2v2H7v-2h2l2-8H9V4z" />
          </svg>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Subrayado (Ctrl+U)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3v8c0 2.8 2.2 5 5 5s5-2.2 5-5V3h-2v8c0 1.7-1.3 3-3 3s-3-1.3-3-3V3H5zm-2 15h14v2H3v-2z" />
          </svg>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Tachado"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 8c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2h2c0-.6.4-1 1-1h2c.6 0 1 .4 1 1s-.4 1-1 1H9v2h2c.6 0 1 .4 1 1s-.4 1-1 1H9c-.6 0-1-.4-1-1H6c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2 0-.4-.1-.7-.3-1 .2-.3.3-.6.3-1zM3 9h14v2H3V9z" />
          </svg>
        </MenuButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Listas */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Lista con viñetas"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 6h2v2H3V6zm4 1h10v1H7V7zM3 10h2v2H3v-2zm4 1h10v1H7v-1zm-4 3h2v2H3v-2zm4 1h10v1H7v-1z" />
          </svg>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4h1v4H3V4zm1 6H3v1h1v1H3v1h2V9H4v1zm-1 4h2v3H3v-1h1v-1H3v-1zm4-7h10v1H7V7zm0 4h10v1H7v-1zm0 4h10v1H7v-1z" />
          </svg>
        </MenuButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Títulos */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Título 2"
        >
          <span className="font-bold">H2</span>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Título 3"
        >
          <span className="font-bold">H3</span>
        </MenuButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Colores de texto - Selectores de color */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Color:</span>
          {["#000000", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => editor.chain().focus().setColor(color).run()}
              className={`w-6 h-6 rounded border-2 transition-all ${
                editor.isActive("textStyle", { color })
                  ? "border-gray-900 dark:border-white scale-110"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color }}
              title={`Color ${color}`}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Deshacer/Rehacer */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Deshacer (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 4v3H4a6 6 0 106 6H8a4 4 0 11-4-4h4V6l4 3-4 3z" />
          </svg>
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Rehacer (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12 4v3h4a6 6 0 11-6 6h2a4 4 0 104-4h-4V6l-4 3 4 3z" />
          </svg>
        </MenuButton>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Limpiar formato */}
        <MenuButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Limpiar formato"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15.41 7.41L14 6l-6 6-6-6-1.41 1.41L6 13l-5.59 5.59L1.83 20l5.59-5.59L13 20l1.41-1.41L8.83 13l6.58-5.59z" />
          </svg>
        </MenuButton>
      </div>

      {/* Editor de contenido */}
      <div
        className="bg-white dark:bg-gray-700 min-h-[200px] cursor-text"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Contador de caracteres */}
      <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-t border-gray-300 dark:border-gray-600">
        {editor.storage.characterCount?.characters() || 0} caracteres
      </div>
    </div>
  );
}
