import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1SelectOne } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import { ErrorFastfood, responderError } from "@/lib/fastfoods/acciones";
import { ErrorImagen, subirImagenNegocio } from "@/lib/fastfoods/r2";

export const dynamic = "force-dynamic";

// POST /api/fastfoods/imagen  (FormData: file, negocio?)
// El admin indica `negocio`; un dueño solo puede subir a su propio negocio.
// Devuelve { path, url }; luego se guarda con *_path en /api/mi-negocio o /api/admin/fastfoods.
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) throw new ErrorFastfood(401, "Inicia sesión para subir fotos");

    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") throw new ErrorFastfood(400, "No se recibió ninguna foto");

    let negocioId;
    if (isAdminServer(user) && form.get("negocio")) {
      negocioId = String(form.get("negocio"));
      const existe = await d1SelectOne(`SELECT id FROM fastfoods WHERE id = ?`, [negocioId]);
      if (!existe) throw new ErrorFastfood(404, "El negocio no existe");
    } else {
      const propio = await d1SelectOne(`SELECT id FROM fastfoods WHERE owner_clerk_id = ?`, [user.id]);
      if (!propio) throw new ErrorFastfood(403, "No tienes un negocio para subir fotos");
      negocioId = propio.id;
    }

    return NextResponse.json(await subirImagenNegocio(negocioId, file));
  } catch (error) {
    if (error instanceof ErrorImagen) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return responderError(error, "POST /api/fastfoods/imagen");
  }
}
