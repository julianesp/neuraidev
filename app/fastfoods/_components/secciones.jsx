import Link from "next/link";
import { Bike, Clock, ImagePlus, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { BotonAgregar } from "./Carrito";
import {
  ANCHO,
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

// Atajo del dueño a la pestaña donde se suben portada y logo.
const EDITAR_FOTOS = "/mi-negocio?pestana=datos";

export function Encabezado({ negocio, esDueno = false }) {
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
      <div className="relative h-44 sm:h-64 lg:h-80 bg-[var(--ff-primario)] overflow-hidden">
        {negocio.portada_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={negocio.portada_url} alt="" className="w-full h-full object-cover" />
        )}
        {esDueno && !negocio.portada_url && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Link
              href={EDITAR_FOTOS}
              className="inline-flex items-center gap-2 rounded-full bg-black/40 hover:bg-black/55 backdrop-blur-sm text-white font-semibold px-5 py-2.5 transition-colors"
            >
              <ImagePlus className="w-5 h-5 fill-none" /> Agregar foto de portada
            </Link>
          </div>
        )}
      </div>
      <div className={ANCHO}>
        <div className="relative -mt-12 sm:-mt-14 flex items-end gap-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-[var(--ff-fondo)] bg-[var(--ff-tarjeta)] flex items-center justify-center flex-shrink-0 shadow-lg">
            {negocio.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={negocio.logo_url} alt={negocio.nombre} className="w-full h-full object-cover" />
            ) : esDueno ? (
              <Link
                href={EDITAR_FOTOS}
                className="w-full h-full flex flex-col items-center justify-center gap-1 text-[var(--ff-primario)] text-xs font-semibold text-center"
              >
                <ImagePlus className="w-7 h-7 fill-none" />
                Agregar logo
              </Link>
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

        <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance">
          {negocio.nombre}
        </h1>
        {negocio.descripcion && (
          <p className="mt-1 max-w-3xl text-[var(--ff-texto-suave)] text-pretty">{negocio.descripcion}</p>
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
    <section className={`${ANCHO} pt-8`}>
      <div className="space-y-4">
        {especiales.map((e) => (
          <article
            key={e.id}
            className={`rounded-3xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] shadow-sm ${
              e.foto_url ? "lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""
            }`}
          >
            {e.foto_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.foto_url}
                alt={e.titulo}
                className="w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-[26rem] object-cover"
              />
            )}
            <div className="p-4 sm:p-5 lg:p-8 lg:flex lg:flex-col lg:justify-center">
              <span className="self-start inline-block rounded-full bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                Especial de hoy
              </span>
              <div className="mt-2 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl lg:text-4xl font-bold leading-tight text-balance">{e.titulo}</h2>
                  {e.descripcion && (
                    <p className="mt-1 lg:mt-2 lg:text-lg text-[var(--ff-texto-suave)] text-pretty">{e.descripcion}</p>
                  )}
                  <div className="mt-2 lg:mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {e.precio ? (
                      <span className="text-xl lg:text-3xl font-extrabold">{formatoPrecio(e.precio)}</span>
                    ) : null}
                    <span className="text-sm text-[var(--ff-texto-suave)] inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 fill-none" /> Hasta las {horaLegible(e.expira_en)}
                    </span>
                    <Porciones especial={e} />
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

/**
 * Un plato en la cuadrícula. Los destacados (el dueño los marca con la
 * estrella) ocupan 2×2 celdas y se ven más grandes.
 */
function TarjetaPlato({ item }) {
  const destacado = !!item.destacado;
  return (
    <li
      className={`group flex flex-col rounded-2xl overflow-hidden bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] ${
        destacado ? "col-span-2 row-span-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${destacado ? "flex-1 min-h-[16rem]" : "aspect-square"}`}>
        {item.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.foto_url}
            alt={item.nombre}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--ff-borde)]">
            <UtensilsCrossed
              className={`${destacado ? "w-16 h-16" : "w-9 h-9"} text-[var(--ff-primario)] opacity-60 fill-none`}
            />
          </div>
        )}
        {destacado && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[var(--ff-primario)] text-[var(--ff-sobre-primario)] px-3 py-1 text-xs font-bold uppercase tracking-wide shadow">
            <Star className="w-3.5 h-3.5" /> Recomendado
          </span>
        )}
      </div>
      <div className={`flex items-end gap-2 ${destacado ? "p-4 sm:p-5" : "p-3"}`}>
        <div className="flex-1 min-w-0">
          <p
            className={`leading-tight ${
              destacado ? "text-lg sm:text-2xl font-bold" : "text-sm sm:text-base font-semibold"
            }`}
          >
            {item.nombre}
          </p>
          {item.descripcion && (
            <p
              className={`text-[var(--ff-texto-suave)] mt-0.5 ${
                destacado ? "text-sm sm:text-base line-clamp-3" : "text-xs sm:text-sm line-clamp-2"
              }`}
            >
              {item.descripcion}
            </p>
          )}
          <p className={`font-bold mt-1 ${destacado ? "text-lg sm:text-xl" : ""}`}>{formatoPrecio(item.precio)}</p>
        </div>
        <BotonAgregar id={item.id} nombre={item.nombre} />
      </div>
    </li>
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
    <section id="menu" className={`${ANCHO} pt-10`}>
      <h2 className="text-2xl lg:text-3xl font-bold mb-4">Menú</h2>
      <div className="space-y-8">
        {categorias.map((cat) => (
          <div key={cat}>
            {categorias.length > 1 && (
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--ff-texto-suave)] mb-3">
                {cat}
              </h3>
            )}
            {/* grid-flow-dense: los platos pequeños rellenan los huecos junto a los destacados */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 grid-flow-dense gap-3 sm:gap-4">
              {porCategoria[cat].map((item) => (
                <TarjetaPlato key={item.id} item={item} />
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
    <section className={`${ANCHO} pt-10`}>
      <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ubicación y horario</h2>
      <div className="rounded-2xl bg-[var(--ff-tarjeta)] border border-[var(--ff-borde)] p-4 sm:p-6 grid gap-4 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
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
        </div>
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

/**
 * Productos de neurai.dev: una fila discreta pegada al pie de página
 * (solo plan gratis). Va siempre al final para no competir con la comida.
 */
export function SeccionNeurai({ negocio, productos }) {
  if (negocio.plan !== "gratis" || productos.length === 0) return null;
  const utm = `utm_source=fastfoods&utm_medium=pagina&utm_campaign=${encodeURIComponent(negocio.slug)}`;

  return (
    <section className={`${ANCHO} pt-12`} aria-label="Accesorios en neurai.dev">
      <p className="text-xs text-[var(--ff-texto-suave)] mb-2">Accesorios en neurai.dev</p>
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {productos.map((p) => (
          <Link
            key={p.id}
            href={`${p.href}?${utm}`}
            className="snap-start flex-shrink-0 w-52 sm:w-auto sm:flex-1 sm:min-w-0 flex items-center gap-2 rounded-xl border border-[var(--ff-borde)] bg-[var(--ff-tarjeta)] p-1.5 pr-3 opacity-90 hover:opacity-100 transition-opacity"
          >
            <span className="w-10 h-10 flex-shrink-0 rounded-lg bg-white overflow-hidden">
              {p.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagen} alt="" loading="lazy" className="w-full h-full object-contain" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-xs truncate">{p.nombre}</span>
              <span className="block text-xs font-semibold">{formatoPrecio(p.precio)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PiePagina() {
  return (
    <footer className={`${ANCHO} pt-5 pb-10 text-center text-sm text-[var(--ff-texto-suave)]`}>
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

/** "Quedan 5" / "Últimas 2" / "Agotado" según las porciones del especial. */
export function Porciones({ especial }) {
  if (especial.porciones == null) return null;
  const quedan = Math.max(0, especial.porciones - (especial.vendidas || 0));
  if (quedan === 0) {
    return <span className="text-sm font-bold text-red-600">Agotado</span>;
  }
  return (
    <span className={`text-sm font-semibold ${quedan <= 3 ? "text-red-600" : "text-[var(--ff-primario)]"}`}>
      {quedan <= 3 ? `¡Últimas ${quedan}!` : `Quedan ${quedan}`}
    </span>
  );
}

/** Aviso de la tarjeta de sellos (si el dueño la activó). */
export function AvisoSellos({ negocio }) {
  if (!negocio.sellos_activo) return null;
  return (
    <div className={`${ANCHO} pt-4`}>
      <p className="rounded-2xl border border-dashed border-[var(--ff-primario)] px-4 py-3 text-sm">
        <strong>Tarjeta de sellos:</strong> cada {negocio.sellos_meta} pedidos entregados,{" "}
        {negocio.sellos_premio}. Se cuentan con tu número de celular.
      </p>
    </div>
  );
}

export function SinContenido() {
  return (
    <section className={`${ANCHO} pt-12 text-center text-[var(--ff-texto-suave)]`}>
      <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p>Muy pronto publicaremos nuestro menú.</p>
    </section>
  );
}
