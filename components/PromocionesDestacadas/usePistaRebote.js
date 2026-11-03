"use client";

import { useEffect, useState } from "react";

// Tarjetas que van de un lado al otro dentro de la pista (ancho del viewport).
// Se reparten en carriles horizontales; en cada carril chocan entre sí y con
// los bordes: al chocar intercambian velocidad (choque elástico de masas
// iguales), así rebotan y cambian de dirección.
//
// Cada tarjeta es un elemento con [data-rebote]; se mueve con transform.
// Se pausa con el mouse encima, unos segundos al tocarla en el celular, fuera
// de pantalla y con la pestaña oculta. Con "reducir movimiento" no se activa.

const SEPARACION_CARRILES = 20; // px entre carriles
const VEL_MIN = 45; // px/s
const VEL_MAX = 90;
const PAUSA_TOQUE_MS = 3500;

function velocidadAleatoria() {
  const v = VEL_MIN + Math.random() * (VEL_MAX - VEL_MIN);
  return Math.random() < 0.5 ? -v : v;
}

// Pequeño "aplastamiento" de la tarjeta al chocar
function aplastar(cuerpo, lado) {
  const tarjeta = cuerpo.el.firstElementChild;
  if (!tarjeta?.animate) return;
  tarjeta.animate(
    [
      { transform: "scale(1, 1)" },
      { transform: "scale(0.9, 1.05)", transformOrigin: lado },
      { transform: "scale(1, 1)" },
    ],
    { duration: 260, easing: "ease-out" },
  );
}

export default function usePistaRebote(pistaRef, cantidad) {
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista || cantidad === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuerpos = [];
    let carriles = [];
    let ancho = 0;
    let raf = 0;
    let ultimo = 0;
    let visible = true;
    let mouseEncima = false;
    let pausaHasta = 0;

    const pintar = (c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    };

    const medir = () => {
      const anterior = ancho;
      // 100vw incluye la barra de scroll: el límite real es el ancho visible
      const izquierda = pista.getBoundingClientRect().left;
      ancho = Math.min(
        pista.clientWidth,
        document.documentElement.clientWidth - Math.max(0, izquierda),
      );
      const elementos = [...pista.querySelectorAll("[data-rebote]")];
      const previos = new Map(cuerpos.map((c) => [c.el, c]));
      cuerpos = elementos.map((el) => {
        const p = previos.get(el);
        return {
          el,
          w: el.offsetWidth,
          h: el.offsetHeight,
          // al cambiar el tamaño de la ventana se conserva la posición relativa
          x: p && anterior ? (p.x / anterior) * ancho : 0,
          y: 0,
          v: p ? p.v : velocidadAleatoria(),
          nueva: !p,
        };
      });

      // Carriles: en cada uno las tarjetas ocupan como mucho ~80% del ancho,
      // así siempre queda espacio para moverse
      const libreMin = Math.max(60, ancho * 0.2);
      carriles = [];
      let actual = [];
      let suma = 0;
      for (const c of cuerpos) {
        if (actual.length && suma + c.w > ancho - libreMin) {
          carriles.push(actual);
          actual = [];
          suma = 0;
        }
        actual.push(c);
        suma += c.w;
      }
      if (actual.length) carriles.push(actual);

      let y = 0;
      for (const carril of carriles) {
        const alto = Math.max(...carril.map((c) => c.h));
        const total = carril.reduce((s, c) => s + c.w, 0);
        const hueco = (ancho - total) / (carril.length + 1);
        let x = hueco;
        for (const c of carril) {
          c.y = y + (alto - c.h) / 2;
          if (c.nueva || !anterior) c.x = x;
          x += c.w + hueco;
        }
        // Mantener el orden de izquierda a derecha dentro del carril
        carril.sort((a, b) => a.x - b.x);
        y += alto + SEPARACION_CARRILES;
      }
      pista.style.height = `${Math.max(0, y - SEPARACION_CARRILES)}px`;
      cuerpos.forEach(pintar);
    };

    const paso = (dt) => {
      for (const carril of carriles) {
        for (const c of carril) c.x += c.v * dt;

        // Choques entre vecinas del carril
        for (let i = 0; i < carril.length - 1; i++) {
          const a = carril[i];
          const b = carril[i + 1];
          const solape = a.x + a.w - b.x;
          if (solape > 0) {
            a.x -= solape / 2;
            b.x += solape / 2;
            if (a.v > b.v) {
              const t = a.v;
              a.v = b.v;
              b.v = t;
              aplastar(a, "right center");
              aplastar(b, "left center");
            }
          }
        }

        // Bordes del viewport
        const primera = carril[0];
        const ultima = carril[carril.length - 1];
        if (primera.x < 0) {
          primera.x = 0;
          if (primera.v < 0) {
            primera.v = -primera.v;
            aplastar(primera, "left center");
          }
        }
        if (ultima.x + ultima.w > ancho) {
          ultima.x = ancho - ultima.w;
          if (ultima.v > 0) {
            ultima.v = -ultima.v;
            aplastar(ultima, "right center");
          }
        }
        // Si quedaron apretadas contra un borde, que no se monten
        for (let i = 1; i < carril.length; i++) {
          const a = carril[i - 1];
          const b = carril[i];
          if (b.x < a.x + a.w) b.x = a.x + a.w;
        }
        for (let i = carril.length - 2; i >= 0; i--) {
          const a = carril[i];
          const b = carril[i + 1];
          if (a.x + a.w > b.x) a.x = b.x - a.w;
        }
      }
      cuerpos.forEach(pintar);
    };

    const cuadro = (t) => {
      const dt = ultimo ? Math.min((t - ultimo) / 1000, 0.05) : 0;
      ultimo = t;
      if (!mouseEncima && Date.now() > pausaHasta) paso(dt);
      raf = requestAnimationFrame(cuadro);
    };

    const arrancar = () => {
      cancelAnimationFrame(raf);
      ultimo = 0;
      if (visible && !document.hidden) raf = requestAnimationFrame(cuadro);
    };

    const alEntrar = (e) => {
      if (e.pointerType === "mouse") mouseEncima = true;
    };
    const alSalir = (e) => {
      if (e.pointerType === "mouse") mouseEncima = false;
    };
    const alTocar = (e) => {
      if (e.pointerType !== "mouse") pausaHasta = Date.now() + PAUSA_TOQUE_MS;
    };

    const observador = new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      arrancar();
    });
    const alCambiarTamano = new ResizeObserver(() => medir());

    setActiva(true);
    // Esperar a que se apliquen los estilos de la pista activa para medir
    const inicio = requestAnimationFrame(() => {
      medir();
      observador.observe(pista);
      alCambiarTamano.observe(pista);
      // las imágenes al cargar cambian el alto de las tarjetas
      pista.querySelectorAll("[data-rebote]").forEach((el) => alCambiarTamano.observe(el));
      arrancar();
    });

    pista.addEventListener("pointerenter", alEntrar);
    pista.addEventListener("pointerleave", alSalir);
    pista.addEventListener("pointerdown", alTocar);
    document.addEventListener("visibilitychange", arrancar);

    return () => {
      cancelAnimationFrame(inicio);
      cancelAnimationFrame(raf);
      observador.disconnect();
      alCambiarTamano.disconnect();
      pista.removeEventListener("pointerenter", alEntrar);
      pista.removeEventListener("pointerleave", alSalir);
      pista.removeEventListener("pointerdown", alTocar);
      document.removeEventListener("visibilitychange", arrancar);
      pista.style.height = "";
      cuerpos.forEach((c) => (c.el.style.transform = ""));
      setActiva(false);
    };
  }, [pistaRef, cantidad]);

  return activa;
}
