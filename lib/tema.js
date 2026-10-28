// Tema claro/oscuro según la hora, con opción de fijarlo (misma lógica que
// posib.dev). Todo se guarda en localStorage para que el dispositivo lo recuerde.
//
//   Modo "auto" (por defecto): claro de 7:00 a 17:59, oscuro de 18:00 a 6:59.
//   Modo "light" / "dark": siempre claro / siempre oscuro.
//   En "auto", el botón sol/luna cambia el tema solo hasta el siguiente cambio
//   automático (7 am o 6 pm); después vuelve a mandar la hora.
//
// next-themes sigue aplicando la clase "dark" en <html>: este módulo decide
// qué tema corresponde y se lo pasa (y deja su clave "theme" sincronizada).

export const TEMA_MODO_KEY = "neurai-tema-modo";
export const TEMA_MANUAL_KEY = "neurai-tema-manual";
export const TEMA_EVENTO = "neurai-tema-cambio";
// Clave que usa next-themes por defecto
export const NEXT_THEMES_KEY = "theme";

export const NOCHE_INICIO = 18; // 6 pm
export const NOCHE_FIN = 7; // 7 am

export const MODOS_TEMA = ["auto", "light", "dark"];

function esHoraDeNoche(hora) {
  return hora >= NOCHE_INICIO || hora < NOCHE_FIN;
}

// Franja actual (día o noche de una fecha). La noche que pasa la medianoche
// cuenta como la del día en que empezó.
function franja(fecha) {
  const hora = fecha.getHours();
  const ref = new Date(fecha);
  if (hora < NOCHE_FIN) ref.setDate(ref.getDate() - 1);
  return `${ref.getFullYear()}-${ref.getMonth() + 1}-${ref.getDate()}${esHoraDeNoche(hora) ? "n" : "d"}`;
}

export function obtenerModoTema() {
  try {
    const modo = localStorage.getItem(TEMA_MODO_KEY);
    if (modo === "light" || modo === "dark") return modo;
  } catch {
    // sin localStorage: automático
  }
  return "auto";
}

/** Fija el modo. Borra el cambio puntual del botón para que mande el modo. */
export function fijarModoTema(modo) {
  try {
    if (modo === "auto") localStorage.removeItem(TEMA_MODO_KEY);
    else localStorage.setItem(TEMA_MODO_KEY, modo);
    localStorage.removeItem(TEMA_MANUAL_KEY);
  } catch {
    // sin localStorage no se puede recordar
  }
  window.dispatchEvent(new Event(TEMA_EVENTO));
}

/** ¿Toca oscuro ahora? */
export function temaEsOscuro(ahora = new Date()) {
  const modo = obtenerModoTema();
  if (modo !== "auto") return modo === "dark";
  let oscuro = esHoraDeNoche(ahora.getHours());
  try {
    const guardado = JSON.parse(localStorage.getItem(TEMA_MANUAL_KEY) || "null");
    if (
      guardado &&
      guardado.franja === franja(ahora) &&
      (guardado.tema === "dark" || guardado.tema === "light")
    ) {
      oscuro = guardado.tema === "dark";
    }
  } catch {
    // valor corrupto: manda la hora
  }
  return oscuro;
}

/**
 * Botón sol/luna: con modo fijo cambia el modo fijo; en automático cambia
 * solo hasta el siguiente cambio de franja.
 */
export function cambiarTemaManual(oscuro) {
  if (obtenerModoTema() !== "auto") {
    fijarModoTema(oscuro ? "dark" : "light");
    return;
  }
  try {
    localStorage.setItem(
      TEMA_MANUAL_KEY,
      JSON.stringify({ tema: oscuro ? "dark" : "light", franja: franja(new Date()) }),
    );
  } catch {
    // sin localStorage vale hasta recargar
  }
  window.dispatchEvent(new Event(TEMA_EVENTO));
}

export function suscribirTema(alCambiar) {
  window.addEventListener(TEMA_EVENTO, alCambiar);
  window.addEventListener("storage", alCambiar);
  // Revisa cada minuto por si se cruza 7 am / 6 pm con la página abierta
  const intervalo = setInterval(alCambiar, 60_000);
  return () => {
    window.removeEventListener(TEMA_EVENTO, alCambiar);
    window.removeEventListener("storage", alCambiar);
    clearInterval(intervalo);
  };
}

// Va en <head> antes de pintar: pone la clase correcta (sin parpadeo) y deja la
// clave de next-themes igual, para que su propio script no la cambie.
// Debe mantener la misma lógica que temaEsOscuro/franja.
export const TEMA_INIT_SCRIPT = `(function(){try{
var m=localStorage.getItem("${TEMA_MODO_KEY}"),n;
if(m==="light"||m==="dark"){n=m==="dark";}else{
var d=new Date(),h=d.getHours();n=h>=${NOCHE_INICIO}||h<${NOCHE_FIN};
var x=new Date(d);if(h<${NOCHE_FIN})x.setDate(x.getDate()-1);
var f=x.getFullYear()+"-"+(x.getMonth()+1)+"-"+x.getDate()+(n?"n":"d");
var s=JSON.parse(localStorage.getItem("${TEMA_MANUAL_KEY}")||"null");
if(s&&s.franja===f&&(s.tema==="dark"||s.tema==="light"))n=s.tema==="dark";}
var t=n?"dark":"light",r=document.documentElement;
localStorage.setItem("${NEXT_THEMES_KEY}",t);
r.classList.remove("light","dark");r.classList.add(t);r.style.colorScheme=t;
}catch(e){}})();`;
