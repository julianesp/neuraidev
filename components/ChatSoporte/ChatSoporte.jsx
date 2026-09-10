"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageCircle, X, Send, ArrowLeft, Headset } from "lucide-react";

/**
 * Chat interno de soporte (lado usuario/comprador).
 *
 * Burbuja flotante separada del asistente IA (AIChat). Permite:
 *  - Ver las conversaciones propias (si el usuario está logueado).
 *  - Abrir una conversación y chatear con el vendedor (polling cada 10s).
 *  - Iniciar una conversación nueva. Los invitados dan nombre + email.
 *
 * Guarda el email del invitado en localStorage para recuperar sus hilos.
 */
const POLL_MS = 10000;
const GUEST_KEY = "chat_soporte_guest";

export default function ChatSoporte() {
  const { isSignedIn, user } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [vista, setVista] = useState("lista"); // lista | conversacion | nueva
  const [conversaciones, setConversaciones] = useState([]);
  const [activa, setActiva] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Datos de invitado (persistidos)
  const [guest, setGuest] = useState({ nombre: "", email: "" });

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Cargar datos de invitado guardados
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GUEST_KEY);
      if (raw) setGuest(JSON.parse(raw));
    } catch {}
  }, []);

  const email =
    (isSignedIn && user?.primaryEmailAddress?.emailAddress) || guest.email || "";

  const emailParam = !isSignedIn && guest.email ? `?email=${encodeURIComponent(guest.email)}` : "";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Total de no leídos para el usuario (badge en la burbuja)
  const totalNoLeidos = conversaciones.reduce(
    (acc, c) => acc + (c.no_leidos_usuario || 0),
    0
  );

  const cargarConversaciones = useCallback(async () => {
    if (!isSignedIn && !guest.email) {
      setConversaciones([]);
      return;
    }
    try {
      const url = isSignedIn
        ? "/api/chat-soporte/conversaciones"
        : `/api/chat-soporte/conversaciones?email=${encodeURIComponent(guest.email)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setConversaciones(data.conversaciones || []);
    } catch {}
  }, [isSignedIn, guest.email]);

  // Cargar lista al abrir
  useEffect(() => {
    if (isOpen && vista === "lista") cargarConversaciones();
  }, [isOpen, vista, cargarConversaciones]);

  const cargarMensajes = useCallback(
    async (conversacionId) => {
      try {
        const res = await fetch(
          `/api/chat-soporte/conversaciones/${conversacionId}/mensajes${emailParam}`
        );
        const data = await res.json();
        if (res.ok) {
          setMensajes(data.mensajes || []);
          setActiva(data.conversacion || null);
          // marcar leído
          fetch(`/api/chat-soporte/conversaciones/${conversacionId}/leer${emailParam}`, {
            method: "POST",
          }).catch(() => {});
        }
      } catch {}
    },
    [emailParam]
  );

  // Polling mientras hay una conversación abierta
  useEffect(() => {
    if (isOpen && vista === "conversacion" && activa?.id) {
      pollRef.current = setInterval(() => cargarMensajes(activa.id), POLL_MS);
      return () => clearInterval(pollRef.current);
    }
  }, [isOpen, vista, activa?.id, cargarMensajes]);

  const abrirConversacion = async (conv) => {
    setActiva(conv);
    setVista("conversacion");
    await cargarMensajes(conv.id);
  };

  const enviarMensaje = async () => {
    const texto = input.trim();
    if (!texto || enviando || !activa) return;
    setEnviando(true);
    setInput("");
    try {
      const res = await fetch(
        `/api/chat-soporte/conversaciones/${activa.id}/mensajes${emailParam}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contenido: texto }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMensajes((prev) => [...prev, data.mensaje]);
      } else {
        setError(data.error || "No se pudo enviar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  const crearConversacion = async (e) => {
    e.preventDefault();
    setError("");
    const texto = input.trim();
    if (!texto || enviando) return;

    if (!isSignedIn && (!guest.nombre.trim() || !guest.email.trim())) {
      setError("Escribe tu nombre y correo para poder responderte");
      return;
    }

    setEnviando(true);
    try {
      const payload = { mensaje: texto };
      if (!isSignedIn) {
        payload.nombre = guest.nombre.trim();
        payload.email = guest.email.trim();
        try {
          localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
        } catch {}
      }
      const res = await fetch("/api/chat-soporte/conversaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setInput("");
        await abrirConversacion(data.conversacion);
      } else {
        setError(data.error || "No se pudo crear la conversación");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

  const formatHora = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <>
      {/* Burbuja flotante (esquina inferior izquierda para no chocar con AIChat) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat de soporte"
          className="fixed bottom-5 left-5 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-700"
        >
          <Headset className="h-6 w-6" />
          {totalNoLeidos > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold">
              {totalNoLeidos}
            </span>
          )}
        </button>
      )}

      {/* Panel del chat */}
      {isOpen && (
        <div className="fixed bottom-5 left-5 z-[9999] flex h-[600px] max-h-[calc(100vh-40px)] w-[380px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              {vista !== "lista" && (
                <button
                  onClick={() => {
                    setVista("lista");
                    setActiva(null);
                    setError("");
                  }}
                  aria-label="Volver"
                  className="rounded-full p-1 hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <p className="text-sm font-bold leading-tight">Soporte Neurai.dev</p>
                <p className="text-xs text-white/80">Te responde una persona</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar chat"
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 dark:bg-gray-800">
            {vista === "lista" && (
              <div className="space-y-2">
                {conversaciones.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center px-4 pt-16 text-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="mb-2 h-10 w-10 opacity-40" />
                    <p className="text-sm">
                      ¿Tienes alguna pregunta? Escríbenos y te ayudamos.
                    </p>
                  </div>
                )}
                {conversaciones.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => abrirConversacion(c)}
                    className="flex w-full items-center justify-between rounded-lg bg-white p-3 text-left shadow-sm transition hover:bg-emerald-50 dark:bg-gray-900 dark:hover:bg-gray-700"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {c.asunto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.estado === "cerrada" ? "Cerrada" : "Abierta"}
                      </p>
                    </div>
                    {c.no_leidos_usuario > 0 && (
                      <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {c.no_leidos_usuario}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {vista === "conversacion" && (
              <div className="space-y-3">
                {mensajes.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.remitente === "usuario" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        m.remitente === "usuario"
                          ? "rounded-br-sm bg-emerald-600 text-white"
                          : m.remitente === "sistema"
                            ? "rounded-bl-sm bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
                            : "rounded-bl-sm bg-white text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.contenido}</p>
                      <p className="mt-1 text-right text-[10px] opacity-60">
                        {formatHora(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Barra inferior según la vista */}
          {error && (
            <p className="bg-red-50 px-3 py-1 text-center text-xs text-red-600">{error}</p>
          )}

          {vista === "lista" && (
            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              <button
                onClick={() => {
                  setVista("nueva");
                  setInput("");
                  setError("");
                }}
                className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Nueva conversación
              </button>
            </div>
          )}

          {vista === "nueva" && (
            <form onSubmit={crearConversacion} className="border-t border-gray-200 p-3 dark:border-gray-700">
              {!isSignedIn && (
                <div className="mb-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={guest.nombre}
                    onChange={(e) => setGuest((g) => ({ ...g, nombre: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                  <input
                    type="email"
                    placeholder="Tu correo"
                    value={guest.email}
                    onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
              <textarea
                placeholder="Escribe tu pregunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={enviando || !input.trim()}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Enviar
              </button>
            </form>
          )}

          {vista === "conversacion" && activa?.estado !== "cerrada" && (
            <div className="flex items-end gap-2 border-t border-gray-200 p-3 dark:border-gray-700">
              <textarea
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviarMensaje();
                  }
                }}
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={enviarMensaje}
                disabled={enviando || !input.trim()}
                aria-label="Enviar mensaje"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          )}

          {vista === "conversacion" && activa?.estado === "cerrada" && (
            <p className="border-t border-gray-200 p-3 text-center text-xs text-gray-500 dark:border-gray-700">
              Esta conversación fue cerrada. Inicia una nueva si necesitas más ayuda.
            </p>
          )}
        </div>
      )}
    </>
  );
}
