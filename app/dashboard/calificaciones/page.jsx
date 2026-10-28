"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Mail, UserPlus, Clock, CheckCircle2 } from "lucide-react";
import EnlaceCalificar from "@/app/_components/calificar/EnlaceCalificar";

const NOMBRE_TIPO = {
  producto: "Compra",
  formateo: "Servicio técnico",
  web: "Desarrollo web",
};

export default function CalificacionesPage() {
  // Pestaña activa: enlace (compartir por WhatsApp) | invitaciones (emails) | calificaciones (moderación)
  const [tab, setTab] = useState("enlace");

  // ── Invitaciones (emails cargados) ──
  const [invitaciones, setInvitaciones] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);
  const [emailsInput, setEmailsInput] = useState("");
  const [nombreInput, setNombreInput] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  // ── Calificaciones (testimonios tipo formateo) ──
  const [testimonios, setTestimonios] = useState([]);
  const [loadingTest, setLoadingTest] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [avisoModeracion, setAvisoModeracion] = useState("");

  const cargarInvitaciones = useCallback(async () => {
    try {
      setLoadingInv(true);
      const res = await fetch("/api/formateo/invitaciones");
      const data = await res.json();
      setInvitaciones(data.invitaciones || []);
    } catch {
      setInvitaciones([]);
    } finally {
      setLoadingInv(false);
    }
  }, []);

  const cargarTestimonios = useCallback(async () => {
    try {
      setLoadingTest(true);
      const res = await fetch("/api/testimonios?estado=todos");
      const data = await res.json();
      // Todas: compras, servicio técnico y desarrollo web.
      setTestimonios(data.testimonios || []);
    } catch {
      setTestimonios([]);
    } finally {
      setLoadingTest(false);
    }
  }, []);

  useEffect(() => {
    cargarInvitaciones();
    cargarTestimonios();
  }, [cargarInvitaciones, cargarTestimonios]);

  // ── Cargar emails ──
  const agregarEmails = async (e) => {
    e.preventDefault();
    setAviso("");
    if (!emailsInput.trim()) {
      setAviso("Escribe al menos un email.");
      return;
    }
    setGuardando(true);
    try {
      // Si escribió un solo email y un nombre, se mandan juntos; si pegó varios,
      // el backend los separa por coma/salto de línea.
      const soloUno =
        !emailsInput.includes(",") &&
        !emailsInput.includes(";") &&
        !emailsInput.includes("\n");

      const body = soloUno
        ? { email: emailsInput.trim(), nombre_cliente: nombreInput.trim() || null }
        : { emails: emailsInput };

      const res = await fetch("/api/formateo/invitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");

      const partes = [];
      if (data.agregados) partes.push(`${data.agregados} agregado(s)`);
      if (data.duplicados) partes.push(`${data.duplicados} ya existían`);
      if (data.invalidos) partes.push(`${data.invalidos} inválido(s)`);
      setAviso(partes.join(" · ") || "Listo.");

      setEmailsInput("");
      setNombreInput("");
      cargarInvitaciones();
    } catch (err) {
      setAviso(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarInvitacion = async (id) => {
    if (!window.confirm("¿Quitar este email de la lista?")) return;
    setActionId(id);
    try {
      const res = await fetch(
        `/api/formateo/invitaciones?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setInvitaciones((prev) => prev.filter((i) => i.id !== id));
      }
    } finally {
      setActionId(null);
    }
  };

  // ── Moderación de calificaciones ──
  const moderar = async (id, estado) => {
    setActionId(id);
    try {
      const res = await fetch("/api/testimonios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setTestimonios((prev) =>
          prev.map((t) => (t.id === id ? { ...t, estado } : t))
        );
        const nombre = testimonios.find((t) => t.id === id)?.cliente_nombre || "El cliente";
        if (data.descuento === "activado") {
          setAvisoModeracion(`✅ Publicada. ${nombre} ya tiene su 15% de descuento para una compra en la tienda.`);
        } else if (data.descuento === "ya_tenia") {
          setAvisoModeracion(`Publicada. ${nombre} ya había recibido su 15% antes (es uno por cliente).`);
        } else if (data.descuento === "error") {
          setAvisoModeracion("Publicada, pero no se pudo activar el 15%. Intenta ocultarla y publicarla de nuevo.");
        } else {
          setAvisoModeracion("");
        }
      }
    } finally {
      setActionId(null);
    }
  };

  // Quita la foto o el Facebook de una calificación (accion: quitar_foto | quitar_facebook)
  const quitarDato = async (id, accion) => {
    setActionId(id);
    try {
      const res = await fetch("/api/testimonios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [accion]: true }),
      });
      if (res.ok) {
        const campo = accion === "quitar_foto" ? "avatar_url" : "facebook_url";
        setTestimonios((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [campo]: null } : t))
        );
      }
    } finally {
      setActionId(null);
    }
  };

  const eliminarTestimonio = async (id) => {
    if (!window.confirm("¿Eliminar esta calificación de forma permanente?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/testimonios?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestimonios((prev) => prev.filter((t) => t.id !== id));
      }
    } finally {
      setActionId(null);
    }
  };

  const pendientes = testimonios.filter((t) => t.estado === "pendiente").length;
  const calificados = invitaciones.filter((i) => i.estado === "calificado").length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Calificaciones de clientes
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Envía a tus clientes un enlace para que te califiquen con estrellas y
        un comentario. Te llega un aviso a Telegram y tú decides qué se publica.
      </p>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setTab("enlace")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
            tab === "enlace"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Enviar enlace
        </button>
        <button
          onClick={() => setTab("invitaciones")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "invitaciones"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Emails de clientes ({invitaciones.length})
        </button>
        <button
          onClick={() => setTab("calificaciones")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "calificaciones"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Calificaciones recibidas{" "}
          {pendientes > 0 && (
            <span className="ml-1 inline-flex items-center justify-center text-[11px] bg-red-500 text-white rounded-full px-1.5">
              {pendientes}
            </span>
          )}
        </button>
      </div>

      {/* ── Tab: Enlace para calificar ── */}
      {tab === "enlace" && <EnlaceCalificar />}

      {/* ── Tab: Emails ── */}
      {tab === "invitaciones" && (
        <div>
          <form
            onSubmit={agregarEmails}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline w-4 h-4 mr-1" />
              Email(s) del cliente
            </label>
            <textarea
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              placeholder="cliente@gmail.com&#10;Puedes pegar varios separados por coma o en líneas distintas."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
            <input
              type="text"
              value={nombreInput}
              onChange={(e) => setNombreInput(e.target.value)}
              placeholder="Nombre del cliente (opcional, solo si cargas uno)"
              className="w-full mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {aviso && (
              <div className="mt-3 text-sm text-blue-700 dark:text-blue-400">
                {aviso}
              </div>
            )}
            <button
              type="submit"
              disabled={guardando}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-60"
            >
              <UserPlus className="w-4 h-4" />
              {guardando ? "Guardando…" : "Agregar a la lista"}
            </button>
          </form>

          {/* Lista de invitaciones */}
          {loadingInv ? (
            <p className="text-center text-gray-400 py-8">Cargando…</p>
          ) : invitaciones.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Aún no has cargado ningún email. Agrega el primero arriba.
            </p>
          ) : (
            <div className="space-y-2">
              {invitaciones.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {inv.email}
                    </p>
                    {inv.nombre_cliente && (
                      <p className="text-xs text-gray-500">{inv.nombre_cliente}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {inv.estado === "calificado" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Ya calificó
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-4 h-4" /> Pendiente
                      </span>
                    )}
                    <button
                      onClick={() => eliminarInvitacion(inv.id)}
                      disabled={actionId === inv.id}
                      aria-label="Quitar"
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-2">
                {calificados} de {invitaciones.length} ya te calificaron.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Calificaciones recibidas ── */}
      {tab === "calificaciones" && (
        <div>
          {avisoModeracion && (
            <p className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm px-4 py-3">
              {avisoModeracion}
            </p>
          )}
          {loadingTest ? (
            <p className="text-center text-gray-400 py-8">Cargando…</p>
          ) : testimonios.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Todavía no has recibido calificaciones.
            </p>
          ) : (
            <div className="space-y-4">
              {testimonios.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.avatar_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-600 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {t.cliente_nombre}
                      </p>
                      {t.cliente_email && (
                        <p className="text-xs text-gray-400">{t.cliente_email}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {NOMBRE_TIPO[t.tipo] || "Compra"}
                        {t.producto_relacionado && ` · ${t.producto_relacionado}`}
                      </p>
                      {t.tipo === "formateo" && t.estado !== "aprobado" && (
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                          {t.user_id
                            ? "🎁 Al publicarla se le activa el 15% (verifica que sí te contrató formateo o mantenimiento)"
                            : "Sin cuenta: no recibe el 15%"}
                        </p>
                      )}
                      {t.facebook_url && (
                        <a
                          href={t.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {t.facebook_url}
                        </a>
                      )}
                    </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.estado === "aprobado"
                          ? "bg-green-100 text-green-700"
                          : t.estado === "rechazado"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.estado === "aprobado"
                        ? "Publicado"
                        : t.estado === "rechazado"
                          ? "Rechazado"
                          : "Pendiente"}
                    </span>
                  </div>

                  {t.calificacion && (
                    <div className="flex text-amber-400 my-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          fill={i < t.calificacion ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 italic">
                    &ldquo;{t.mensaje}&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {t.estado !== "aprobado" && (
                      <button
                        onClick={() => moderar(t.id, "aprobado")}
                        disabled={actionId === t.id}
                        className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60"
                      >
                        Publicar
                      </button>
                    )}
                    {t.estado === "aprobado" && (
                      <button
                        onClick={() => moderar(t.id, "pendiente")}
                        disabled={actionId === t.id}
                        className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-60"
                      >
                        Ocultar
                      </button>
                    )}
                    {t.estado !== "rechazado" && (
                      <button
                        onClick={() => moderar(t.id, "rechazado")}
                        disabled={actionId === t.id}
                        className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 rounded-lg disabled:opacity-60"
                      >
                        Rechazar
                      </button>
                    )}
                    {t.avatar_url && (
                      <button
                        onClick={() => quitarDato(t.id, "quitar_foto")}
                        disabled={actionId === t.id}
                        className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-60"
                      >
                        Quitar foto
                      </button>
                    )}
                    {t.facebook_url && (
                      <button
                        onClick={() => quitarDato(t.id, "quitar_facebook")}
                        disabled={actionId === t.id}
                        className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-60"
                      >
                        Quitar Facebook
                      </button>
                    )}
                    <button
                      onClick={() => eliminarTestimonio(t.id)}
                      disabled={actionId === t.id}
                      className="px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
