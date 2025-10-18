"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./not-found.module.scss";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [terminalLines, setTerminalLines] = useState([]);

  useEffect(() => {
    setMounted(true);

    // const lines = [
    //   { text: "$ cd /page-you-are-looking-for", delay: 0 },
    //   { text: "bash: cd: /page-you-are-looking-for: No such file or directory", delay: 800 },
    //   { text: "$ ls -la", delay: 1600 },
    //   { text: "total 0", delay: 2200 },
    //   { text: "drwxr-xr-x 2 user user 4096 Error 404", delay: 2600 },
    //   { text: "$ echo 'Houston, we have a problem...'", delay: 3400 },
    //   { text: "Houston, we have a problem...", delay: 4000 },
    // ];

    // lines.forEach((line, index) => {
    //   setTimeout(() => {
    //     setTerminalLines((prev) => [...prev, line.text]);
    //   }, line.delay);
    // });
  }, []);

  // const errorMessages = [
  //   "// ERROR: Page not found in production build",
  //   "// TODO: Redirect user to homepage",
  //   "// FIXME: 404 - Resource not available",
  // ];

  if (!mounted) return null;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Código de error animado */}
        <div className={styles.codeBlock}>
          {/* <div className={styles.codeHeader}>
            <div className={styles.dots}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
            <span className={styles.filename}>error.js</span>
          </div> */}
          {/* <div className={styles.codeContent}>
            <pre>
              <code>
                {errorMessages.map((msg, i) => (
                  <div key={i} className={styles.codeLine}>
                    <span className={styles.lineNumber}>{i + 1}</span>
                    <span className={styles.comment}>{msg}</span>
                  </div>
                ))}
                <div className={styles.codeLine}>
                  <span className={styles.lineNumber}>4</span>
                  <span className={styles.keyword}>throw</span>{" "}
                  <span className={styles.keyword}>new</span>{" "}
                  <span className={styles.className}>Error</span>
                  <span className={styles.punctuation}>(</span>
                  <span className={styles.string}>&apos;404&apos;</span>
                  <span className={styles.punctuation}>);</span>
                </div>
              </code>
            </pre>
          </div> */}
        </div>

        {/* Título principal */}
        <div className={styles.mainError}>
          <h1 className={styles.errorCode}>
            <span className={styles.bracket}>{"{"}</span>
            404
            <span className={styles.bracket}>{"}"}</span>
          </h1>
          <h2 className={styles.errorTitle}>Página No Encontrada</h2>
          <p className={styles.errorDescription}>
            Lo siento, la página que buscas no existe en este servidor.
            
          </p>
        </div>

        {/* Botones de navegación */}
        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <span className={styles.btnIcon}>🏠</span>
            Volver al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className={styles.secondaryBtn}
          >
            <span className={styles.btnIcon}>⬅️</span>
            Página Anterior
          </button>
        </div>

        {/* Sugerencias útiles */}
        {/* <div className={styles.suggestions}>
          <h3>¿Qué puedes hacer?</h3>
          <ul>
            <li>Verifica que la URL esté escrita correctamente</li>
            <li>Regresa a la página anterior y vuelve a intentarlo</li>
            <li>Visita nuestra <Link href="/">página principal</Link></li>
            <li>Explora nuestros <Link href="/accesorios">accesorios</Link></li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
