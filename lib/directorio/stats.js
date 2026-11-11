import { d1Execute, d1Select } from "@/lib/db-d1";

export const TIPOS_EVENTO = ["vista", "whatsapp", "llamar", "mapa"];

const diaColombia = (fecha = new Date()) =>
  fecha.toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); // YYYY-MM-DD

/** Suma 1 al contador del día para ese negocio y tipo. */
export async function registrarEvento(negocioId, tipo) {
  if (!TIPOS_EVENTO.includes(tipo)) return;
  await d1Execute(
    `INSERT INTO directorio_stats (negocio_id, dia, tipo, n) VALUES (?, ?, ?, 1)
     ON CONFLICT(negocio_id, dia, tipo) DO UPDATE SET n = n + 1`,
    [negocioId, diaColombia(), tipo]
  );
}

/**
 * Resumen de los últimos 7 y 30 días para varios negocios:
 * { [negocioId]: { dias7: { vista, whatsapp, llamar, mapa }, dias30: {...} } }
 */
export async function resumenPorNegocios(ids) {
  const vacio = () => ({ vista: 0, whatsapp: 0, llamar: 0, mapa: 0 });
  const resultado = Object.fromEntries(ids.map((id) => [id, { dias7: vacio(), dias30: vacio() }]));
  if (!ids.length) return resultado;

  const hace = (dias) => diaColombia(new Date(Date.now() - (dias - 1) * 86_400_000));
  const marcas = ids.map(() => "?").join(", ");
  const filas = await d1Select(
    `SELECT negocio_id, tipo,
            SUM(n) AS total30,
            SUM(CASE WHEN dia >= ? THEN n ELSE 0 END) AS total7
       FROM directorio_stats
      WHERE negocio_id IN (${marcas}) AND dia >= ?
      GROUP BY negocio_id, tipo`,
    [hace(7), ...ids, hace(30)]
  );
  for (const f of filas) {
    if (!resultado[f.negocio_id] || !TIPOS_EVENTO.includes(f.tipo)) continue;
    resultado[f.negocio_id].dias30[f.tipo] = f.total30 || 0;
    resultado[f.negocio_id].dias7[f.tipo] = f.total7 || 0;
  }
  return resultado;
}
