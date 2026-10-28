"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2 } from "lucide-react";
import { useClerk, useSignIn, useUser } from "@clerk/nextjs";
import { normalizarFacebookUrl } from "@/lib/facebook";

// Borrador del formulario mientras el cliente va y vuelve de Facebook
const BORRADOR = "neurai-calificar-borrador";

const TIPOS = [
  { valor: "producto", texto: "Compré un producto" },
  { valor: "formateo", texto: "Servicio técnico" },
  { valor: "web", texto: "Página web / software" },
];

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];

export default function FormularioCalificar({ nombreInicial, tipoInicial, productoInicial }) {
  const [nombre, setNombre] = useState(nombreInicial);
  const [tipo, setTipo] = useState(tipoInicial || "producto");
  const [producto, setProducto] = useState(productoInicial);
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [trampa, setTrampa] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [facebookUrl, setFacebookUrl] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [conectando, setConectando] = useState(false);

  const { isLoaded: signInListo, signIn } = useSignIn();
  const { isLoaded: userListo, isSignedIn, user } = useUser();
  const clerk = useClerk();
  // Solo se ofrece el botón si en Clerk está activo "iniciar sesión con
  // Facebook" (Dashboard de Clerk → SSO connections → Facebook).
  const facebookSocial = clerk?.__unstable__environment?.userSettings?.social?.oauth_facebook;
  const facebookDisponible = facebookSocial
    ? Boolean(facebookSocial.enabled && (facebookSocial.authenticatable || isSignedIn))
    : true;
  const cuentaFacebook = user?.externalAccounts?.find((a) =>
    /facebook/.test(a.provider || "")
  );
  const fotoFacebook = cuentaFacebook ? cuentaFacebook.imageUrl || user.imageUrl : null;

  // Al volver de Facebook se recupera lo que el cliente ya había escrito
  useEffect(() => {
    try {
      const b = JSON.parse(sessionStorage.getItem(BORRADOR) || "null");
      if (!b) return;
      sessionStorage.removeItem(BORRADOR);
      if (b.nombre) setNombre(b.nombre);
      if (b.tipo) setTipo(b.tipo);
      if (b.producto) setProducto(b.producto);
      if (b.estrellas) setEstrellas(b.estrellas);
      if (b.mensaje) setMensaje(b.mensaje);
      if (b.facebookUrl) setFacebookUrl(b.facebookUrl);
      if (b.consentimiento) setConsentimiento(true);
    } catch {}
  }, []);

  // Inicia sesión con Facebook (o la vincula si ya tiene cuenta) para tomar
  // la foto de perfil real de Facebook.
  const conectarFacebook = async () => {
    setError("");
    setConectando(true);
    try {
      sessionStorage.setItem(
        BORRADOR,
        JSON.stringify({ nombre, tipo, producto, estrellas, mensaje, facebookUrl, consentimiento })
      );
    } catch {}
    const volver = window.location.href;
    try {
      if (isSignedIn && user) {
        const cuenta = await user.createExternalAccount({
          strategy: "oauth_facebook",
          redirectUrl: volver,
        });
        const destino = cuenta?.verification?.externalVerificationRedirectURL;
        if (destino) window.location.href = destino.toString();
        else setConectando(false);
      } else {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_facebook",
          redirectUrl: "/calificar/sso-callback",
          redirectUrlComplete: volver,
        });
      }
    } catch (err) {
      console.error("[calificar] Facebook:", err);
      setError(
        "No se pudo conectar con Facebook en este momento. Puedes enviar tu calificación sin foto."
      );
      setConectando(false);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError("");
    if (!estrellas) return setError("Toca las estrellas para calificar.");
    if (!nombre.trim()) return setError("Escribe tu nombre.");
    if (!mensaje.trim()) return setError("Cuéntanos en pocas palabras cómo te fue.");
    if (facebookUrl.trim() && !normalizarFacebookUrl(facebookUrl)) {
      return setError("El enlace de Facebook no es válido. Cópialo desde tu perfil (ej.: facebook.com/tu.usuario).");
    }

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
          producto_relacionado: producto,
          facebook_url: facebookUrl,
          consentimiento_publicar: consentimiento,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Gracias, {nombre.split(" ")[0]}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Tu opinión me ayuda muchísimo a que más personas confíen en neurai.dev.
        </p>
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        {nombreInicial ? `Hola ${nombreInicial.split(" ")[0]}, ¿cómo te fue?` : "¿Cómo te fue?"}
      </h1>
      <p className="text-gray-600 dark:text-gray-300 text-center mt-2 mb-6">
        Califica tu experiencia con neurai.dev. Tu comentario se publicará en el
        sitio con tu nombre.
      </p>

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

      <label htmlFor="producto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Producto o servicio (opcional)
      </label>
      <input
        id="producto"
        value={producto}
        onChange={(e) => setProducto(e.target.value)}
        maxLength={120}
        placeholder="Ej.: Audífonos Bluetooth, formateo de portátil…"
        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      />

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

      {/* Foto de perfil de Facebook + enlace para que otros le escriban */}
      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="font-semibold text-gray-900 dark:text-white">
          {facebookDisponible ? "Muestra tu foto de Facebook (opcional)" : "Tu Facebook (opcional)"}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
          Así otras personas saben que eres un cliente real y pueden escribirte
          para preguntarte por el servicio.
        </p>

        {fotoFacebook ? (
          <div className="flex items-center gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoFacebook}
              alt="Tu foto de Facebook"
              className="w-14 h-14 rounded-full object-cover border-2 border-blue-600"
            />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Se usará tu foto de perfil de Facebook.
            </p>
          </div>
        ) : !facebookDisponible ? null : (
          <button
            type="button"
            onClick={conectarFacebook}
            disabled={conectando || !signInListo || !userListo}
            className="w-full mb-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {conectando ? "Abriendo Facebook…" : "Conectar con Facebook para usar mi foto"}
          </button>
        )}

        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Enlace a tu perfil de Facebook
        </label>
        <input
          id="facebook"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
          inputMode="url"
          placeholder="facebook.com/tu.usuario"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          En la app de Facebook: tu perfil → ⋯ → Copiar enlace del perfil.
        </p>

        <label className="flex items-start gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            className="mt-1 w-4 h-4"
            // El CSS global quita la apariencia de los checkbox: se restaura aquí
            style={{ appearance: "auto", WebkitAppearance: "checkbox", accentColor: "#2563eb" }}
          />
          Acepto que mi foto y mi perfil de Facebook se muestren en neurai.dev
          junto a mi calificación.
        </label>
        {(fotoFacebook || facebookUrl.trim()) && !consentimiento && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sin esta casilla tu calificación se publica sin foto ni Facebook.
          </p>
        )}
      </div>

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
    </form>
  );
}
