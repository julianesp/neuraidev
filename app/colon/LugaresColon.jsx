"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/auth/roles";
import { lugares as lugaresRespaldo } from "./lugares";
import {
  apiLugares,
  borrarLugarMedia,
  subirArchivosLugar,
  textoEstado,
} from "./subirMedia";
import styles from "./Colon.module.scss";

/**
 * Lugares de Colón: cada lugar (parque, termales, iglesia…) aparece como una
 * tarjeta; al tocarla se despliegan sus fotos y vídeos. Tocar uno abre el
 * visor a pantalla completa (con zoom en las fotos).
 *
 * Los lugares y sus fotos viven en D1 y se editan en /dashboard/colon (nombre,
 * descripción, orden, portada…). Con la cuenta de administrador también se
 * pueden crear lugares y subir/borrar fotos y vídeos aquí mismo.
 * lugaresDb: undefined = cargando · null = la API falló (se usa app/colon/lugares.js).
 */
export default function LugaresColon({ lugaresDb, media = [], onCambio }) {
  const { user } = useUser();
  const admin = isAdmin(user);

  const lugares = useMemo(() => {
    const deDb = (lugarId, titulo) =>
      media
        .filter((m) => m.lugar_id === lugarId)
        .map((m, i) => ({
          id: m.id,
          tipo: m.tipo,
          src: m.url,
          thumb: m.thumb_url || m.url,
          alt: `${titulo} — ${m.tipo === "video" ? "vídeo" : "foto"}`,
          key: `${m.id}-${i}`,
        }));
    if (lugaresDb === undefined) return [];
    if (lugaresDb === null) {
      return lugaresRespaldo.map((l) => ({
        ...l,
        fotos: l.fotos.map((f) => ({ ...f, tipo: "foto" })),
      }));
    }
    return lugaresDb.map((l) => ({ ...l, fotos: deDb(l.id, l.titulo) }));
  }, [lugaresDb, media]);

  const [abierto, setAbierto] = useState(null); // id del lugar desplegado
  const [visor, setVisor] = useState(null); // { lugar, indice }
  const galeriaRef = useRef(null);

  // Enlace directo: /colon#parque abre ese lugar.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (lugares.some((l) => l.id === id)) setAbierto(id);
  }, [lugares]);

  const alternar = (id) => {
    const nuevo = abierto === id ? null : id;
    setAbierto(nuevo);
    const url = nuevo ? `#${nuevo}` : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  };

  // Al abrir un lugar, llevar la galería a la vista.
  useEffect(() => {
    if (!abierto || !galeriaRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    galeriaRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [abierto]);

  if (lugares.length === 0 && !admin) return null;
  const lugarAbierto = lugares.find((l) => l.id === abierto);

  return (
    <section className={styles.lugaresSection} aria-labelledby="lugares-titulo">
      <h2 id="lugares-titulo" className={styles.eventosTitulo}>
        Lugares de Colón
      </h2>

      {admin && (
        <NuevoLugar
          onCreado={async (lugar) => {
            await onCambio?.();
            setAbierto(lugar.id);
            window.history.replaceState(null, "", `#${lugar.id}`);
          }}
        />
      )}

      <div className={styles.lugaresGrid}>
        {lugares.map((lugar) => {
          const activo = lugar.id === abierto;
          const portada = lugar.fotos.find((f) => f.tipo === "foto") || lugar.fotos[0];
          const nFotos = lugar.fotos.filter((f) => f.tipo === "foto").length;
          const nVideos = lugar.fotos.length - nFotos;
          const meta = [
            nFotos ? `${nFotos} ${nFotos === 1 ? "foto" : "fotos"}` : null,
            nVideos ? `${nVideos} ${nVideos === 1 ? "vídeo" : "vídeos"}` : null,
          ].filter(Boolean).join(" · ") || "Sin fotos aún";
          return (
            <button
              key={lugar.id}
              type="button"
              className={`${styles.lugarCard} ${activo ? styles.lugarCardActiva : ""}`}
              onClick={() => alternar(lugar.id)}
              aria-expanded={activo}
              aria-controls={`galeria-${lugar.id}`}
            >
              {portada?.tipo === "video" ? (
                <video src={`${portada.src}#t=0.1`} preload="metadata" muted playsInline />
              ) : portada ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={portada.thumb} alt="" loading="lazy" decoding="async" />
              ) : null}
              <span className={styles.lugarCardOverlay}>
                <span className={styles.lugarCardTitulo}>{lugar.titulo}</span>
                <span className={styles.lugarCardMeta}>
                  {meta} · {activo ? "Ocultar" : "Ver"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {lugarAbierto && (
        <article
          ref={galeriaRef}
          id={`galeria-${lugarAbierto.id}`}
          className={styles.lugar}
        >
          <header className={styles.lugarHeader}>
            <div>
              <h3 className={styles.lugarTitulo}>{lugarAbierto.titulo}</h3>
              {lugarAbierto.descripcion && (
                <p className={styles.lugarDescripcion}>{lugarAbierto.descripcion}</p>
              )}
            </div>
            <button
              type="button"
              className={styles.lugarCerrar}
              onClick={() => alternar(lugarAbierto.id)}
            >
              Cerrar
            </button>
          </header>

          {admin && (
            <SubirMedia
              lugar={lugarAbierto}
              onCambio={onCambio}
              onLugarBorrado={() => {
                setAbierto(null);
                window.history.replaceState(null, "", window.location.pathname);
              }}
            />
          )}

          {lugarAbierto.fotos.length === 0 ? (
            <p className={styles.vacio}>Este lugar aún no tiene fotos ni vídeos.</p>
          ) : (
            <div className={styles.lugarGrid}>
              {lugarAbierto.fotos.map((foto, i) => (
                <div
                  key={foto.key || foto.src}
                  className={`${styles.lugarFotoWrap} ${i === 0 ? styles.lugarFotoGrande : ""}`}
                >
                  <button
                    type="button"
                    className={styles.lugarFoto}
                    onClick={() => setVisor({ lugar: lugarAbierto, indice: i })}
                    aria-label={`Ampliar: ${foto.alt}`}
                  >
                    {foto.tipo === "video" ? (
                      <>
                        <video src={`${foto.src}#t=0.1`} preload="metadata" muted playsInline />
                        <span className={styles.lugarPlay} aria-hidden="true">
                          <IconoPlay />
                        </span>
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={i === 0 ? foto.src : foto.thumb}
                        alt={foto.alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                      />
                    )}
                  </button>
                  {admin && foto.id && (
                    <BorrarMedia id={foto.id} tipo={foto.tipo} onCambio={onCambio} />
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      )}

      {visor && (
        <Visor
          lugar={visor.lugar}
          indiceInicial={visor.indice}
          onClose={() => setVisor(null)}
        />
      )}
    </section>
  );
}

// ── Administración (solo con la cuenta de admin) ─────────────────────────────

function SubirMedia({ lugar, onCambio, onLugarBorrado }) {
  const inputRef = useRef(null);
  const [cola, setCola] = useState([]); // { nombre, estado, progreso, error }
  const ocupado = cola.some((c) => c.estado === "subiendo" || c.estado === "procesando");

  const elegir = async (e) => {
    const archivos = [...(e.target.files || [])];
    e.target.value = "";
    if (archivos.length === 0) return;
    const ok = await subirArchivosLugar(lugar.id, archivos, setCola);
    if (ok > 0) await onCambio?.();
  };

  const borrarLugar = async () => {
    if (!window.confirm(`¿Borrar «${lugar.titulo}» con todas sus fotos y vídeos?`)) return;
    try {
      await borrarLugarMedia({ lugarId: lugar.id });
      onLugarBorrado?.();
      await onCambio?.();
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className={styles.adminPanel}>
      <div className={styles.adminAcciones}>
        <button
          type="button"
          className={styles.adminBoton}
          onClick={() => inputRef.current?.click()}
          disabled={ocupado}
        >
          <IconoSubir /> {ocupado ? "Subiendo…" : "Subir fotos o vídeos"}
        </button>
        <a href="/dashboard/colon#lugares" className={styles.adminBotonSecundario}>
          Editar nombre y orden
        </a>
        <button type="button" className={styles.adminBotonSecundario} onClick={borrarLugar} disabled={ocupado}>
          Borrar lugar
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={elegir}
        />
      </div>
      <p className={styles.adminNota}>
        Se publican al instante. Las fotos se reducen y llevan la marca «Foto tomada por neurai.dev».
      </p>
      {cola.length > 0 && (
        <ul className={styles.adminCola}>
          {cola.map((c, i) => (
            <li key={i} className={c.estado === "error" ? styles.adminColaError : undefined}>
              <span className={styles.adminColaNombre}>{c.nombre}</span>
              <span>{textoEstado(c)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BorrarMedia({ id, tipo, onCambio }) {
  const [borrando, setBorrando] = useState(false);
  const borrar = async () => {
    if (!window.confirm(`¿Borrar este ${tipo === "video" ? "vídeo" : "foto"}?`)) return;
    setBorrando(true);
    try {
      await borrarLugarMedia({ mediaId: id });
      await onCambio?.();
    } catch (err) {
      window.alert(err.message);
    }
    setBorrando(false);
  };
  return (
    <button
      type="button"
      className={styles.adminBorrar}
      onClick={borrar}
      disabled={borrando}
      aria-label={tipo === "video" ? "Borrar vídeo" : "Borrar foto"}
      title="Borrar"
    >
      <IconoCerrar />
    </button>
  );
}

function NuevoLugar({ onCreado }) {
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const { lugar } = await apiLugares("POST", { accion: "crear_lugar", titulo, descripcion });
      setTitulo("");
      setDescripcion("");
      setAbierto(false);
      await onCreado?.(lugar);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) {
    return (
      <div className={styles.adminBarra}>
        <button type="button" className={styles.adminBoton} onClick={() => setAbierto(true)}>
          <IconoMas /> Agregar lugar
        </button>
        <span className={styles.adminNota}>
          Modo administrador: abre un lugar para subirle fotos o vídeos.
        </span>
      </div>
    );
  }

  return (
    <form className={styles.adminForm} onSubmit={guardar}>
      <input
        className={styles.adminInput}
        placeholder="Nombre del lugar (p. ej. Termales)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        maxLength={80}
        autoFocus
      />
      <textarea
        className={styles.adminInput}
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        rows={2}
        maxLength={400}
      />
      {error && <p className={styles.adminError}>{error}</p>}
      <div className={styles.adminAcciones}>
        <button type="submit" className={styles.adminBoton} disabled={guardando || !titulo.trim()}>
          {guardando ? "Guardando…" : "Crear lugar"}
        </button>
        <button type="button" className={styles.adminBotonSecundario} onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Visor a pantalla completa ────────────────────────────────────────────────

const ZOOM_MIN = 1;
const ZOOM_MAX = 5;
const limitar = (v, min, max) => Math.min(max, Math.max(min, v));

function Visor({ lugar, indiceInicial, onClose }) {
  const fotos = lugar.fotos;
  const total = fotos.length;
  const [indice, setIndice] = useState(indiceInicial);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [montado, setMontado] = useState(false);

  const escenaRef = useRef(null);
  const cerrarRef = useRef(null);
  const punteros = useRef(new Map());
  const gesto = useRef(null);
  const ultimoToque = useRef(0);

  const foto = fotos[indice];
  const esVideo = foto.tipo === "video";

  const reiniciarZoom = useCallback(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const prev = useCallback(() => {
    reiniciarZoom();
    setIndice((i) => (i - 1 + total) % total);
  }, [total, reiniciarZoom]);
  const next = useCallback(() => {
    reiniciarZoom();
    setIndice((i) => (i + 1) % total);
  }, [total, reiniciarZoom]);

  // Mantiene la foto dentro de la escena al hacer zoom/arrastrar.
  const acotar = useCallback((p, z) => {
    const el = escenaRef.current;
    if (!el || z <= 1) return { x: 0, y: 0 };
    const mx = ((z - 1) * el.clientWidth) / 2;
    const my = ((z - 1) * el.clientHeight) / 2;
    return { x: limitar(p.x, -mx, mx), y: limitar(p.y, -my, my) };
  }, []);

  const cambiarZoom = useCallback(
    (nuevo) => {
      const z = limitar(nuevo, ZOOM_MIN, ZOOM_MAX);
      setZoom(z);
      setPos((p) => acotar({ x: (p.x * z) / zoom, y: (p.y * z) / zoom }, z));
    },
    [zoom, acotar]
  );

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (esVideo) return;
      else if (e.key === "+" || e.key === "=") cambiarZoom(zoom + 0.5);
      else if (e.key === "-") cambiarZoom(zoom - 0.5);
      else if (e.key === "0") reiniciarZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next, cambiarZoom, reiniciarZoom, zoom, esVideo]);

  // Bloquear el scroll de la página mientras el visor está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  useEffect(() => {
    if (montado) cerrarRef.current?.focus();
  }, [montado]);

  // Rueda del mouse: zoom (listener no pasivo para poder evitar el scroll).
  useEffect(() => {
    const el = escenaRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (esVideo) return;
      e.preventDefault();
      cambiarZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [montado, zoom, cambiarZoom, esVideo]);

  // Precargar las vecinas para que el cambio sea inmediato.
  useEffect(() => {
    [fotos[(indice + 1) % total], fotos[(indice - 1 + total) % total]].forEach((f) => {
      if (f.tipo === "video") return;
      const img = new window.Image();
      img.src = f.src;
    });
  }, [indice, fotos, total]);

  // ── Gestos: arrastrar (con zoom), pellizcar, deslizar (sin zoom), doble toque
  const onPointerDown = (e) => {
    if (e.target.closest("button, video")) return;
    escenaRef.current.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      gesto.current = { tipo: "pellizco", dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    } else {
      gesto.current = {
        tipo: "arrastre",
        x: e.clientX,
        y: e.clientY,
        pos,
        movio: false,
        fuera: e.target === escenaRef.current, // tocó el fondo, no la foto
      };
    }
  };

  const onPointerMove = (e) => {
    if (!punteros.current.has(e.pointerId)) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    if (!g) return;

    if (g.tipo === "pellizco" && punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()];
      const z = limitar((g.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / g.dist, ZOOM_MIN, ZOOM_MAX);
      setZoom(z);
      setPos((p) => acotar(p, z));
    } else if (g.tipo === "arrastre") {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.movio = true;
      if (zoom > 1) setPos(acotar({ x: g.pos.x + dx, y: g.pos.y + dy }, zoom));
    }
  };

  const onPointerUp = (e) => {
    const g = gesto.current;
    punteros.current.delete(e.pointerId);

    if (g?.tipo === "arrastre") {
      const dx = e.clientX - g.x;
      if (zoom === 1 && Math.abs(dx) > 60) {
        (dx < 0 ? next : prev)();
      } else if (!g.movio) {
        const ahora = Date.now();
        if (ahora - ultimoToque.current < 300) {
          // Doble toque / doble clic: alternar zoom.
          ultimoToque.current = 0;
          if (zoom > 1) reiniciarZoom();
          else setZoom(2.5);
        } else {
          ultimoToque.current = ahora;
          // Un toque fuera de la foto (sin zoom) cierra el visor.
          if (zoom === 1 && g.fuera) onClose();
        }
      }
    }
    gesto.current = punteros.current.size === 1
      ? (() => {
          const [p] = [...punteros.current.values()];
          return { tipo: "arrastre", x: p.x, y: p.y, pos, movio: true };
        })()
      : null;
  };

  if (!montado) return null;

  return createPortal(
    <div className={styles.visor} role="dialog" aria-modal="true" aria-label={foto.alt}>
      <div
        ref={escenaRef}
        className={`${styles.visorEscena} ${zoom > 1 ? styles.visorEscenaZoom : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {esVideo ? (
          <video
            key={foto.src}
            src={foto.src}
            className={styles.visorVideo}
            controls
            autoPlay
            playsInline
          />
        ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={foto.src}
          src={foto.src}
          alt={foto.alt}
          className={styles.visorImg}
          style={{
            backgroundImage: `url(${foto.thumb})`,
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
            transition: gesto.current ? "none" : undefined,
          }}
          draggable={false}
        />
        )}
      </div>

      {/* Barra superior: contador + herramientas + cerrar */}
      <div className={styles.visorBarra}>
        <span className={styles.visorContador}>
          {indice + 1} / {total}
        </span>
        <div className={styles.visorHerramientas}>
          {!esVideo && (<>
          <button
            type="button"
            className={styles.visorBoton}
            onClick={() => cambiarZoom(zoom - 0.5)}
            disabled={zoom <= ZOOM_MIN}
            aria-label="Alejar"
            title="Alejar (−)"
          >
            <IconoMenos />
          </button>
          <button
            type="button"
            className={`${styles.visorBoton} ${styles.visorZoomValor}`}
            onClick={reiniciarZoom}
            aria-label="Restablecer zoom"
            title="Restablecer (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className={styles.visorBoton}
            onClick={() => cambiarZoom(zoom + 0.5)}
            disabled={zoom >= ZOOM_MAX}
            aria-label="Acercar"
            title="Acercar (+)"
          >
            <IconoMas />
          </button>
          </>)}
          <button
            ref={cerrarRef}
            type="button"
            className={styles.visorBoton}
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar (Esc)"
          >
            <IconoCerrar />
          </button>
        </div>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorPrev}`}
            onClick={prev}
            aria-label="Foto anterior"
          >
            <IconoFlecha />
          </button>
          <button
            type="button"
            className={`${styles.visorNav} ${styles.visorNext}`}
            onClick={next}
            aria-label="Foto siguiente"
          >
            <IconoFlecha derecha />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

// ── Iconos (SVG en línea, heredan el color) ──────────────────────────────────

const svgProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function IconoMas() {
  return (
    <svg {...svgProps}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconoMenos() {
  return (
    <svg {...svgProps}>
      <path d="M5 12h14" />
    </svg>
  );
}
function IconoCerrar() {
  return (
    <svg {...svgProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconoFlecha({ derecha }) {
  return (
    <svg {...svgProps} width={26} height={26}>
      <path d={derecha ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
    </svg>
  );
}
function IconoPlay() {
  return (
    <svg {...svgProps} width={28} height={28} fill="currentColor" stroke="none">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}
function IconoSubir() {
  return (
    <svg {...svgProps} width={18} height={18}>
      <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
    </svg>
  );
}
