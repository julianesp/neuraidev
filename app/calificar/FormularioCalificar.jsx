"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, Search, X, Pause, Play } from "lucide-react";
import { useClerk, useReverification, useSignIn, useUser } from "@clerk/nextjs";

// Borrador del formulario mientras el cliente va y vuelve de Facebook/Google
const BORRADOR = "neurai-calificar-borrador";

const TIPOS = [
  { valor: "producto", texto: "Compré un producto" },
  { valor: "formateo", texto: "Servicio técnico" },
  { valor: "web", texto: "Página web / software" },
];

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];
const MAX_PRODUCTOS = 6;

function IconoFacebook({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function IconoGoogle({ className }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.57-5.17 3.57-8.65Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3a7.2 7.2 0 0 1-10.73-3.78H1.33v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.34 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.33a12 12 0 0 0 0 10.84l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A12 12 0 0 0 1.33 6.58l4.01 3.1A7.17 7.17 0 0 1 12 4.77Z" />
    </svg>
  );
}

/**
 * Formulario para calificar (en /calificar y en la home). El cliente entra con
 * Facebook o Google con un toque: su foto de perfil y su nombre se toman de la
 * cuenta y la foto se muestra junto al comentario cuando el admin lo aprueba.
 * Entrar es obligatorio, igual que decir qué compró (productos del catálogo,
 * que se muestran girando alrededor de su foto) o qué servicio pidió. Al
 * aprobarse la calificación se activa el 15% (compras y cualquier servicio).
 */
export default function FormularioCalificar({
  nombreInicial = "",
  tipoInicial = "",
  productoInicial = "",
  // En la home el formulario va dentro de una sección: título como <h2>
  embebido = false,
}) {
  const Titulo = embebido ? "h2" : "h1";
  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState(tipoInicial || "producto");
  const [producto, setProducto] = useState(productoInicial);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [catalogo, setCatalogo] = useState([]);
  const [cintaPausada, setCintaPausada] = useState(false); // botón (celular)
  const [mouseEncima, setMouseEncima] = useState(false); // hover (computador)
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [trampa, setTrampa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [conectando, setConectando] = useState(false);

  const { isLoaded: signInListo, signIn } = useSignIn();
  const { isLoaded: userListo, isSignedIn, user } = useUser();
  const clerk = useClerk();
  // Vincular Facebook a una cuenta ya iniciada es una acción sensible: Clerk
  // pide verificar de nuevo la identidad (abre su propio modal) antes de seguir.
  const vincularCuentaExterna = useReverification((params) =>
    user.createExternalAccount(params)
  );

  // Solo se ofrece Facebook si en Clerk está activo para iniciar sesión
  const facebookSocial = clerk?.__unstable__environment?.userSettings?.social?.oauth_facebook;
  const facebookDisponible = facebookSocial
    ? Boolean(facebookSocial.enabled && (facebookSocial.authenticatable || isSignedIn))
    : true;

  const cuentaFacebook = user?.externalAccounts?.find((a) =>
    /facebook/.test(a.provider || "")
  );
  // Foto que se publicará: la de Facebook si la conectó; si no, la de su cuenta
  const foto = cuentaFacebook
    ? cuentaFacebook.imageUrl || user.imageUrl
    : user?.hasImage
      ? user.imageUrl
      : null;

  // Al volver de Facebook/Google se recupera lo que ya había escrito
  useEffect(() => {
    try {
      const b = JSON.parse(sessionStorage.getItem(BORRADOR) || "null");
      if (!b) return;
      sessionStorage.removeItem(BORRADOR);
      if (b.nombre) setNombre(b.nombre);
      if (b.tipo) setTipo(b.tipo);
      if (b.producto) setProducto(b.producto);
      if (Array.isArray(b.productos)) setProductos(b.productos);
      if (b.estrellas) setEstrellas(b.estrellas);
      if (b.mensaje) setMensaje(b.mensaje);
    } catch {}
  }, []);

  // Al volver de iniciar sesión (redirección) la página carga arriba: la
  // sección de la home aparece después de cargar, así que el navegador no
  // alcanza a bajar a #calificar. Se baja aquí, ya con el formulario visible.
  useEffect(() => {
    if (!embebido || window.location.hash !== "#calificar") return;
    const t = setTimeout(() => {
      document.getElementById("calificar")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
    return () => clearTimeout(t);
  }, [embebido]);

  // Con sesión iniciada, el nombre se completa con el de su cuenta
  useEffect(() => {
    if (user?.fullName) setNombre((actual) => actual || user.fullName);
  }, [user?.fullName]);

  // Buscador del catálogo (incluye agotados: lo que compró puede ya no estar)
  useEffect(() => {
    const q = busqueda.trim();
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    const control = new AbortController();
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const res = await fetch(
          `/api/productos/buscar?calificar=1&q=${encodeURIComponent(q)}`,
          { signal: control.signal }
        );
        const data = await res.json();
        setResultados(data.productos || []);
      } catch {
        // búsqueda cancelada o sin conexión: se deja la lista como estaba
      } finally {
        setBuscando(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      control.abort();
    };
  }, [busqueda]);

  // Todo el catálogo para la cinta de productos (se carga una sola vez)
  const mostrarCinta = userListo && isSignedIn && tipo === "producto";
  useEffect(() => {
    if (!mostrarCinta || catalogo.length) return;
    fetch("/api/productos/buscar?calificar=1&todos=1")
      .then((r) => r.json())
      .then((d) => setCatalogo(d.productos || []))
      .catch(() => {});
  }, [mostrarCinta, catalogo.length]);

  const elegido = (id) => productos.some((p) => p.id === id);
  const alternarProducto = (p) => {
    setError("");
    if (elegido(p.id)) {
      setProductos((lista) => lista.filter((x) => x.id !== p.id));
      return;
    }
    if (productos.length >= MAX_PRODUCTOS) {
      setError(`Puedes elegir hasta ${MAX_PRODUCTOS} productos.`);
      return;
    }
    setProductos((lista) => [...lista, { id: p.id, nombre: p.nombre, imagen: p.imagen }]);
    setBusqueda("");
    setResultados([]);
  };

  const guardarBorrador = () => {
    try {
      sessionStorage.setItem(
        BORRADOR,
        JSON.stringify({ nombre, tipo, producto, productos, estrellas, mensaje })
      );
    } catch {}
  };

  // Vuelve al formulario (en la home, a su sección)
  const urlDeVuelta = () => {
    const u = new URL(window.location.href);
    u.hash = "calificar";
    return u.toString();
  };

  // Entrar con Facebook o Google en una ventana emergente: la página no se
  // recarga y el formulario sigue tal cual. Si el navegador bloquea la
  // ventana, se usa la redirección (vuelve a #calificar con el borrador).
  const iniciarSesion = async (strategy) => {
    setError("");
    setConectando(true);
    guardarBorrador();
    const params = {
      strategy,
      redirectUrl: "/calificar/sso-callback",
      redirectUrlComplete: urlDeVuelta(),
    };
    // La ventana se abre aquí mismo (en el clic) para que no la bloqueen
    const ancho = 500;
    const alto = 650;
    const conVentana = typeof signIn.authenticateWithPopup === "function";
    const popup = conVentana
      ? window.open(
          "",
          "neurai-login",
          `width=${ancho},height=${alto},left=${Math.max(0, (window.screen.width - ancho) / 2)},top=${Math.max(0, (window.screen.height - alto) / 2)}`
        )
      : null;
    // Si la cierra sin terminar, se reactivan los botones
    const vigilar = popup
      ? setInterval(() => {
          if (popup.closed) {
            clearInterval(vigilar);
            setConectando(false);
          }
        }, 800)
      : null;
    try {
      if (popup) {
        await signIn.authenticateWithPopup({ ...params, popup });
        try {
          sessionStorage.removeItem(BORRADOR);
        } catch {}
        setConectando(false);
      } else {
        await signIn.authenticateWithRedirect(params);
      }
    } catch (err) {
      console.error("[calificar] login:", err);
      popup?.close();
      setError("No se pudo iniciar sesión en este momento. Intenta de nuevo.");
      setConectando(false);
    } finally {
      if (vigilar) clearInterval(vigilar);
    }
  };

  // Ya tiene sesión (p. ej. con Google) y quiere usar su foto de Facebook
  const vincularFacebook = async () => {
    setError("");
    setConectando(true);
    guardarBorrador();
    try {
      const cuenta = await vincularCuentaExterna({
        strategy: "oauth_facebook",
        redirectUrl: urlDeVuelta(),
      });
      const destino = cuenta?.verification?.externalVerificationRedirectURL;
      if (destino) window.location.href = destino.toString();
      else setConectando(false);
    } catch (err) {
      console.error("[calificar] vincular Facebook:", err);
      setError("No se pudo conectar con Facebook en este momento.");
      setConectando(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!estrellas) return setError("Toca las estrellas para calificar.");
    if (!isSignedIn) return setError("Entra con Facebook o Google para calificar.");
    if (tipo === "producto" && productos.length === 0)
      return setError("Elige el producto o los productos que compraste.");
    if (tipo !== "producto" && !producto.trim())
      return setError("Escribe qué servicio te hicimos.");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!mensaje.trim()) return setError("Cuéntanos en pocas palabras cómo te fue.");

    setEnviando(true);
    try {
      const res = await fetch("/api/testimonios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nombre: nombre,
          mensaje,
          calificacion: estrellas,
          tipo,
          producto_relacionado: tipo === "producto" ? "" : producto,
          productos: tipo === "producto" ? productos.map((p) => p.id) : [],
          website: trampa,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo enviar");
      setEnviado(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-blue-600 mx-auto mb-4" />
        <Titulo className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Gracias, {nombre.split(" ")[0]}!
        </Titulo>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tu opinión me ayuda muchísimo a que más personas confíen en neurai.dev.
        </p>
        {(
          <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 rounded-lg px-4 py-3 mb-6">
            🎁 Cuando revise y apruebe tu comentario, tu cuenta tendrá un{" "}
            <strong>15% de descuento</strong> para una compra en la tienda. Se
            aplica solo en el carrito, iniciando sesión con esta misma cuenta.
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const activa = hover || estrellas;

  return (
    <form
      onSubmit={enviar}
      className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sm:p-8"
    >
      <Titulo className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        {nombreInicial
          ? `Hola ${nombreInicial.split(" ")[0]}, ¿cómo te fue?`
          : embebido
            ? "Califica tu experiencia"
            : "¿Cómo te fue?"}
      </Titulo>
      <p className="text-gray-600 dark:text-gray-300 text-center mt-2 mb-5">
        Tu comentario se publicará en neurai.dev cuando lo revise.
      </p>

      {/* Cuenta: entrar con Facebook o Google (foto y nombre automáticos) */}
      <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        {userListo && isSignedIn ? (
          <div className="flex items-center gap-3">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt="Tu foto de perfil"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-600 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
                {(user?.fullName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {foto
                  ? "Tu foto aparecerá junto a tu comentario."
                  : "Tu comentario se publicará con tu nombre."}
              </p>
              {!cuentaFacebook && facebookDisponible && (
                <button
                  type="button"
                  onClick={vincularFacebook}
                  disabled={conectando}
                  className="mt-1 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-60"
                >
                  Usar mi foto de Facebook
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 text-center">
              Para calificar, entra con un toque. Tu foto y tu nombre aparecerán
              junto a tu comentario.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {facebookDisponible && (
                <button
                  type="button"
                  onClick={() => iniciarSesion("oauth_facebook")}
                  disabled={conectando || !signInListo}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
                >
                  <IconoFacebook className="w-5 h-5" />
                  Continuar con Facebook
                </button>
              )}
              <button
                type="button"
                onClick={() => iniciarSesion("oauth_google")}
                disabled={conectando || !signInListo}
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
              >
                <IconoGoogle className="w-5 h-5" />
                Continuar con Google
              </button>
            </div>
          </>
        )}
      </div>

      {!(userListo && isSignedIn) ? (
        error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>
      ) : (
      <>
      {/* Estrellas */}
      <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setEstrellas(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            className="p-1"
          >
            <Star
              className={`w-10 h-10 transition-colors ${n <= activa ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
              fill={n <= activa ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 h-5 mt-1 mb-6">
        {ETIQUETAS[activa]}
      </p>

      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        ¿Qué fue?
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTipo(t.valor)}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors ${
              tipo === t.valor
                ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold"
                : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            }`}
          >
            {t.texto}
          </button>
        ))}
      </div>

      {/* 15% para quien compró o pidió un servicio (se activa al aprobar) */}
      <div className="mb-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
        <p className="font-semibold text-blue-700 dark:text-blue-300">
          🎁 15% de descuento en tu próxima compra
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
          Cuando revise y apruebe tu comentario, tu cuenta tendrá 15% de
          descuento en una compra de la tienda, aplicado solo en el carrito.
        </p>
      </div>

      {tipo === "producto" ? (
        <div className="mb-4">
          <label htmlFor="buscar-producto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ¿Qué compraste? <span className="text-blue-600">*</span>
          </label>

          {productos.length > 0 && (
            <ul className="flex flex-wrap gap-3 mb-3">
              {productos.map((p) => (
                <li key={p.id} className="relative w-16 text-center">
                  {p.imagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      className="w-14 h-14 mx-auto rounded-full object-cover border-2 border-blue-600 bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 mx-auto rounded-full border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/40" />
                  )}
                  <p className="text-[11px] leading-tight text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {p.nombre}
                  </p>
                  <button
                    type="button"
                    onClick={() => alternarProducto(p)}
                    aria-label={`Quitar ${p.nombre}`}
                    className="absolute -top-1 right-0 w-5 h-5 rounded-full bg-gray-900/80 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {productos.length < MAX_PRODUCTOS && (
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="buscar-producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                maxLength={60}
                autoComplete="off"
                placeholder={productos.length ? "Agregar otro producto…" : "Busca el producto: audífonos, cargador…"}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {busqueda.trim().length >= 2 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  {buscando && resultados.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500">Buscando…</li>
                  )}
                  {!buscando && resultados.length === 0 && (
                    <li className="px-4 py-3 text-sm text-gray-500">
                      No encontré ese producto. Prueba con otra palabra.
                    </li>
                  )}
                  {resultados.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => alternarProducto(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      >
                        {p.imagen ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imagen} alt="" className="w-10 h-10 rounded-full object-cover bg-white shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0" />
                        )}
                        <span className="text-sm text-gray-800 dark:text-gray-100 flex-1">{p.nombre}</span>
                        {elegido(p.id) && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Búscalo arriba o tócalo en la lista de abajo. Puedes elegir varios: sus
            fotos aparecerán alrededor de la tuya.
          </p>

          {/* Cinta con todo el catálogo: se detiene con el mouse encima o con
              el botón de pausa (celular); al tocar un producto queda elegido */}
          {catalogo.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Todos los productos
                </span>
                <button
                  type="button"
                  onClick={() => setCintaPausada((v) => !v)}
                  aria-pressed={cintaPausada}
                  className="[@media(hover:hover)]:hidden inline-flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 active:bg-blue-700 px-3 py-1.5 rounded-full"
                >
                  {cintaPausada ? (
                    <>
                      <Play className="w-3.5 h-3.5" /> Seguir
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pausa
                    </>
                  )}
                </button>
              </div>
              <div
                className="overflow-hidden motion-reduce:overflow-x-auto rounded-xl bg-gray-50 dark:bg-gray-900/40 py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
                onPointerEnter={(e) => e.pointerType === "mouse" && setMouseEncima(true)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setMouseEncima(false)}
              >
                <ul
                  className="flex w-max animate-[cinta_var(--duracion)_linear_infinite] motion-reduce:animate-none"
                  style={{
                    "--duracion": `${Math.max(catalogo.length * 2.5, 20)}s`,
                    animationPlayState: cintaPausada || mouseEncima ? "paused" : "running",
                  }}
                >
                  {/* La lista va dos veces para que la vuelta sea continua */}
                  {[...catalogo, ...catalogo].map((p, i) => {
                    const marcado = elegido(p.id);
                    const copia = i >= catalogo.length;
                    return (
                      <li key={`${p.id}-${i}`} className="w-20 shrink-0 px-1" aria-hidden={copia || undefined}>
                        <button
                          type="button"
                          onClick={() => alternarProducto(p)}
                          tabIndex={copia ? -1 : undefined}
                          aria-pressed={marcado}
                          title={p.nombre}
                          className="w-full flex flex-col items-center"
                        >
                          <span className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              loading="lazy"
                              className={`w-14 h-14 rounded-full object-cover bg-white border-2 transition-transform ${
                                marcado
                                  ? "border-blue-600 ring-2 ring-blue-600/40 scale-105"
                                  : "border-white dark:border-gray-700"
                              }`}
                            />
                            {marcado && (
                              <CheckCircle2 className="absolute -top-1 -right-1 w-5 h-5 text-white bg-blue-600 rounded-full" />
                            )}
                          </span>
                          <span
                            className={`text-[11px] leading-tight mt-1 line-clamp-2 ${
                              marcado ? "text-blue-700 dark:text-blue-300 font-semibold" : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {p.nombre}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <label htmlFor="producto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ¿Qué servicio te hicimos? <span className="text-blue-600">*</span>
          </label>
          <input
            id="producto"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            maxLength={120}
            placeholder={tipo === "web" ? "Ej.: página web para mi negocio…" : "Ej.: formateo de portátil, cambio de pantalla…"}
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </>
      )}

      <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tu nombre
      </label>
      <input
        id="nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={80}
        autoComplete="name"
        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />

      <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tu comentario
      </label>
      <textarea
        id="mensaje"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        maxLength={1000}
        rows={4}
        placeholder="¿Qué te gustó? ¿Lo recomendarías?"
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
      />

      {/* Campo trampa para bots: invisible para personas */}
      <input
        type="text"
        name="website"
        value={trampa}
        onChange={(e) => setTrampa(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <button
        type="submit"
        disabled={enviando}
        className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar calificación"}
      </button>
      </>
      )}
    </form>
  );
}
