"use client";

import { useState, useEffect, useCallback } from "react";

export default function ComentariosPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // pending | all
  const [actionId, setActionId] = useState(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blog/comments?all=true");
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const approve = async (id, approved) => {
    setActionId(id);
    try {
      const res = await fetch("/api/blog/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, approved: approved ? 1 : 0 } : c))
        );
      }
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("¿Eliminar este comentario de forma permanente?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/blog/comments?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setActionId(null);
    }
  };

  const isApproved = (c) => c.approved === 1 || c.approved === true;

  const visible = comments.filter((c) =>
    filter === "pending" ? !isApproved(c) : true
  );

  const pendingCount = comments.filter((c) => !isApproved(c)).length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Moderación de comentarios
        </h1>
        <button
          onClick={loadComments}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Refrescar
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          Pendientes {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          Todos
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">
          {filter === "pending"
            ? "No hay comentarios pendientes. ¡Todo al día! ✅"
            : "No hay comentarios."}
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((c) => (
            <li
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                {c.user_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.user_image}
                    alt={c.user_name}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {(c.user_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {c.user_name}
                    </span>
                    {isApproved(c) ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Aprobado
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    En: <span className="font-mono">{c.post_slug}</span>
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {isApproved(c) ? (
                      <button
                        disabled={actionId === c.id}
                        onClick={() => approve(c.id, false)}
                        className="text-sm px-3 py-1.5 rounded bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
                      >
                        Ocultar
                      </button>
                    ) : (
                      <button
                        disabled={actionId === c.id}
                        onClick={() => approve(c.id, true)}
                        className="text-sm px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        Aprobar
                      </button>
                    )}
                    <button
                      disabled={actionId === c.id}
                      onClick={() => remove(c.id)}
                      className="text-sm px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
