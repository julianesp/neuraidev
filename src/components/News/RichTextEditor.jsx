"use client";

import { useState, useRef } from "react";
import styles from "./RichTextEditor.module.scss";

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Ejecutar comando de formato
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Manejar cambios en el contenido
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Manejar pegado (limpiar formato)
  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Insertar enlace
  const insertLink = () => {
    const url = prompt("Ingresa la URL del enlace:");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  // Cambiar color de texto
  const changeTextColor = (e) => {
    executeCommand("foreColor", e.target.value);
  };

  // Cambiar color de fondo
  const changeBackgroundColor = (e) => {
    executeCommand("backColor", e.target.value);
  };

  // Cambiar tamaño de fuente
  const changeFontSize = (e) => {
    executeCommand("fontSize", e.target.value);
  };

  // Cambiar tipo de fuente
  const changeFontFamily = (e) => {
    executeCommand("fontName", e.target.value);
  };

  return (
    <div className={styles.richTextEditor}>
      {/* Barra de herramientas */}
      <div className={styles.toolbar}>
        {/* Grupo: Deshacer/Rehacer */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => executeCommand("undo")}
            title="Deshacer"
            className={styles.toolBtn}
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => executeCommand("redo")}
            title="Rehacer"
            className={styles.toolBtn}
          >
            ↷
          </button>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Formato de texto */}
        <div className={styles.toolbarGroup}>
          <select
            onChange={changeFontFamily}
            className={styles.fontSelect}
            title="Tipo de fuente"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
          </select>

          <select
            onChange={changeFontSize}
            className={styles.fontSelect}
            defaultValue="3"
            title="Tamaño de fuente"
          >
            <option value="1">Muy pequeño</option>
            <option value="2">Pequeño</option>
            <option value="3">Normal</option>
            <option value="4">Mediano</option>
            <option value="5">Grande</option>
            <option value="6">Muy grande</option>
            <option value="7">Extra grande</option>
          </select>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Estilos de texto */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => executeCommand("bold")}
            title="Negrita"
            className={styles.toolBtn}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => executeCommand("italic")}
            title="Cursiva"
            className={styles.toolBtn}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => executeCommand("underline")}
            title="Subrayado"
            className={styles.toolBtn}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => executeCommand("strikeThrough")}
            title="Tachado"
            className={styles.toolBtn}
          >
            <s>S</s>
          </button>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Colores */}
        <div className={styles.toolbarGroup}>
          <div className={styles.colorPicker}>
            <label htmlFor="textColor" title="Color de texto">
              A
            </label>
            <input
              type="color"
              id="textColor"
              onChange={changeTextColor}
              defaultValue="#000000"
            />
          </div>
          <div className={styles.colorPicker}>
            <label htmlFor="bgColor" title="Color de fondo">
              🎨
            </label>
            <input
              type="color"
              id="bgColor"
              onChange={changeBackgroundColor}
              defaultValue="#ffff00"
            />
          </div>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Alineación */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => executeCommand("justifyLeft")}
            title="Alinear a la izquierda"
            className={styles.toolBtn}
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyCenter")}
            title="Centrar"
            className={styles.toolBtn}
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyRight")}
            title="Alinear a la derecha"
            className={styles.toolBtn}
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => executeCommand("justifyFull")}
            title="Justificar"
            className={styles.toolBtn}
          >
            ≡
          </button>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Listas */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => executeCommand("insertUnorderedList")}
            title="Lista con viñetas"
            className={styles.toolBtn}
          >
            • Lista
          </button>
          <button
            type="button"
            onClick={() => executeCommand("insertOrderedList")}
            title="Lista numerada"
            className={styles.toolBtn}
          >
            1. Lista
          </button>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Formato especial */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "h2")}
            title="Título 2"
            className={styles.toolBtn}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "h3")}
            title="Título 3"
            className={styles.toolBtn}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => executeCommand("formatBlock", "p")}
            title="Párrafo normal"
            className={styles.toolBtn}
          >
            P
          </button>
        </div>

        <div className={styles.separator}></div>

        {/* Grupo: Otros */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={insertLink}
            title="Insertar enlace"
            className={styles.toolBtn}
          >
            🔗
          </button>
          <button
            type="button"
            onClick={() => executeCommand("removeFormat")}
            title="Limpiar formato"
            className={styles.toolBtn}
          >
            🧹
          </button>
        </div>
      </div>

      {/* Área de edición */}
      <div
        ref={editorRef}
        className={`${styles.editor} ${isFocused ? styles.focused : ""}`}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value || "" }}
        data-placeholder={placeholder}
      />

      {/* Contador de caracteres */}
      <div className={styles.editorFooter}>
        <span>
          {editorRef.current?.innerText?.length || 0} caracteres
        </span>
      </div>
    </div>
  );
}
