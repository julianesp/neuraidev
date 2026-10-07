import { CarritoProvider, BarraPedido } from "../Carrito";
import {
  Encabezado,
  PiePagina,
  SeccionEspecial,
  SeccionInfo,
  SeccionMenu,
  SeccionNeurai,
  SinContenido,
} from "../secciones";

/**
 * Plantilla "clásica": portada + logo, y debajo las secciones en el orden
 * que define negocio.tema.secciones (nivel 1); «neurai» siempre al final. `SeccionCustom` (nivel 3) va
 * justo después del encabezado si el negocio la tiene.
 */
export default function Clasica({ negocio, menu, especiales, productosNeurai, SeccionCustom }) {
  const pedibles = {};
  for (const e of especiales) {
    if (e.precio) pedibles[e.id] = { id: e.id, nombre: e.titulo, precio: e.precio };
  }
  for (const m of menu) pedibles[m.id] = { id: m.id, nombre: m.nombre, precio: m.precio };

  const secciones = {
    especial: <SeccionEspecial especiales={especiales} />,
    menu: <SeccionMenu menu={menu} />,
    info: <SeccionInfo negocio={negocio} />,
  };

  return (
    <CarritoProvider negocio={negocio} pedibles={pedibles}>
      <Encabezado negocio={negocio} />
      {SeccionCustom && <SeccionCustom negocio={negocio} />}
      {menu.length === 0 && especiales.length === 0 && <SinContenido />}
      {negocio.tema.secciones
        .filter((key) => key !== "neurai")
        .map((key) => (
          <div key={key}>{secciones[key]}</div>
        ))}
      {/* Tus productos van siempre al final, pegados al pie, aunque el orden sea otro */}
      {negocio.tema.secciones.includes("neurai") && (
        <SeccionNeurai negocio={negocio} productos={productosNeurai} />
      )}
      <PiePagina />
      <BarraPedido />
    </CarritoProvider>
  );
}
