"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import styles from "./BlogComments.module.css";

/**
 * Sección de comentarios para un artículo del blog.
 * - Lectura pública (solo comentarios aprobados).
 * - Para comentar es necesario iniciar sesión (Google vía Clerk).
 * - Los comentarios nuevos pasan por moderación antes de mostrarse.
 */
export default function BlogComments({ slug }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/blog/comments?slug=${encodeURIComponent(slug)}`
      );
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silencioso: si falla, simplemente no se muestran
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/blog/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: content.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "No se pudo enviar tu comentario." });
      } else {
        setContent("");
        setFeedback({
          type: "success",
          text:
            data.message ||
            "¡Gracias! Tu comentario aparecerá una vez sea aprobado.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Error de conexión. Inténtalo de nuevo." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      const res = await fetch(
        `/api/blog/comments?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      /* ignore */
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className={styles.commentsSection} aria-label="Comentarios">
      <h2 className={styles.commentsTitle}>
        Comentarios {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Formulario / invitación a iniciar sesión */}
      {isLoaded && isSignedIn ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formUser}>
            {user?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.imageUrl}
                alt={user?.fullName || "Tu avatar"}
                className={styles.formAvatar}
              />
            )}
            <span className={styles.formUserName}>
              {user?.fullName || "Tú"}
            </span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Escribe tu comentario..."
            value={content}
            maxLength={2000}
            rows={4}
            onChange={(e) => setContent(e.target.value)}
            disabled={submitting}
          />
          <div className={styles.formFooter}>
            <span className={styles.charCount}>{content.length}/2000</span>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting || !content.trim()}
            >
              {submitting ? "Enviando..." : "Publicar comentario"}
            </button>
          </div>
          {feedback && (
            <p
              className={
                feedback.type === "error" ? styles.feedbackError : styles.feedbackOk
              }
            >
              {feedback.text}
            </p>
          )}
        </form>
      ) : (
        <div className={styles.loginPrompt}>
          <p className={styles.loginText}>
            Inicia sesión con tu cuenta de Google para dejar un comentario.
          </p>
          <SignInButton mode="modal">
            <button className={styles.googleButton} type="button">
              <GoogleIcon />
              Iniciar sesión con Google
            </button>
          </SignInButton>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className={styles.commentList}>
        {loading ? (
          <p className={styles.empty}>Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <p className={styles.empty}>
            Aún no hay comentarios. ¡Sé el primero en comentar!
          </p>
        ) : (
          comments.map((c) => (
            <article key={c.id} className={styles.comment}>
              {c.user_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.user_image}
                  alt={c.user_name}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {(c.user_name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>{c.user_name}</span>
                  <span className={styles.commentDate}>
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className={styles.commentContent}>{c.content}</p>
                {isSignedIn && user?.id === c.user_id && (
                  <button
                    className={styles.deleteButton}
                    type="button"
                    onClick={() => handleDelete(c.id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
