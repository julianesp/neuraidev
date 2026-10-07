"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  DIAS,
  ESTADOS,
  PLANES,
  PLANTILLAS,
  SECCIONES,
  formatoPrecio,
  horaLegible,
  slugify,
} from "@/lib/fastfoods/utils";
import { PestanaClientes, PestanaPedidos, usePedidos } from "./Pedidos";

// Sube una foto a la carpeta del negocio en R2. Devuelve { url, path }.
async function subirFoto(file, negocioId) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("negocio", negocioId);
  const res = await fetch("/api/fastfoods/imagen", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.path) throw new Error(data.error || "No se pudo subir la foto");
  return data;
}

// Cliente de la API según el modo: el admin usa /api/admin/fastfoods y el
// dueño /api/mi-negocio (mismo formato de acciones). Lanza el error del servidor.
function crearApi(modo) {
  const base = modo === "admin" ? "/api/admin/fastfoods" : "/api/mi-negocio";
  return async function api(method, { body, query } = {}) {
    const res = await fetch(`${base}${query ? `?${query}` : ""}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Error en la solicitud");
    return data;
  };
}

const input =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm";
const label = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
const tarjeta = "bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5";
const botonPrimario =
  "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60";
const botonSecundario =
  "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60";


const PESTANAS = [
  ["pedidos", "Pedidos"],
  ["especial", "Especial de hoy"],
  ["menu", "Menú"],
  ["clientes", "Clientes"],
  ["datos", "Fotos y datos"],
  ["apariencia", "Apariencia"],
  ["estado", "Estado y plan", "admin"],
];

/**
 * Editor de un negocio de /fastfoods, compartido por el admin
 * (/dashboard/fastfoods, modo="admin") y por el dueño (/mi-negocio, modo="dueno").
 * El dueño no ve "Estado y plan" ni puede cambiar el enlace; el servidor
 * lo vuelve a validar en /api/mi-negocio.
 */
export default function EditorNegocio({
  modo = "admin",
  id,
  pestanaInicial,
  onCambioLista = () => {},
  onEliminado = () => {},
}) {
  const api = useMemo(() => crearApi(modo), [modo]);
  const [datos, setDatos] = useState(null);
  const [pestana, setPestana] = useState(
    PESTANAS.some(([key]) => key === pestanaInicial) ? pestanaInicial : "pedidos"
  );
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setDatos(await api("GET", { query: modo === "admin" ? `id=${id}` : "" }));
    } catch (err) {
      window.alert(err.message);
    }
  }, [api, id, modo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // GET con parámetros extra (pedidos / clientes) respetando el modo.
  const consultar = useCallback(
    (extra) => api("GET", { query: modo === "admin" ? `id=${id}&${extra}` : extra }),
    [api, id, modo]
  );
  // Los pedidos se consultan siempre (no solo en su pestaña) para avisar de los nuevos.
  const { pedidos, cargar: cargarPedidos, cantidadNuevos } = usePedidos(consultar);

  if (!datos) {
    return (
      <div className={`${tarjeta} flex justify-center py-16`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const { negocio } = datos;
  const enlace = `https://neurai.dev/fastfoods/${negocio.slug}`;

  // Guarda cambios del negocio y refresca (y la lista si cambió algo visible ahí).
  const guardarNegocio = async (cambios) => {
    await api("PATCH", { body: { tipo: "negocio", id: negocio.id, ...cambios } });
    await cargar();
    if (["nombre", "slug", "estado", "plan", "logo_path", "owner_email"].some((k) => k in cambios)) onCambioLista();
  };

  return (
    <div className="space-y-4">
      <div className={`${tarjeta} flex flex-wrap items-center gap-3`}>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{negocio.nombre}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{enlace}</p>
        </div>
        <button
          type="button"
          className={botonSecundario}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(enlace);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            } catch {
              window.prompt("Copia el enlace:", enlace);
            }
          }}
        >
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? "Copiado" : "Copiar enlace"}
        </button>
        <a href={`/fastfoods/${negocio.slug}`} target="_blank" rel="noreferrer" className={botonSecundario}>
          <ExternalLink className="w-4 h-4" /> Ver página
        </a>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`¡Mira nuestro menú y el especial de hoy! Pide aquí 👉 ${enlace}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-[#25D366] text-white rounded-lg"
        >
          <Share2 className="w-4 h-4" /> Compartir
        </a>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {PESTANAS.filter(([, , solo]) => !solo || solo === modo).map(([key, nombre]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPestana(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              pestana === key
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {nombre}
            {key === "pedidos" && cantidadNuevos > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                {cantidadNuevos}
              </span>
            )}
          </button>
        ))}
      </div>

      {pestana === "pedidos" && (
        <PestanaPedidos api={api} id={negocio.id} pedidos={pedidos} recargar={cargarPedidos} />
      )}
      {pestana === "clientes" && (
        <PestanaClientes
          api={api}
          id={negocio.id}
          consultar={consultar}
          negocio={negocio}
          guardar={guardarNegocio}
        />
      )}
      {pestana === "especial" && <PestanaEspecial api={api} id={negocio.id} especiales={datos.especiales} recargar={cargar} />}
      {pestana === "menu" && <PestanaMenu api={api} id={negocio.id} menu={datos.menu} recargar={cargar} />}
      {pestana === "datos" && <PestanaDatos modo={modo} negocio={negocio} guardar={guardarNegocio} />}
      {pestana === "apariencia" && <PestanaApariencia negocio={negocio} guardar={guardarNegocio} />}
      {pestana === "estado" && modo === "admin" && (
        <PestanaEstado api={api} negocio={negocio} guardar={guardarNegocio} onEliminado={onEliminado} />
      )}
    </div>
  );
}

// ─────────────────────────── Especial de hoy ───────────────────────────

function PestanaEspecial({ api, id, especiales, recargar }) {
  const vacio = { titulo: "", descripcion: "", precio: "", hasta: "23:00", porciones: "" };
  const [form, setForm] = useState(vacio);
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [borrando, setBorrando] = useState(null);
  const fotoInput = useRef(null);

  const elegirFoto = (file) => {
    if (!file) return;
    setFoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const publicar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const imagen = foto ? await subirFoto(foto, id) : null;
      await api("POST", {
        body: {
          accion: "crear_especial",
          fastfood_id: id,
          ...form,
          foto_path: imagen?.path,
        },
      });
      setForm(vacio);
      setFoto(null);
      setPreview(null);
      await recargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPorciones = async (e) => {
    const valor = window.prompt(
      "¿Cuántas porciones hay en total? (déjalo vacío para no limitar)",
      e.porciones ?? ""
    );
    if (valor === null) return;
    try {
      await api("PATCH", {
        body: { tipo: "especial", fastfood_id: id, id: e.id, porciones: valor.trim() === "" ? null : valor.trim() },
      });
      await recargar();
    } catch (err) {
      window.alert(err.message);
    }
  };

  const borrar = async (especialId) => {
    if (!window.confirm("¿Quitar este especial ya?")) return;
    setBorrando(especialId);
    try {
      await api("DELETE", { query: `fastfood_id=${id}&especial=${especialId}` });
      await recargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setBorrando(null);
    }
  };

  return (
    <div className="space-y-4">
      {especiales.length > 0 && (
        <div className={tarjeta}>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Publicados ahora</h3>
          <ul className="space-y-3">
            {especiales.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {e.foto_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.foto_url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{e.titulo}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {e.precio ? `${formatoPrecio(e.precio)} · ` : ""}Se oculta a las {horaLegible(e.expira_en)}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {e.porciones == null
                      ? `${e.vendidas || 0} pedidas · sin límite`
                      : `${e.vendidas || 0} de ${e.porciones} pedidas${e.vendidas >= e.porciones ? " · agotado" : ""}`}
                    <button
                      type="button"
                      onClick={() => cambiarPorciones(e)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Cambiar porciones
                    </button>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => borrar(e.id)}
                  disabled={borrando === e.id}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  aria-label="Quitar especial"
                >
                  {borrando === e.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={publicar} className={`${tarjeta} space-y-4`}>
        <h3 className="font-bold text-gray-900 dark:text-white">Publicar especial</h3>

        <button
          type="button"
          onClick={() => fotoInput.current?.click()}
          className="relative w-full aspect-[16/9] max-h-72 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-sm">
              <Upload className="w-6 h-6" /> Foto del plato (JPG o PNG para que se vea al compartir)
            </span>
          )}
        </button>
        <input
          ref={fotoInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            elegirFoto(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="grid sm:grid-cols-[1fr_120px_110px_110px] gap-3">
          <div>
            <label className={label}>Plato</label>
            <input
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Hamburguesa doble con papas"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Precio</label>
            <input
              inputMode="numeric"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value.replace(/\D/g, "") })}
              placeholder="18000"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Porciones</label>
            <input
              inputMode="numeric"
              value={form.porciones}
              onChange={(e) => setForm({ ...form, porciones: e.target.value.replace(/\D/g, "") })}
              placeholder="Sin límite"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Hasta las</label>
            <input
              required
              type="time"
              value={form.hasta}
              onChange={(e) => setForm({ ...form, hasta: e.target.value })}
              className={input}
            />
          </div>
        </div>
        <div>
          <label className={label}>Descripción (opcional)</label>
          <input
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            placeholder="Incluye gaseosa"
            className={input}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Hora de Colombia. Si la hora ya pasó hoy, se toma la de mañana (p. ej. publicar a las 11 p. m.
          «hasta la 01:00»). Sin precio, el especial se muestra pero no se puede pedir. Con porciones, se descuentan solas con cada pedido y se muestra «Quedan N» o «Agotado».
        </p>
        <button type="submit" disabled={guardando} className={botonPrimario}>
          {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Publicar
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────── Menú ───────────────────────────────

function PestanaMenu({ api, id, menu, recargar }) {
  const patchItem = (itemId, cambios) =>
    api("PATCH", { body: { tipo: "item", fastfood_id: id, id: itemId, ...cambios } });
  const vacio = { categoria: "", nombre: "", precio: "", descripcion: "" };
  const [form, setForm] = useState(vacio);
  const [creando, setCreando] = useState(false);
  const [ocupado, setOcupado] = useState(null);
  const [editando, setEditando] = useState(null);
  const [edicion, setEdicion] = useState(vacio);
  const fotoInputs = useRef({});

  const categorias = [...new Set(menu.map((m) => m.categoria).filter(Boolean))];

  const accion = async (itemId, fn) => {
    setOcupado(itemId);
    try {
      await fn();
      await recargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setOcupado(null);
    }
  };

  const agregar = async (e) => {
    e.preventDefault();
    setCreando(true);
    try {
      await api("POST", { body: { accion: "crear_item", fastfood_id: id, ...form } });
      // Conserva la categoría para cargar varios platos seguidos de la misma.
      setForm({ ...vacio, categoria: form.categoria });
      await recargar();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setCreando(false);
    }
  };

  // Intercambia el orden con el vecino (arriba/abajo).
  const mover = (indice, delta) => {
    const a = menu[indice];
    const b = menu[indice + delta];
    if (!a || !b) return;
    accion(a.id, async () => {
      await patchItem(a.id, { orden: b.orden });
      await patchItem(b.id, { orden: a.orden === b.orden ? a.orden + delta : a.orden });
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={agregar} className={`${tarjeta} space-y-3`}>
        <h3 className="font-bold text-gray-900 dark:text-white">Agregar plato</h3>
        <div className="grid sm:grid-cols-[160px_1fr_120px] gap-3">
          <div>
            <label className={label}>Categoría</label>
            <input
              list="categorias-menu"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              placeholder="Hamburguesas"
              className={input}
            />
            <datalist id="categorias-menu">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={label}>Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Hamburguesa sencilla"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Precio</label>
            <input
              required
              inputMode="numeric"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value.replace(/\D/g, "") })}
              placeholder="12000"
              className={input}
            />
          </div>
        </div>
        <input
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          placeholder="Descripción (opcional)"
          className={input}
        />
        <button type="submit" disabled={creando} className={botonPrimario}>
          {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Agregar
        </button>
      </form>

      <div className={tarjeta}>
        {menu.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">El menú está vacío.</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {menu.map((item, i) => (
              <li key={item.id} className={`py-3 flex gap-3 items-start ${item.disponible ? "" : "opacity-50"}`}>
                <button
                  type="button"
                  onClick={() => fotoInputs.current[item.id]?.click()}
                  className="relative w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400"
                  aria-label="Cambiar foto"
                >
                  {item.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.foto_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={(el) => (fotoInputs.current[item.id] = el)}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    accion(item.id, async () => {
                      const { path } = await subirFoto(file, id);
                      await patchItem(item.id, { foto_path: path });
                    });
                  }}
                />

                {editando === item.id ? (
                  <div className="flex-1 grid sm:grid-cols-[140px_1fr_110px] gap-2">
                    <input
                      list="categorias-menu"
                      value={edicion.categoria}
                      onChange={(e) => setEdicion({ ...edicion, categoria: e.target.value })}
                      placeholder="Categoría"
                      className={input}
                    />
                    <input
                      value={edicion.nombre}
                      onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                      className={input}
                    />
                    <input
                      inputMode="numeric"
                      value={edicion.precio}
                      onChange={(e) => setEdicion({ ...edicion, precio: e.target.value.replace(/\D/g, "") })}
                      className={input}
                    />
                    <input
                      value={edicion.descripcion}
                      onChange={(e) => setEdicion({ ...edicion, descripcion: e.target.value })}
                      placeholder="Descripción"
                      className={`${input} sm:col-span-3`}
                    />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.nombre}{" "}
                      <span className="font-normal text-gray-500 dark:text-gray-400">· {formatoPrecio(item.precio)}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.categoria || "Sin categoría"}
                      {item.descripcion ? ` · ${item.descripcion}` : ""}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {ocupado === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400 m-2" />
                  ) : editando === item.id ? (
                    <>
                      <IconoBoton
                        etiqueta="Guardar"
                        onClick={() =>
                          accion(item.id, async () => {
                            await patchItem(item.id, edicion);
                            setEditando(null);
                          })
                        }
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </IconoBoton>
                      <IconoBoton etiqueta="Cancelar" onClick={() => setEditando(null)}>
                        <X className="w-4 h-4" />
                      </IconoBoton>
                    </>
                  ) : (
                    <>
                      <IconoBoton etiqueta="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                        <ArrowUp className="w-4 h-4" />
                      </IconoBoton>
                      <IconoBoton etiqueta="Bajar" onClick={() => mover(i, 1)} disabled={i === menu.length - 1}>
                        <ArrowDown className="w-4 h-4" />
                      </IconoBoton>
                      <IconoBoton
                        etiqueta={item.disponible ? "Marcar agotado" : "Marcar disponible"}
                        onClick={() =>
                          accion(item.id, () =>
                            patchItem(item.id, { disponible: !item.disponible })
                          )
                        }
                      >
                        {item.disponible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </IconoBoton>
                      <IconoBoton
                        etiqueta="Editar"
                        onClick={() => {
                          setEditando(item.id);
                          setEdicion({
                            categoria: item.categoria || "",
                            nombre: item.nombre,
                            precio: String(item.precio),
                            descripcion: item.descripcion || "",
                          });
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </IconoBoton>
                      <IconoBoton
                        etiqueta="Eliminar"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar «${item.nombre}» del menú?`)) {
                            accion(item.id, () => api("DELETE", { query: `fastfood_id=${id}&item=${item.id}` }));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </IconoBoton>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function IconoBoton({ etiqueta, children, ...props }) {
  return (
    <button
      type="button"
      title={etiqueta}
      aria-label={etiqueta}
      className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  );
}

// ─────────────────────────── Datos y horario ───────────────────────────

function PestanaDatos({ modo, negocio, guardar }) {
  const [form, setForm] = useState({
    nombre: negocio.nombre || "",
    slug: negocio.slug || "",
    descripcion: negocio.descripcion || "",
    whatsapp: negocio.whatsapp || "",
    direccion: negocio.direccion || "",
    ciudad: negocio.ciudad || "",
    instagram: negocio.instagram || "",
    facebook: negocio.facebook || "",
    tiktok: negocio.tiktok || "",
    domicilio: !!negocio.domicilio,
  });
  const [horario, setHorario] = useState(negocio.horario || {});
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(null);
  const logoInput = useRef(null);
  const portadaInput = useRef(null);

  const enviar = async (e) => {
    e.preventDefault();
    if (modo === "admin" && form.slug !== negocio.slug && !window.confirm(
      "Cambiar el enlace rompe los enlaces que ya se compartieron. ¿Continuar?"
    )) return;
    setGuardando(true);
    try {
      // El dueño no puede cambiar el enlace: no se envía.
      const { slug, ...resto } = form;
      await guardar({
        ...resto,
        ...(modo === "admin" ? { slug } : {}),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        horario,
      });
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarImagen = async (tipo, file) => {
    if (!file) return;
    setSubiendo(tipo);
    try {
      const { path } = await subirFoto(file, negocio.id);
      await guardar({ [`${tipo}_path`]: path });
    } catch (err) {
      window.alert(err.message);
    } finally {
      setSubiendo(null);
    }
  };

  const campo = (key, texto, props = {}) => (
    <div>
      <label className={label}>{texto}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className={input}
        {...props}
      />
    </div>
  );

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className={`${tarjeta} space-y-4`}>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Fotos</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Portada: una foto horizontal del local o de tus mejores platos (va en la franja de arriba).
            Logo: cuadrado, se ve en el círculo. JPG o PNG, máximo 4 MB.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            ["logo", "Logo", logoInput, "w-24 h-24 rounded-2xl"],
            ["portada", "Portada", portadaInput, "w-64 h-24 rounded-lg"],
          ].map(([tipo, texto, ref, forma]) => (
            <div key={tipo}>
              <p className={label}>{texto}</p>
              <button
                type="button"
                onClick={() => ref.current?.click()}
                disabled={subiendo === tipo}
                className={`relative ${forma} overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400`}
              >
                {negocio[`${tipo}_url`] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={negocio[`${tipo}_url`]} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <span className="relative bg-black/50 text-white rounded-full p-2">
                  {subiendo === tipo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </span>
              </button>
              <input
                ref={ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  cambiarImagen(tipo, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={`${tarjeta} grid sm:grid-cols-2 gap-4`}>
        {campo("nombre", "Nombre", { required: true })}
        <div>
          <label className={label}>Enlace</label>
          {modo === "admin" ? (
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              className={input}
            />
          ) : (
            <p className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 break-all">
              neurai.dev/fastfoods/{negocio.slug}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">{campo("descripcion", "Descripción corta", { placeholder: "Las mejores hamburguesas de Colón" })}</div>
        {campo("whatsapp", "WhatsApp (recibe los pedidos)", { inputMode: "tel", placeholder: "3001234567" })}
        {campo("ciudad", "Ciudad")}
        <div className="sm:col-span-2">{campo("direccion", "Dirección")}</div>
        {campo("instagram", "Instagram", { placeholder: "@negocio" })}
        {campo("facebook", "Facebook")}
        {campo("tiktok", "TikTok")}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 self-end pb-2">
          <input
            type="checkbox"
            checked={form.domicilio}
            onChange={(e) => setForm({ ...form, domicilio: e.target.checked })}
            className="w-4 h-4"
          />
          Hace domicilios
        </label>
      </div>

      <div className={tarjeta}>
        <h3 className="font-bold text-gray-900 dark:text-white mb-1">Horario</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Si cierra después de medianoche (p. ej. 18:00 a 01:00), pon la hora de cierre tal cual.
        </p>
        <div className="space-y-2">
          {DIAS.map((d) => {
            const turno = horario[d.key];
            return (
              <div key={d.key} className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 w-32 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={!!turno}
                    onChange={(e) =>
                      setHorario({
                        ...horario,
                        [d.key]: e.target.checked ? { abre: "17:00", cierra: "23:00" } : null,
                      })
                    }
                    className="w-4 h-4"
                  />
                  {d.nombre}
                </label>
                {turno ? (
                  <>
                    <input
                      type="time"
                      value={turno.abre}
                      onChange={(e) => setHorario({ ...horario, [d.key]: { ...turno, abre: e.target.value } })}
                      className={`${input} w-auto`}
                    />
                    <span className="text-gray-400">a</span>
                    <input
                      type="time"
                      value={turno.cierra}
                      onChange={(e) => setHorario({ ...horario, [d.key]: { ...turno, cierra: e.target.value } })}
                      className={`${input} w-auto`}
                    />
                  </>
                ) : (
                  <span className="text-sm text-gray-400">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button type="submit" disabled={guardando} className={botonPrimario}>
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Guardar datos
      </button>
    </form>
  );
}

// ───────────────────────────── Apariencia ─────────────────────────────

function PestanaApariencia({ negocio, guardar }) {
  const [tema, setTema] = useState(negocio.tema);
  const [plantilla, setPlantilla] = useState(negocio.plantilla);
  const [guardando, setGuardando] = useState(false);

  // Secciones visibles en su orden, seguidas de las ocultas.
  const ocultas = SECCIONES.filter((s) => !tema.secciones.includes(s.key)).map((s) => s.key);
  const nombreSeccion = (key) => SECCIONES.find((s) => s.key === key)?.nombre;

  const mover = (i, delta) => {
    const s = [...tema.secciones];
    [s[i], s[i + delta]] = [s[i + delta], s[i]];
    setTema({ ...tema, secciones: s });
  };

  const enviar = async () => {
    setGuardando(true);
    try {
      await guardar({ tema, plantilla });
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${tarjeta} grid sm:grid-cols-3 gap-4`}>
        {[
          ["colorPrimario", "Color principal"],
          ["colorFondo", "Color de fondo"],
        ].map(([key, texto]) => (
          <div key={key}>
            <label className={label}>{texto}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tema[key]}
                onChange={(e) => setTema({ ...tema, [key]: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 bg-transparent"
              />
              <code className="text-sm text-gray-600 dark:text-gray-300">{tema[key]}</code>
            </div>
          </div>
        ))}
        <div>
          <label className={label}>Plantilla</label>
          <select value={plantilla} onChange={(e) => setPlantilla(e.target.value)} className={input}>
            {PLANTILLAS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={tarjeta}>
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Secciones (en orden)</h3>
        <ul className="space-y-2">
          {tema.secciones.map((key, i) => (
            <li key={key} className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{nombreSeccion(key)}</span>
              <IconoBoton etiqueta="Subir" onClick={() => mover(i, -1)} disabled={i === 0}>
                <ArrowUp className="w-4 h-4" />
              </IconoBoton>
              <IconoBoton etiqueta="Bajar" onClick={() => mover(i, 1)} disabled={i === tema.secciones.length - 1}>
                <ArrowDown className="w-4 h-4" />
              </IconoBoton>
              <IconoBoton
                etiqueta="Ocultar"
                onClick={() => setTema({ ...tema, secciones: tema.secciones.filter((s) => s !== key) })}
              >
                <EyeOff className="w-4 h-4" />
              </IconoBoton>
            </li>
          ))}
          {ocultas.map((key) => (
            <li key={key} className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2 opacity-60">
              <span className="flex-1 text-sm text-gray-900 dark:text-white">{nombreSeccion(key)} (oculta)</span>
              <IconoBoton
                etiqueta="Mostrar"
                onClick={() => setTema({ ...tema, secciones: [...tema.secciones, key] })}
              >
                <Eye className="w-4 h-4" />
              </IconoBoton>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          «Productos neurai.dev» siempre va al final, junto al pie de página (solo en plan gratis).
        </p>
      </div>

      <button type="button" onClick={enviar} disabled={guardando} className={botonPrimario}>
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Guardar apariencia
      </button>
    </div>
  );
}

// ──────────────────────────── Estado y plan ────────────────────────────

function PestanaEstado({ api, negocio, guardar, onEliminado }) {
  const [correo, setCorreo] = useState(negocio.owner_email || "");
  const [estado, setEstado] = useState(negocio.estado);
  const [plan, setPlan] = useState(negocio.plan);
  const [vence, setVence] = useState(negocio.plan_vence_en || "");
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const enviar = async () => {
    setGuardando(true);
    try {
      await guardar({ estado, plan, plan_vence_en: vence, owner_email: correo });
    } catch (err) {
      window.alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar «${negocio.nombre}» con todo su menú y especiales? No se puede deshacer.`)) return;
    setEliminando(true);
    try {
      await api("DELETE", { query: `negocio=${negocio.id}` });
      onEliminado();
    } catch (err) {
      window.alert(err.message);
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`${tarjeta} grid sm:grid-cols-3 gap-4`}>
        <div>
          <label className={label}>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)} className={input}>
            {ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Solo «publicado» es visible para el público.
          </p>
        </div>
        <div>
          <label className={label}>Plan</label>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className={input}>
            {PLANES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Plan vence</label>
          <input type="date" value={vence} onChange={(e) => setVence(e.target.value)} className={input} />
        </div>
        <div className="sm:col-span-3">
          <label className={label}>Correo de Google del dueño</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="dueno@gmail.com"
            className={input}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {negocio.owner_clerk_id
              ? "El dueño ya entró y gestiona su negocio en /mi-negocio."
              : "Cuando esa persona entre a neurai.dev/mi-negocio con este correo, el negocio pasa a ser suyo."}
          </p>
        </div>
        <div className="sm:col-span-3">
          <button type="button" onClick={enviar} disabled={guardando} className={botonPrimario}>
            {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>

      <div className={`${tarjeta} border border-red-200 dark:border-red-900/50`}>
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Eliminar negocio</h3>
        <button
          type="button"
          onClick={eliminar}
          disabled={eliminando}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60"
        >
          {eliminando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Eliminar
        </button>
      </div>
    </div>
  );
}
