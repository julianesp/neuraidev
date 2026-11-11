"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  CATEGORIAS,
  MUNICIPIOS,
  nombreCategoria,
  nombreMunicipio,
} from "@/lib/directorio/constantes";
import { DIAS, parsearHorario } from "@/lib/directorio/horario";
import { comprimirImagen } from "@/lib/directorio/comprimirImagen";
import SelectorUbicacion from "../_components/SelectorUbicacion";
import { FOTOS_GRATIS, FOTOS_PLAN, PLANES, pesos } from "@/lib/directorio/planes";

const VACIO = {
  nombre: "",
  categoria: "",
  municipio: "",
  descripcion: "",
  whatsapp: "",
  direccion: "",
  lat: null,
  lng: null,
  horario: null, // objeto { lun: {a:"08:00", c:"18:00"} | null, ... }
  facebook: "",
  instagram: "",
  logo_url: "",
  fotos: [],
};

const ESTADOS = {
  pendiente: { texto: "En revisión", clase: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200" },
  aprobado: { texto: "Publicado", clase: "bg-blue-600 text-white" },
  rechazado: { texto: "Necesita cambios", clase: "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900" },
};

const campo =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white";

async function subirImagen(file, opciones) {
  // Se reduce el peso antes de subir: así la ficha carga rápido para quien la visita.
  const liviana = await comprimirImagen(file, opciones);
  const fd = new FormData();
  fd.append("file", liviana);
  const res = await fetch("/api/upload-image", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "No se pudo subir la imagen");
  return data.url;
}

const fechaLarga = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });

function cargarScriptEpayco() {
  return new Promise((resolve, reject) => {
    if (window.ePayco?.checkout) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.epayco.co/checkout.js";
    script.onload = () => (window.ePayco?.checkout ? resolve() : reject(new Error("ePayco no se inicializó")));
    script.onerror = () => reject(new Error("No se pudo cargar ePayco. Revisa tu conexión."));
    document.head.appendChild(script);
  });
}

export default function MisNegociosPage() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(null); // null = lista; objeto = formulario
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [pagando, setPagando] = useState(null); // "<negocioId>:<plan>" mientras se abre el checkout
  const [verificandoPago, setVerificandoPago] = useState(false);
  const abrirDesdeUrl = useRef(false);
  const inputLogo = useRef(null);
  const inputFotos = useRef(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/directorio/mis-negocios");
      const data = await res.json();
      setNegocios(data.negocios || []);
    } catch {
      setNegocios([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Llegar con ?editar=<id> (botón de la ficha) abre directo el formulario de ese negocio.
  useEffect(() => {
    if (abrirDesdeUrl.current || negocios.length === 0) return;
    const id = new URLSearchParams(window.location.search).get("editar");
    abrirDesdeUrl.current = true;
    const n = negocios.find((x) => x.id === id);
    if (n) abrirEdicion(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negocios]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Fotos permitidas en el formulario: una ficha nueva arranca en prueba (15).
  const limiteForm = editId ? (negocios.find((n) => n.id === editId)?.limite_fotos ?? FOTOS_GRATIS) : FOTOS_PLAN;

  const pagar = async (negocio, plan) => {
    setError("");
    setPagando(`${negocio.id}:${plan}`);
    try {
      const res = await fetch("/api/directorio/pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocio_id: negocio.id, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago");
      await cargarScriptEpayco();
      const { key, test, ...pago } = data.config;
      // El lightbox de ePayco se agrega al final de la página y puede arrastrar el scroll hasta el footer.
      const y = window.scrollY;
      window.ePayco.checkout.configure({ key, test }).open(pago);
      [0, 150, 500, 1200].forEach((ms) => setTimeout(() => window.scrollTo({ top: y, behavior: "auto" }), ms));
    } catch (e) {
      setError(e.message);
    } finally {
      setPagando(null);
    }
  };

  // Al volver de ePayco (o al abrir la página) se revisa si hay un pago reciente:
  // PSE/Nequi se confirman por webhook unos minutos después, así que se consulta cada 5 s.
  useEffect(() => {
    let activo = true;
    let intentos = 0;
    const revisar = async () => {
      try {
        const res = await fetch("/api/directorio/pago");
        const { pago } = await res.json();
        if (!activo || !pago) return setVerificandoPago(false);
        if (pago.estado === "aprobado") {
          setVerificandoPago(false);
          if (Date.now() - new Date(pago.created_at).getTime() < 30 * 60_000) {
            setAviso("¡Pago recibido! Tu plan ya está activo: puedes subir hasta 15 fotos.");
          }
          return cargar();
        }
        if (pago.estado === "pendiente" && Date.now() - new Date(pago.created_at).getTime() < 30 * 60_000) {
          setVerificandoPago(true);
          if (++intentos < 60) setTimeout(revisar, 5000);
          else setVerificandoPago(false);
        } else {
          setVerificandoPago(false);
        }
      } catch {
        setVerificandoPago(false);
      }
    };
    revisar();
    return () => {
      activo = false;
    };
  }, [cargar]);

  // Al cambiar entre lista y formulario la página cambia de alto: sin esto el
  // navegador deja el scroll abajo y se ve el footer en vez del contenido.
  const irArriba = () => window.scrollTo({ top: 0, behavior: "auto" });

  const abrirNuevo = () => {
    setForm({ ...VACIO });
    setEditId(null);
    setError("");
    setAviso("");
    irArriba();
  };
  const abrirEdicion = (n) => {
    setForm({ ...VACIO, ...n, horario: parsearHorario(n.horario), fotos: n.fotos || [] });
    setEditId(n.id);
    setError("");
    setAviso("");
    irArriba();
  };

  const subirLogo = async (file) => {
    if (!file) return;
    setSubiendo(true);
    setError("");
    try {
      const url = await subirImagen(file, { maxLado: 800 });
      setForm((f) => ({ ...f, logo_url: url }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendo(false);
    }
  };

  const subirFotos = async (files) => {
    const lista = Array.from(files || []);
    if (!lista.length) return;
    setSubiendo(true);
    setError("");
    try {
      const disponibles = limiteForm - form.fotos.length;
      const urls = [];
      for (const f of lista.slice(0, disponibles)) urls.push(await subirImagen(f));
      setForm((f) => ({ ...f, fotos: [...f.fotos, ...urls] }));
    } catch (e) {
      setError(e.message);
    } finally {
      setSubiendo(false);
    }
  };

  const cambiarDia = (id, valor) =>
    setForm((f) => ({ ...f, horario: { ...(f.horario || {}), [id]: valor } }));
  const alternarDia = (id, abierto) =>
    cambiarDia(id, abierto ? { a: "08:00", c: "18:00" } : null);
  const copiarATodos = () => {
    const base = DIAS.map((d) => form.horario?.[d.id]).find(Boolean);
    if (!base) return;
    setForm((f) => ({
      ...f,
      horario: Object.fromEntries(DIAS.map((d) => [d.id, { ...base }])),
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const res = await fetch("/api/directorio/mis-negocios", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { ...form, id: editId } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setAviso(
        data.estado === "aprobado"
          ? "Listo, tu negocio ya está publicado."
          : "Recibimos tu negocio. Lo revisaremos pronto y quedará publicado en el directorio."
      );
      setForm(null);
      irArriba();
      await cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (n) => {
    if (!window.confirm(`¿Eliminar "${n.nombre}" del directorio?`)) return;
    await fetch(`/api/directorio/mis-negocios?id=${encodeURIComponent(n.id)}`, { method: "DELETE" });
    await cargar();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-24 pb-8 sm:pt-28">
      <Link href="/directorio" className="text-sm text-blue-600 hover:underline">
        ← Directorio del Putumayo
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">Mis negocios</h1>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Publica tu negocio o servicio gratis para que cualquier persona del Putumayo te encuentre y te contacte.
      </p>

      {verificandoPago && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
          <Loader2 className="h-4 w-4 animate-spin" /> Estamos confirmando tu pago con ePayco. Puede tardar un par de minutos.
        </p>
      )}
      {aviso && (
        <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
          {aviso}
        </p>
      )}

      {!form && error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {!form && (
        <>
          <button
            onClick={abrirNuevo}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Publicar un negocio
          </button>

          {cargando ? (
            <p className="mt-8 flex items-center gap-2 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando…
            </p>
          ) : negocios.length === 0 ? (
            <p className="mt-8 text-gray-600 dark:text-gray-400">Todavía no has publicado ningún negocio.</p>
          ) : (
            <ul className="mt-6 space-y-3">
              {negocios.map((n) => {
                const est = ESTADOS[n.estado] || ESTADOS.pendiente;
                return (
                  <li
                    key={n.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">{n.nombre}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {nombreCategoria(n.categoria)} · {nombreMunicipio(n.municipio)}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${est.clase}`}>{est.texto}</span>
                    </div>
                    {n.estado === "rechazado" && n.motivo_rechazo && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <strong>Motivo:</strong> {n.motivo_rechazo}. Corrígelo y se revisará de nuevo.
                      </p>
                    )}
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800/60">
                      <p className="text-gray-800 dark:text-gray-200">
                        {n.plan_activo ? (
                          <>
                            <strong>{n.en_prueba ? "Prueba gratis" : "Plan activo"}</strong> hasta el {fechaLarga(n.plan_hasta)} ·
                            hasta {FOTOS_PLAN} fotos
                          </>
                        ) : (
                          <>
                            <strong>Plan vencido.</strong> Solo se muestran {FOTOS_GRATIS} fotos; las demás reaparecen al
                            activar el plan.
                          </>
                        )}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => pagar(n, "mensual")}
                          disabled={!!pagando}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-medium !text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {pagando === `${n.id}:mensual` && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          1 mes · {pesos(PLANES.mensual.precio)}
                        </button>
                        <button
                          onClick={() => pagar(n, "semestral")}
                          disabled={!!pagando}
                          className="inline-flex items-center gap-1 rounded-lg border-2 border-blue-600 px-3 py-1.5 font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-900/30"
                        >
                          {pagando === `${n.id}:semestral` && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          6 meses · {pesos(PLANES.semestral.precio)} (ahorras {pesos(PLANES.mensual.precio * 6 - PLANES.semestral.precio)})
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {n.estado === "aprobado" && (
                        <Link
                          href={`/directorio/${n.slug}`}
                          className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          Ver publicado
                        </Link>
                      )}
                      <button
                        onClick={() => abrirEdicion(n)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-blue-600 dark:border-gray-700 dark:text-gray-200"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => eliminar(n)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-800 hover:border-gray-900 dark:border-gray-700 dark:text-gray-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {form && (
        <form onSubmit={guardar} className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editId ? "Editar negocio" : "Nuevo negocio"}
          </h2>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Nombre del negocio *</span>
            <input className={campo} value={form.nombre} onChange={set("nombre")} maxLength={80} required />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Categoría *</span>
              <select className={campo} value={form.categoria} onChange={set("categoria")} required>
                <option value="">Elige…</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Municipio *</span>
              <select className={campo} value={form.municipio} onChange={set("municipio")} required>
                <option value="">Elige…</option>
                {MUNICIPIOS.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Descripción</span>
            <textarea
              className={campo}
              rows={4}
              value={form.descripcion}
              onChange={set("descripcion")}
              maxLength={1200}
              placeholder="¿Qué ofreces? ¿Qué te hace diferente?"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">WhatsApp *</span>
            <input
              className={campo}
              inputMode="tel"
              value={form.whatsapp ? form.whatsapp.replace(/^57(?=3\d{9}$)/, "") : ""}
              onChange={set("whatsapp")}
              placeholder="3001234567"
              maxLength={13}
              required
            />
            <span className="mt-1 block text-xs text-gray-500">Es el número con el que te escribirán y te llamarán.</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Dirección</span>
            <input className={campo} value={form.direccion} onChange={set("direccion")} maxLength={160} placeholder="Calle 5 #3-20, barrio Centro" />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Ubicación en el mapa
            </span>
            <SelectorUbicacion
              municipio={form.municipio}
              lat={form.lat ?? null}
              lng={form.lng ?? null}
              onChange={({ lat, lng }) => setForm((f) => ({ ...f, lat, lng }))}
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Horario de atención</legend>
            <div className="divide-y divide-gray-200 rounded-lg border border-gray-300 dark:divide-gray-800 dark:border-gray-700">
              {DIAS.map((d) => {
                const dia = form.horario?.[d.id];
                return (
                  <div key={d.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2">
                    <span className="w-28 text-sm font-medium text-gray-900 dark:text-gray-100">{d.nombre}</span>
                    {dia ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="time"
                          value={dia.a}
                          onChange={(e) => cambiarDia(d.id, { ...dia, a: e.target.value })}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          aria-label={`${d.nombre}: hora de apertura`}
                          required
                        />
                        <span>a</span>
                        <input
                          type="time"
                          value={dia.c}
                          onChange={(e) => cambiarDia(d.id, { ...dia, c: e.target.value })}
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          aria-label={`${d.nombre}: hora de cierre`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => alternarDia(d.id, false)}
                          className="ml-1 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:border-gray-900 dark:border-gray-700 dark:text-gray-300"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Cerrado</span>
                        <button
                          type="button"
                          onClick={() => alternarDia(d.id, true)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium !text-white hover:bg-blue-700"
                        >
                          + Establecer hora
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={copiarATodos}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              Copiar el primer horario a todos los días
            </button>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Facebook</span>
              <input className={campo} value={form.facebook} onChange={set("facebook")} placeholder="facebook.com/minegocio" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Instagram</span>
              <input className={campo} value={form.instagram} onChange={set("instagram")} placeholder="instagram.com/minegocio" />
            </label>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">Logo</span>
            <div className="flex items-center gap-3">
              {form.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logo_url} alt="Logo" className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
              ) : null}
              <button
                type="button"
                onClick={() => inputLogo.current?.click()}
                disabled={subiendo}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 hover:border-blue-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
              >
                <ImagePlus className="h-4 w-4" /> {form.logo_url ? "Cambiar logo" : "Subir logo"}
              </button>
              <input ref={inputLogo} type="file" accept="image/*" hidden onChange={(e) => { subirLogo(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Fotos ({form.fotos.length}/{limiteForm})
            </span>
            <div className="flex flex-wrap gap-2">
              {form.fotos.map((url) => (
                <div key={url} className="relative h-20 w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() => setForm((f) => ({ ...f, fotos: f.fotos.filter((u) => u !== url) }))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-gray-900 p-0.5 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {form.fotos.length < limiteForm && (
                <button
                  type="button"
                  onClick={() => inputFotos.current?.click()}
                  disabled={subiendo}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-gray-400 text-gray-600 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50"
                >
                  {subiendo ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                </button>
              )}
              <input ref={inputFotos} type="file" accept="image/*" multiple hidden onChange={(e) => { subirFotos(e.target.files); e.target.value = ""; }} />
            </div>
            <p className="mt-1 text-xs text-gray-500">Máximo 4 MB por foto.</p>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={guardando || subiendo}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
              {editId ? "Guardar cambios" : "Enviar para publicar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                irArriba();
              }}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-800 dark:border-gray-700 dark:text-gray-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
