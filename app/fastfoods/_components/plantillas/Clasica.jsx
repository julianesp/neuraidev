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
 * que define negocio.tema.secciones (nivel 1). `SeccionCustom` (nivel 3) va
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
    neurai: <SeccionNeurai negocio={negocio} productos={productosNeurai} />,
  };

  return (
    <CarritoProvider negocio={negocio} pedibles={pedibles}>
      <Encabezado negocio={negocio} />
      {SeccionCustom && <SeccionCustom negocio={negocio} />}
      {menu.length === 0 && especiales.length === 0 && <SinContenido />}
      {negocio.tema.secciones.map((key) => (
        <div key={key}>{secciones[key]}</div>
      ))}
      <PiePagina />
      <BarraPedido />
    </CarritoProvider>
  );
}
