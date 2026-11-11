import { d1Execute, d1Select, d1SelectOne } from "@/lib/db-d1";
import { ErrorDirectorio } from "./negocios";
import { limiteProductos } from "./planes";

/** Valida los datos de un producto. Lanza ErrorDirectorio. */
export function validarProducto(body) {
  const nombre = String(body.nombre ?? "").trim().slice(0, 80);
  if (nombre.length < 2) throw new ErrorDirectorio("Escribe el nombre del producto.");

  // Precio en pesos enteros; vacío = "Consultar precio".
  let precio = null;
  const crudo = String(body.precio ?? "").replace(/[^\d]/g, "");
  if (crudo) {
    precio = parseInt(crudo, 10);
    if (!Number.isFinite(precio) || precio <= 0 || precio > 99_999_999) {
      throw new ErrorDirectorio("El precio no es válido.");
    }
  }

  const base = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL;
  let imagen = String(body.imagen_url ?? "").trim().slice(0, 500);
  if (imagen && (!/^https:\/\//i.test(imagen) || (base && !imagen.startsWith(base)))) imagen = "";

  return {
    nombre,
    precio,
    descripcion: String(body.descripcion ?? "").trim().slice(0, 200),
    imagen_url: imagen,
  };
}

/** Crea un producto respetando el límite del plan del negocio. */
export async function crearProducto(negocio, datos) {
  const { n } = (await d1SelectOne("SELECT COUNT(*) AS n FROM directorio_productos WHERE negocio_id = ?", [negocio.id])) || { n: 0 };
  const limite = limiteProductos(negocio.plan_hasta);
  if (limite === 0) {
    throw new ErrorDirectorio(
      "Publicar productos para vender es parte del plan. Actívalo para volver a usar el catálogo."
    );
  }
  if (n >= limite) {
    throw new ErrorDirectorio(
      `Llegaste al máximo de ${limite} productos. Quita uno para agregar otro.`
    );
  }
  const id = crypto.randomUUID();
  await d1Execute(
    `INSERT INTO directorio_productos (id, negocio_id, nombre, precio, descripcion, imagen_url, disponible, created_at)
     VALUES (?,?,?,?,?,?,1,?)`,
    [id, negocio.id, datos.nombre, datos.precio, datos.descripcion, datos.imagen_url, new Date().toISOString()]
  );
  return id;
}

/** Productos de varios negocios: { [negocioId]: [producto, ...] } (disponibles primero). */
export async function productosPorNegocios(ids) {
  const resultado = {};
  if (!ids.length) return resultado;
  const filas = await d1Select(
    `SELECT id, negocio_id, nombre, precio, descripcion, imagen_url, disponible FROM directorio_productos
      WHERE negocio_id IN (${ids.map(() => "?").join(", ")})
      ORDER BY disponible DESC, created_at ASC`,
    ids
  );
  for (const f of filas) (resultado[f.negocio_id] ||= []).push(f);
  return resultado;
}
