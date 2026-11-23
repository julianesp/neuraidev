"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Send, Bot, User, ArrowLeft, AlertTriangle } from "lucide-react";

function fecha(sqlite) {
  if (!sqlite) return "";
  const d = new Date(`${sqlite.replace(" ", "T")}Z`);
  return d.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

function dentroDeVentana(ultimoEntrante) {
  if (!ultimoEntrante) return false;
  const d = new Date(`${ultimoEntrante.replace(" ", "T")}Z`);
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
}

const ETIQUETA_ORIGEN = { asistente: "Asistente", admin: "Tú", plantilla: "Aviso automático" };

export default function WhatsAppPanelPage() {
  const [conversaciones, setConversaciones] = useState([]);
  const [configurado, setConfigurado] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [activa, setActiva] = useState(null); // telefono
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const finRef = useRef(null);

  const cargarConversaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/whatsapp");
      const data = await res.json();
      setConversaciones(data.conversaciones || []);
      setConfigurado(data.configurado !== false);
    } catch {
      /* se reintenta en el siguiente ciclo */
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarMensajes = useCallback(async (telefono) => {
    const res = await fetch(`/api/admin/whatsapp?telefono=${encodeURIComponent(telefono)}`);
    const data = await res.json();
    setMensajes(data.mensajes || []);
  }, []);

  // Refresco cada 10 s
  useEffect(() => {
    cargarConversaciones();
    const t = setInterval(() => {
      cargarConversaciones();
      if (activa) cargarMensajes(activa);
    }, 10000);
    return () => clearInterval(t);
  }, [activa, cargarConversaciones, cargarMensajes]);

  useEffect(() => {
    if (activa) cargarMensajes(activa);
  }, [activa, cargarMensajes]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes]);

  const conv = conversaciones.find((c) => c.telefono === activa);

  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim() || !activa) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono: activa, texto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar");
      setTexto("");
      await Promise.all([cargarMensajes(activa), cargarConversaciones()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const alternarBot = async () => {
    if (!conv) return;
    await fetch("/api/admin/whatsapp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono: conv.telefono, bot_pausado: !conv.bot_pausado }),
    });
    cargarConversaciones();
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WhatsApp</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Mensajes que llegan al +57 317 4503604. El asistente contesta solo; si respondes tú, se pausa en ese chat.
      </p>

      {!configurado && (
        <div className="mt-4 flex gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3 text-sm text-blue-900 dark:text-blue-100">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          Faltan las variables WHATSAPP_TOKEN y WHATSAPP_PHONE_NUMBER_ID en Vercel: todavía no se puede enviar.
        </div>
      )}

      <div className="mt-4 grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-14rem)] min-h-[420px]">
        {/* Lista */}
        <div
          className={`${activa ? "hidden md:block" : ""} overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900`}
        >
          {cargando ? (
            <div className="flex justify-center py-10 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversaciones.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-500">Todavía no hay conversaciones.</p>
          ) : (
            conversaciones.map((c) => (
              <button
                key={c.telefono}
                type="button"
                onClick={() => setActiva(c.telefono)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${activa === c.telefono ? "bg-blue-50 dark:bg-blue-950" : ""}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">
                    {c.nombre || `+${c.telefono}`}
                  </span>
                  {c.no_leidos > 0 && (
                    <span className="rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">{c.no_leidos}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.ultimo_mensaje}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  {c.bot_pausado ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {c.bot_pausado ? "Atiendes tú" : "Asistente activo"} · {fecha(c.updated_at)}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Chat */}
        <div
          className={`${activa ? "flex" : "hidden md:flex"} flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden`}
        >
          {!conv ? (
            <div className="m-auto text-sm text-gray-500">Elige una conversación</div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setActiva(null)} className="md:hidden text-gray-500" aria-label="Volver">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{conv.nombre || `+${conv.telefono}`}</p>
                  <a href={`https://wa.me/${conv.telefono}`} className="text-xs text-gray-500">+{conv.telefono}</a>
                </div>
                <button
                  type="button"
                  onClick={alternarBot}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${conv.bot_pausado ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100"}`}
                >
                  <Bot className="w-4 h-4" />
                  {conv.bot_pausado ? "Reactivar asistente" : "Pausar asistente"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-950">
                {mensajes.map((m) => (
                  <div key={m.id} className={`flex ${m.direccion === "entrante" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${m.direccion === "entrante" ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700" : "bg-blue-600 text-white"}`}
                    >
                      {m.texto}
                      <div className={`mt-1 text-[10px] ${m.direccion === "entrante" ? "text-gray-400" : "text-blue-100"}`}>
                        {m.direccion === "saliente" && `${ETIQUETA_ORIGEN[m.origen] || ""} · `}
                        {fecha(m.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={finRef} />
              </div>

              {dentroDeVentana(conv.ultimo_entrante_at) ? (
                <form onSubmit={enviar} className="border-t border-gray-200 dark:border-gray-800 p-3">
                  {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
                  <div className="flex gap-2">
                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) enviar(e);
                      }}
                      rows={1}
                      placeholder="Escribe una respuesta…"
                      className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="submit"
                      disabled={enviando || !texto.trim()}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4"
                      aria-label="Enviar"
                    >
                      {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="border-t border-gray-200 dark:border-gray-800 p-3 text-xs text-gray-500">
                  Pasaron más de 24 horas desde el último mensaje del cliente: WhatsApp solo deja escribirle con una
                  plantilla aprobada hasta que vuelva a escribir.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
