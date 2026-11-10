import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { d1Select, d1Execute } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import { parsearFotos } from "@/lib/directorio/negocios";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const user = await currentUser().catch(() => null);
  return user && isAdminServer(user) ? user : null;
}

const prohibido = () => NextResponse.json({ error: "No autorizado" }, { status: 403 });

// GET /api/admin/directorio?estado=pendiente|aprobado|rechazado|todos
export async function GET(request) {
  try {
    if (!(await requireAdmin())) return prohibido();
    const estado = new URL(request.url).searchParams.get("estado") || "pendiente";
    const filas =
      estado === "todos"
        ? await d1Select("SELECT * FROM directorio_negocios ORDER BY created_at DESC LIMIT 300")
        : await d1Select(
            "SELECT * FROM directorio_negocios WHERE estado = ? ORDER BY created_at DESC LIMIT 300",
            [estado]
          );
    const conteo = await d1Select(
      "SELECT estado, COUNT(*) AS n FROM directorio_negocios GROUP BY estado"
    );
    return NextResponse.json({
      negocios: filas.map((f) => ({ ...f, fotos: parsearFotos(f.fotos) })),
      conteo: Object.fromEntries(conteo.map((c) => [c.estado, c.n])),
    });
  } catch (error) {
    console.error("Error en GET /api/admin/directorio:", error);
    return NextResponse.json({ error: "Error al cargar el directorio" }, { status: 500 });
  }
}

// PATCH { id, accion: aprobar | rechazar | destacar | quitar_destacado, motivo? }
export async function PATCH(request) {
  try {
    if (!(await requireAdmin())) return prohibido();
    const { id, accion, motivo } = await request.json();
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    const ahora = new Date().toISOString();

    if (accion === "aprobar") {
      await d1Execute(
        `UPDATE directorio_negocios SET estado='aprobado', motivo_rechazo=NULL, aprobado_at=?, updated_at=? WHERE id=?`,
        [ahora, ahora, id]
      );
    } else if (accion === "rechazar") {
      await d1Execute(
        `UPDATE directorio_negocios SET estado='rechazado', motivo_rechazo=?, destacado=0, updated_at=? WHERE id=?`,
        [String(motivo || "").trim().slice(0, 300) || null, ahora, id]
      );
    } else if (accion === "destacar" || accion === "quitar_destacado") {
      await d1Execute(`UPDATE directorio_negocios SET destacado=?, updated_at=? WHERE id=?`, [
        accion === "destacar" ? 1 : 0,
        ahora,
        id,
      ]);
    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en PATCH /api/admin/directorio:", error);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

// DELETE ?id=
export async function DELETE(request) {
  try {
    if (!(await requireAdmin())) return prohibido();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });
    await d1Execute("DELETE FROM directorio_negocios WHERE id = ?", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en DELETE /api/admin/directorio:", error);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
