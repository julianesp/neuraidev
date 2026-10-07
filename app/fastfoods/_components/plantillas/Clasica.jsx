import { BarraPedido, CarritoProvider, PedirLoMismo } from "../Carrito";
import {
  AvisoSellos,
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
export default function Clasica({ negocio, menu, especiales, productosNeurai, SeccionCustom, esDueno }) {
  const pedibles = {};
  for (const e of especiales) {
    if (!e.precio) continue;
    // quedan: null = sin límite de porciones.
    const quedan = e.porciones == null ? null : Math.max(0, e.porciones - (e.vendidas || 0));
    pedibles[e.id] = { id: e.id, nombre: e.titulo, precio: e.precio, quedan };
  }
  for (const m of menu) pedibles[m.id] = { id: m.id, nombre: m.nombre, precio: m.precio, quedan: null };

  const secciones = {
    especial: <SeccionEspecial especiales={especiales} />,
    menu: <SeccionMenu menu={menu} />,
    info: <SeccionInfo negocio={negocio} />,
  };

  return (
    <CarritoProvider negocio={negocio} pedibles={pedibles}>
      <Encabezado negocio={negocio} esDueno={esDueno} />
      {SeccionCustom && <SeccionCustom negocio={negocio} />}
      <PedirLoMismo />
      <AvisoSellos negocio={negocio} />
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
