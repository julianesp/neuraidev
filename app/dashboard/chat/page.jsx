"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Circle,
  ArrowLeft as Back,
} from "lucide-react";

const POLL_MS = 10000;

export default function DashboardChatPage() {
  const [conversaciones, setConversaciones] = useState([]);
  const [filtro, setFiltro] = useState("abierta"); // abierta | cerrada | todas
  const [activa, setActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [mensajes]);

  const cargarConversaciones = useCallback(async () => {
    try {
      const q = filtro === "todas" ? "" : `?estado=${filtro}`;
      const res = await fetch(`/api/chat-soporte/conversaciones${q}`);
      const data = await res.json();
      if (res.ok) setConversaciones(data.conversaciones || []);
    } catch {}
    setCargando(false);
  }, [filtro]);

  useEffect(() => {
    cargarConversaciones();
  }, [cargarConversaciones]);

  const cargarMensajes = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/chat-soporte/conversaciones/${id}/mensajes`);
      const data = await res.json();
      if (res.ok) {
        setMensajes(data.mensajes || []);
        setActiva(data.conversacion || null);
        fetch(`/api/chat-soporte/conversaciones/${id}/leer`, { method: "POST" }).catch(() => {});
      }
    } catch {}
  }, []);

  // Polling de la conversación activa
  useEffect(() => {
    if (activa?.id) {
      pollRef.current = setInterval(() => {
        cargarMensajes(activa.id);
        cargarConversaciones();
      }, POLL_MS);
      return () => clearInterval(pollRef.current);
    }
  }, [activa?.id, cargarMensajes, cargarConversaciones]);

  const abrir = async (conv) => {
    setActiva(conv);
    await cargarMensajes(conv.id);
    cargarConversaciones();
  };

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || enviando || !activa) return;
    setEnviando(true);
    setInput("");
    try {
      const res = await fetch(`/api/chat-soporte/conversaciones/${activa.id}/mensajes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: texto }),
      });
      const data = await res.json();
      if (res.ok) setMensajes((prev) => [...prev, data.mensaje]);
    } catch {}
    setEnviando(false);
  };

  const cambiarEstado = async (estado) => {
    if (!activa) return;
    try {
      const res = await fetch(`/api/chat-soporte/conversaciones/${activa.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) {
        setActiva((a) => ({ ...a, estado }));
        cargarConversaciones();
      }
    } catch {}
  };

  const formatFecha = (iso) => {
    try {
      return new Date(iso).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
    } catch {
      return "";
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <Back className="h-5 w-5" />
          </Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            Chat de soporte
          </h1>
        </div>
        <button
          onClick={() => {
            cargarConversaciones();
            if (activa) cargarMensajes(activa.id);
          }}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Lista de conversaciones */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="flex gap-1 border-b border-gray-200 p-2 dark:border-gray-700">
            {["abierta", "cerrada", "todas"].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium capitalize ${
                  filtro === f
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {cargando && (
              <p className="p-4 text-center text-sm text-gray-500">Cargando...</p>
            )}
            {!cargando && conversaciones.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">Sin conversaciones.</p>
            )}
            {conversaciones.map((c) => (
              <button
                key={c.id}
                onClick={() => abrir(c)}
                className={`flex w-full items-start justify-between gap-2 border-b border-gray-100 p-3 text-left dark:border-gray-800 ${
                  activa?.id === c.id
                    ? "bg-emerald-50 dark:bg-gray-800"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {c.customer_name || "Cliente"}
                  </p>
                  <p className="truncate text-xs text-gray-500">{c.asunto}</p>
                  <p className="text-[10px] text-gray-400">{formatFecha(c.ultimo_mensaje_at || c.created_at)}</p>
                </div>
                {c.no_leidos_admin > 0 && (
                  <span className="mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {c.no_leidos_admin}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Panel de conversación */}
        <div className="flex h-[75vh] flex-col rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:col-span-2">
          {!activa ? (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <MessageSquare className="mb-2 h-12 w-12 opacity-30" />
              <p className="text-sm">Selecciona una conversación</p>
            </div>
          ) : (
            <>
              {/* Header conversación */}
              <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiva(null)}
                    className="text-gray-400 hover:text-gray-700 md:hidden"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {activa.customer_name || "Cliente"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activa.customer_email} · {activa.asunto}
                    </p>
                  </div>
                </div>
                {activa.estado === "cerrada" ? (
                  <button
                    onClick={() => cambiarEstado("abierta")}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
                  >
                    <Circle className="h-3 w-3" /> Reabrir
                  </button>
                ) : (
                  <button
                    onClick={() => cambiarEstado("cerrada")}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle className="h-3 w-3" /> Cerrar
                  </button>
                )}
              </div>

              {/* Mensajes */}
              <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-800">
                {mensajes.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.remitente === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                        m.remitente === "admin"
                          ? "rounded-br-sm bg-emerald-600 text-white"
                          : m.remitente === "sistema"
                            ? "rounded-bl-sm bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
                            : "rounded-bl-sm bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                      <p className="mt-1 text-right text-[10px] opacity-60">{formatFecha(m.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {activa.estado === "cerrada" ? (
                <p className="border-t border-gray-200 p-3 text-center text-xs text-gray-500 dark:border-gray-700">
                  Conversación cerrada. Reábrela para responder.
                </p>
              ) : (
                <div className="flex items-end gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        enviar();
                      }
                    }}
                    rows={1}
                    placeholder="Escribe tu respuesta..."
                    className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    onClick={enviar}
                    disabled={enviando || !input.trim()}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
