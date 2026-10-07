/**
 * Dueños de /fastfoods (solo servidor). Un negocio por cuenta de Clerk.
 */

import { currentUser } from "@clerk/nextjs/server";
import { d1SelectOne, d1Execute } from "@/lib/db-d1";
import { ErrorFastfood } from "./acciones";

/** Correos verificados de la cuenta (Google ya los entrega verificados). */
function correosVerificados(user) {
  return (user.emailAddresses || [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress.toLowerCase());
}

/**
 * Usuario actual y su negocio (o null). Si el admin creó un negocio con el
 * correo de esta persona y aún no tiene dueño, aquí pasa a ser suyo.
 */
export async function getDuenoYNegocio() {
  const user = await currentUser();
  if (!user) throw new ErrorFastfood(401, "Inicia sesión para continuar");

  let negocio = await d1SelectOne(`SELECT * FROM fastfoods WHERE owner_clerk_id = ?`, [user.id]);

  if (!negocio) {
    for (const correo of correosVerificados(user)) {
      const asignado = await d1SelectOne(
        `SELECT id FROM fastfoods WHERE owner_email = ? AND owner_clerk_id IS NULL
         ORDER BY created_at ASC LIMIT 1`,
        [correo]
      );
      if (!asignado) continue;
      // La condición owner_clerk_id IS NULL evita que dos cuentas lo reclamen a la vez.
      await d1Execute(
        `UPDATE fastfoods SET owner_clerk_id = ?, updated_at = ? WHERE id = ? AND owner_clerk_id IS NULL`,
        [user.id, new Date().toISOString(), asignado.id]
      );
      negocio = await d1SelectOne(`SELECT * FROM fastfoods WHERE owner_clerk_id = ?`, [user.id]);
      if (negocio) break;
    }
  }

  return { user, negocio, correo: user.primaryEmailAddress?.emailAddress || correosVerificados(user)[0] || null };
}

/** Igual que getDuenoYNegocio pero exige que ya tenga negocio. */
export async function requireNegocioDelDueno() {
  const datos = await getDuenoYNegocio();
  if (!datos.negocio) throw new ErrorFastfood(404, "Aún no tienes un negocio creado");
  return datos;
}
