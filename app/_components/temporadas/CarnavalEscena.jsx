"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadRollUpdater } from "@tsparticles/updater-roll";
import { loadTiltUpdater } from "@tsparticles/updater-tilt";
import { loadWobbleUpdater } from "@tsparticles/updater-wobble";
import { X, PartyPopper } from "lucide-react";
import styles from "./Carnaval.module.scss";

// Carnaval de Negros y Blancos en el Valle de Sibundoy (1 al 7 de enero).
//   - Banner con rombos de arlequín y serpentinas (framer-motion + GSAP)
//   - Confeti negro, blanco, gris y azul cayendo (tsParticles)
//   - Nubes de talco (o de cosmético el Día de Negros) al tocar la página (GSAP)

const CERRADO_KEY = "neurai-carnaval-cerrado";

const MENSAJES = {
  1: "¡Feliz año nuevo! Arrancan los carnavales en el Valle de Sibundoy.",
  2: "Se vienen los días de juego: alista el talco y el cosmético.",
  3: "El valle ya huele a carnaval: música, comparsas y alegría.",
  4: "Mañana es el Día de Negros. ¡Prepárate para jugar con respeto!",
  5: "Hoy es el Día de Negros: el cosmético nos hace a todos iguales.",
  6: "Hoy es el Día de Blancos: talco, espuma y mucha alegría.",
  7: "Cierre del carnaval. ¡Gracias por jugar con respeto y alegría!",
};

const SERPENTINAS = [
  { d: "M-20 30 C 80 -10, 120 90, 220 40 S 380 0, 460 50", color: "#111827", ancho: 5 },
  { d: "M-20 120 C 60 70, 160 170, 260 110 S 420 60, 520 120", color: "#2563eb", ancho: 4 },
  { d: "M700 -10 C 760 60, 860 10, 920 80 S 1060 40, 1240 90", color: "#9ca3af", ancho: 5 },
  { d: "M640 170 C 720 110, 820 200, 920 140 S 1100 110, 1240 170", color: "#111827", ancho: 4 },
  { d: "M380 -10 C 420 40, 500 0, 560 50 S 660 20, 720 60", color: "#ffffff", ancho: 4, borde: true },
];

const COLORES_CONFETI = ["#111827", "#ffffff", "#9ca3af", "#2563eb", "#0b0b0c", "#f3f4f6"];

function opcionesConfeti(movil) {
  return {
    fullScreen: { enable: false },
    detectRetina: true,
    fpsLimit: 60,
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: movil ? 22 : 45 },
      color: { value: COLORES_CONFETI },
      shape: { type: ["square", "circle"] },
      opacity: { value: { min: 0.75, max: 1 } },
      size: { value: { min: 3, max: 6 } },
      stroke: { width: 0.6, color: { value: "#9ca3af" } },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: { enable: true, speed: 25 },
      },
      tilt: {
        enable: true,
        value: { min: 0, max: 360 },
        direction: "random",
        animation: { enable: true, speed: 30 },
      },
      roll: {
        enable: true,
        darken: { enable: true, value: 20 },
        speed: { min: 10, max: 20 },
      },
      wobble: { enable: true, distance: 20, speed: { min: -12, max: 12 } },
      move: {
        enable: true,
        direction: "bottom",
        speed: { min: 1.2, max: 3 },
        straight: false,
        drift: { min: -1, max: 1 },
        outModes: { default: "out" },
      },
    },
  };
}

// Cuántos días faltan para el Día de Negros (5 de enero)
function textoCuenta(dia) {
  if (dia < 4) return `Faltan ${5 - dia} días para el Día de Negros`;
  if (dia === 4) return "Mañana: Día de Negros";
  if (dia === 5) return "Mañana: Día de Blancos";
  if (dia === 6) return "¡Que no falte el talco!";
  return "Nos vemos en el carnaval 2028";
}

export default function CarnavalEscena({ dia, vistaPrevia, reducido }) {
  const [visible, setVisible] = useState(false);
  const [particulasListas, setParticulasListas] = useState(false);
  const [movil, setMovil] = useState(false);
  const capaRef = useRef(null);
  const bannerRef = useRef(null);

  const negros = dia === 5;
  const blancos = dia === 6;

  useEffect(() => {
    setMovil(window.innerWidth < 768);
    try {
      // En vista previa siempre se muestra; si no, se oculta por el día al cerrar
      const cerrado = sessionStorage.getItem(CERRADO_KEY);
      setVisible(vistaPrevia || cerrado !== String(dia));
    } catch {
      setVisible(true);
    }
  }, [dia, vistaPrevia]);

  // Motor de tsParticles: una sola vez
  useEffect(() => {
    if (reducido) return;
    let activo = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadRollUpdater(engine);
      await loadTiltUpdater(engine);
      await loadWobbleUpdater(engine);
    }).then(() => activo && setParticulasListas(true));
    return () => {
      activo = false;
    };
  }, [reducido]);

  // Nube de talco (blanco) o de cosmético (negro) en un punto de la pantalla
  const lanzarNube = useCallback(
    (x, y, fuerza = 1) => {
      const capa = capaRef.current;
      if (!capa || reducido) return;
      const top = capa.getBoundingClientRect().top;
      const cy = y - top;
      const oscuro = negros || (!blancos && Math.random() < 0.35);

      const nube = document.createElement("div");
      nube.className = `${styles.nube} ${oscuro ? styles.nubeCosmetico : styles.nubeTalco}`;
      const tam = 140 * fuerza;
      Object.assign(nube.style, { width: `${tam}px`, height: `${tam}px` });
      capa.appendChild(nube);
      gsap.fromTo(
        nube,
        { x: x - tam / 2, y: cy - tam / 2, scale: 0.2, opacity: 0.95 },
        {
          scale: 1.6,
          opacity: 0,
          duration: 1.8,
          ease: "power2.out",
          onComplete: () => nube.remove(),
        },
      );

      const cantidad = Math.round(26 * fuerza);
      for (let i = 0; i < cantidad; i++) {
        const p = document.createElement("span");
        const lado = 3 + Math.random() * 6;
        p.className = `${styles.particula} ${oscuro ? styles.cosmetico : styles.talco}`;
        Object.assign(p.style, { width: `${lado}px`, height: `${lado}px` });
        capa.appendChild(p);
        const angulo = Math.random() * Math.PI * 2;
        const distancia = (40 + Math.random() * 110) * fuerza;
        gsap
          .timeline({ onComplete: () => p.remove() })
          .fromTo(
            p,
            { x, y: cy, opacity: 1, scale: 1 },
            {
              x: x + Math.cos(angulo) * distancia,
              y: cy + Math.sin(angulo) * distancia,
              duration: 0.6 + Math.random() * 0.4,
              ease: "power3.out",
            },
          )
          .to(p, {
            y: `+=${40 + Math.random() * 60}`,
            opacity: 0,
            scale: 0.4,
            duration: 1 + Math.random() * 0.6,
            ease: "power1.in",
          });
      }
    },
    [negros, blancos, reducido],
  );

  // Algunas nubes al llegar a la página
  useEffect(() => {
    if (!visible || reducido) return;
    const ids = [0, 700, 1400].map((ms) =>
      setTimeout(() => {
        lanzarNube(
          window.innerWidth * (0.2 + Math.random() * 0.6),
          window.innerHeight * (0.3 + Math.random() * 0.4),
          0.9,
        );
      }, 600 + ms),
    );
    return () => ids.forEach(clearTimeout);
  }, [visible, reducido, lanzarNube]);

  // Tocar la página (fuera de botones y enlaces) lanza talco
  useEffect(() => {
    if (reducido) return;
    const alTocar = (e) => {
      if (e.target.closest("a, button, input, textarea, select, label, [role='button']")) return;
      lanzarNube(e.clientX, e.clientY, 0.6);
    };
    document.addEventListener("pointerdown", alTocar);
    return () => document.removeEventListener("pointerdown", alTocar);
  }, [reducido, lanzarNube]);

  // Serpentinas: se dibujan y luego se mecen (GSAP)
  useEffect(() => {
    if (!visible || reducido || !bannerRef.current) return;
    const ctx = gsap.context(() => {
      const trazos = gsap.utils.toArray("[data-serpentina]");
      trazos.forEach((t) => {
        const largo = t.getTotalLength();
        gsap.set(t, { strokeDasharray: largo, strokeDashoffset: largo });
      });
      gsap.to(trazos, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.inOut",
        stagger: 0.15,
        delay: 0.3,
      });
      trazos.forEach((t, i) => {
        gsap.to(t, {
          y: i % 2 ? 6 : -6,
          rotation: i % 2 ? 1.5 : -1.5,
          transformOrigin: "50% 50%",
          duration: 2.4 + i * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.8,
        });
      });
    }, bannerRef);
    return () => ctx.revert();
  }, [visible, reducido]);

  const cerrar = () => {
    try {
      sessionStorage.setItem(CERRADO_KEY, String(dia));
    } catch {
      // sin almacenamiento: solo se oculta en esta visita
    }
    setVisible(false);
  };

  const echarTalco = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    lanzarNube(r.left + r.width / 2, r.top + r.height / 2, 1.3);
    setTimeout(() => lanzarNube(r.left - 60, r.top - 30, 0.8), 180);
    setTimeout(() => lanzarNube(r.right + 60, r.top - 10, 0.8), 320);
  };

  const opciones = useMemo(() => opcionesConfeti(movil), [movil]);

  const claseBanner = [
    styles.banner,
    negros ? styles.bannerNegros : "",
    blancos ? styles.bannerBlancos : "",
  ].join(" ");

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.section
            ref={bannerRef}
            key="carnaval"
            className={claseBanner}
            aria-label="Carnaval de Negros y Blancos"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
          >
            <div className={styles.rombos} aria-hidden="true" />
            <div className={styles.mitades} aria-hidden="true" />
            {!reducido && (
              <svg
                className={styles.serpentinas}
                viewBox="0 0 1200 200"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {SERPENTINAS.map((s, i) => (
                  <g key={i}>
                    {s.borde && (
                      <path d={s.d} fill="none" stroke="#9ca3af" strokeWidth={s.ancho + 2} strokeLinecap="round" opacity="0.5" data-serpentina />
                    )}
                    <path d={s.d} fill="none" stroke={s.color} strokeWidth={s.ancho} strokeLinecap="round" opacity="0.55" data-serpentina />
                  </g>
                ))}
              </svg>
            )}

            <button type="button" className={styles.cerrar} onClick={cerrar} aria-label="Cerrar aviso del carnaval">
              <X size={16} />
            </button>

            <div className={styles.contenido}>
              <div>
                {vistaPrevia && (
                  <span className={styles.vistaPrevia}>Vista previa · día {dia} de enero</span>
                )}
                <span className={styles.etiqueta}>
                  <PartyPopper size={14} /> Carnaval {dia} de enero
                </span>
                <motion.h2
                  className={styles.titulo}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  ¡Que viva el Carnaval de{" "}
                  <span className={styles.palabraNegros}>Negros</span> y{" "}
                  <span className={styles.palabraBlancos}>Blancos</span>!
                </motion.h2>
                <p className={styles.mensaje}>{MENSAJES[dia]}</p>
                <p className={styles.lugar}>Valle de Sibundoy · Alto Putumayo · 1 al 7 de enero</p>
              </div>

              <div className={styles.acciones}>
                <motion.button
                  type="button"
                  className={styles.boton}
                  onClick={echarTalco}
                  whileHover={{ rotate: [-2, 2, -2, 0], transition: { duration: 0.4 } }}
                  whileTap={{ scale: 0.92 }}
                >
                  {negros ? "¡Echar cosmético!" : "¡Echar talco!"}
                </motion.button>
                <span className={styles.cuenta}>{textoCuenta(dia)}</span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <div ref={capaRef} className={styles.capa} aria-hidden="true">
        {particulasListas && visible && (
          <Particles
            id="confeti-carnaval"
            options={opciones}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
      </div>
    </>
  );
}
