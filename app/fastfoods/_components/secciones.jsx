import Link from "next/link";
import { Bike, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { BotonAgregar } from "./Carrito";
import {
  DIAS,
  enlaceWhatsapp,
  estaAbierto,
  formatoPrecio,
  horaLegible,
} from "@/lib/fastfoods/utils";

/**
 * Secciones compartidas por las plantillas de /fastfoods. Una plantilla nueva
 * (nivel 2) puede reutilizarlas o dibujar las suyas con las mismas props.
 */

function enlaceRed(red, valor) {
  if (!valor) return null;
  if (valor.startsWith("http")) return valor;
  const usuario = valor.replace("@", "");
  return {
    instagram: `https://instagram.com/${usuario}`,
    facebook: `https://facebook.com/${usuario}`,
    tiktok: `https://tiktok.com/@${usuario}`,
  }[red];
}

export function Encabezado({ negocio }) {
  const abierto = estaAbierto(negocio.horario);
  const whatsapp = enlaceWhatsapp(negocio.whatsapp, `¡Hola ${negocio.nombre}! Vi su página en neurai.dev`);
  const redes = [
    ["instagram", "Instagram"],
    ["facebook", "Facebook"],
    ["tiktok", "TikTok"],
  ]
    .map(([red, nombre]) => [enlaceRed(red, negocio[red]), nombre])
    .filter(([href]) => href);

  return (
    <header>
      <div className="relative h-44 sm:h-64 bg-[var(--ff-primario)] overflow-hidden">
        {negocio.portada_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={negocio.portada_url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="max-w-3xl mx-auto px-4">
        <div className="relative -mt-12 sm:-mt-14 flex items-end gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-[var(--ff-fondo)] bg-[var(--ff-tarjeta)] flex items-center justify-center flex-shrink-0 shadow-lg">
            {negocio.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
            ) : (
              <UtensilsCrossed className="w-10 h-10 text-[var(--ff-primario)]" />
            )}
          </div>
          {abierto !== null && (
            <span
              className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                abierto ? "bg-green-600 text-white" : "bg-stone-600 text-white"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${abierto ? "bg-green-200" : "bg-stone-300"}`} />
              {abierto ? "Abierto ahora" : "Cerrado"}
            </span>
          )}
        </div>

        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">
          {negocio.nombre}
        </h1>
        {negocio.descripcion && (
          <p className="mt-1 text-[var(--ff-texto-suave)] text-pretty">{negocio.descripcion}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-[#25D366] text-white px-4 py-2 text-sm font-semibold"
            >
              WhatsApp
            </a>
          )}
          {redes.map(([href, nombre]) => (
            <a
              key={nombre}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] px-4 py-2 text-sm font-medium"
            >
              {nombre}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

export function SeccionEspecial({ especiales }) {
  if (especiales.length === 0) return null;
  return (
    <section className="max-w-3xl mx-auto px-4 pt-8">
      <div className="space-y-4">
        {especiales.map((e) => (
          <article
            key={e.id}
            className="rounded-3xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] shadow-sm"
          >
            {e.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.foto_url} alt={e.titulo} className="w-full aspect-[4/3] sm:aspect-[16/9] object-cover" />
            )}
            <div className="p-4 sm:p-5">
              <span className="inline-block rounded-full bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                Especial de hoy
              </span>
              <div className="mt-2 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-tight text-balance">{e.titulo}</h2>
                  {e.descripcion && (
                    <p className="mt-1 text-[var(--ff-texto-suave)] text-pretty">{e.descripcion}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {e.precio ? <span className="text-xl font-extrabold">{formatoPrecio(e.precio)}</span> : null}
                    <span className="text-sm text-[var(--ff-texto-suave)] inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 fill-none" /> Hasta las {horaLegible(e.expira_en)}
                    </span>
                  </div>
                </div>
                {e.precio ? <BotonAgregar id={e.id} nombre={e.titulo} /> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SeccionMenu({ menu }) {
  if (menu.length === 0) return null;

  // Agrupa por categoría conservando el orden en que vienen los platos.
  const categorias = [];
  const porCategoria = {};
  for (const item of menu) {
    const cat = item.categoria || "Menú";
    if (!porCategoria[cat]) {
      porCategoria[cat] = [];
      categorias.push(cat);
    }
    porCategoria[cat].push(item);
  }

  return (
    <section id="menu" className="max-w-3xl mx-auto px-4 pt-10">
      <h2 className="text-2xl font-bold mb-4">Menú</h2>
      <div className="space-y-7">
        {categorias.map((cat) => (
          <div key={cat}>
            {categorias.length > 1 && (
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--ff-texto-suave)] mb-2">
                {cat}
              </h3>
            )}
            <ul className="divide-y divide-[var(--ff-borde)] rounded-2xl bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] overflow-hidden">
              {porCategoria[cat].map((item) => (
                <li key={item.id} className="flex gap-3 p-3 sm:p-4 items-center">
                  {item.foto_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.foto_url}
                      alt=""
                      loading="lazy"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold leading-tight">{item.nombre}</p>
                    {item.descripcion && (
                      <p className="text-sm text-[var(--ff-texto-suave)] mt-0.5 line-clamp-2">
                        {item.descripcion}
                      </p>
                    )}
                    <p className="font-bold mt-1">{formatoPrecio(item.precio)}</p>
                  </div>
                  <BotonAgregar id={item.id} nombre={item.nombre} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SeccionInfo({ negocio }) {
  const horario = negocio.horario || {};
  const tieneHorario = DIAS.some((d) => horario[d.key]);
  const ubicacion = [negocio.direccion, negocio.ciudad].filter(Boolean).join(", ");
  if (!tieneHorario && !ubicacion && !negocio.domicilio) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 pt-10">
      <h2 className="text-2xl font-bold mb-4">Ubicación y horario</h2>
      <div className="rounded-2xl bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] p-4 sm:p-5 space-y-4">
        {ubicacion && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ubicacion)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 font-medium underline-offset-4 hover:underline"
          >
            <MapPin className="w-5 h-5 flex-shrink-0 text-[var(--ff-primario)]" />
            {ubicacion}
          </a>
        )}
        {negocio.domicilio && (
          <p className="flex items-center gap-2 font-medium">
            <Bike className="w-5 h-5 text-[var(--ff-primario)]" /> Hacemos domicilios
          </p>
        )}
        {tieneHorario && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
            {DIAS.map((d) => (
              <div key={d.key} className="contents">
                <dt className="text-[var(--ff-texto-suave)]">{d.nombre}</dt>
                <dd className="tabular-nums">
                  {horario[d.key] ? `${horario[d.key].abre} – ${horario[d.key].cierra}` : "Cerrado"}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

/** Productos de neurai.dev sobre el footer (solo plan gratis). */
export function SeccionNeurai({ negocio, productos }) {
  if (negocio.plan !== "gratis" || productos.length === 0) return null;
  const utm = `utm_source=fastfoods&utm_medium=pagina&utm_campaign=${encodeURIComponent(negocio.slug)}`;

  return (
    <section className="max-w-3xl mx-auto px-4 pt-14">
      <div className="rounded-2xl border border-[var(--ff-borde)] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ff-texto-suave)]">
          Mientras esperas tu pedido
        </p>
        <h2 className="text-lg font-bold mt-0.5">Accesorios en neurai.dev</h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {productos.map((p) => (
            <Link
              key={p.id}
              href={`${p.href}?${utm}`}
              className="group rounded-xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)]"
            >
              <div className="aspect-square bg-white overflow-hidden">
                {p.imagen && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagen}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs leading-snug line-clamp-2">{p.nombre}</p>
                <p className="text-sm font-bold mt-0.5">{formatoPrecio(p.precio)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PiePagina() {
  return (
    <footer className="max-w-3xl mx-auto px-4 py-10 text-center text-sm text-[var(--ff-texto-suave)]">
      Página creada con{" "}
      <Link href="/" className="font-semibold text-[var(--ff-texto)] hover:underline">
        neurai.dev
      </Link>
      <br />
      <Link href="/fastfoods" className="inline-block mt-1 underline underline-offset-4 hover:text-[var(--ff-texto)]">
        ¿Tienes un negocio de comidas? Crea su página gratis
      </Link>
    </footer>
  );
}

export function SinContenido() {
  return (
    <section className="max-w-3xl mx-auto px-4 pt-12 text-center text-[var(--ff-texto-suave)]">
      <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p>Muy pronto publicaremos nuestro menú.</p>
    </section>
  );
}
