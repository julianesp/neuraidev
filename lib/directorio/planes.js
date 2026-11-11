// Planes del directorio. Los precios SIEMPRE se toman de aquí (servidor):
// nunca del cliente.
export const TRIAL_DIAS = 30;
export const FOTOS_GRATIS = 6;
export const FOTOS_PLAN = 15;

export const PLANES = {
  mensual: { id: "mensual", nombre: "1 mes", meses: 1, precio: 10000 },
  semestral: { id: "semestral", nombre: "6 meses", meses: 6, precio: 50000 },
};

export const planActivo = (planHasta, ahora = new Date()) =>
  !!planHasta && new Date(planHasta) > ahora;

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
