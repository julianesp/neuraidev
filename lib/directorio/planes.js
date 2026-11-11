// Planes del directorio. Los precios SIEMPRE se toman de aquí (servidor):
// nunca del cliente.
// Interruptor del cobro: true = el directorio es gratis para todos (todos los negocios tienen los
// límites del plan completo y se oculta el cobro). Poner false para volver a cobrar; la lógica de
// planes, pagos y ePayco sigue intacta.
export const DIRECTORIO_GRATIS = true;

export const TRIAL_DIAS = 30;
export const FOTOS_GRATIS = 6;
export const FOTOS_PLAN = 15;

export const PLANES = {
  mensual: { id: "mensual", nombre: "1 mes", meses: 1, precio: 10000 },
  semestral: { id: "semestral", nombre: "6 meses", meses: 6, precio: 50000 },
};

export const planActivo = (planHasta, ahora = new Date()) =>
  DIRECTORIO_GRATIS || (!!planHasta && new Date(planHasta) > ahora);

export const limiteFotos = (planHasta) => (planActivo(planHasta) ? FOTOS_PLAN : FOTOS_GRATIS);

export function finDePrueba(desde = new Date()) {
  return new Date(desde.getTime() + TRIAL_DIAS * 86_400_000).toISOString();
}

/** Suma meses al final del plan vigente (o a hoy si ya venció): pagar antes no pierde días. */
export function sumarMeses(planHasta, meses, ahora = new Date()) {
  const vigente = planHasta && new Date(planHasta) > ahora ? new Date(planHasta) : ahora;
  const d = new Date(vigente);
  d.setMonth(d.getMonth() + meses);
  return d.toISOString();
}

export const pesos = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);

// Ofertas del negocio: una vigente con el plan gratis, hasta 3 con plan activo.
export const OFERTAS_GRATIS = 1;
export const OFERTAS_PLAN = 3;
export const OFERTA_MAX_DIAS = 30;
export const limiteOfertas = (planHasta) => (planActivo(planHasta) ? OFERTAS_PLAN : OFERTAS_GRATIS);

// Catálogo de productos para vender: solo con plan activo (o en los 30 días de prueba): hasta 20.
export const PRODUCTOS_GRATIS = 0;
export const PRODUCTOS_PLAN = 20;
export const limiteProductos = (planHasta) => (planActivo(planHasta) ? PRODUCTOS_PLAN : PRODUCTOS_GRATIS);
