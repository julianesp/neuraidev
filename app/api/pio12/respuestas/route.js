import { d1Execute, d1Select } from '@/lib/db-d1';
import { NextResponse } from 'next/server';

// Crea la tabla si no existe (idempotente)
async function ensureTable() {
  await d1Execute(`
    CREATE TABLE IF NOT EXISTS pio12_respuestas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cargo TEXT,
      celular TEXT NOT NULL,
      bloque TEXT,
      pregunta TEXT NOT NULL,
      respuesta TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    )
  `, []);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const celular = searchParams.get('celular');
    if (!celular) return NextResponse.json({ respuestas: [] });

    const filas = await d1Select(
      `SELECT pregunta, respuesta FROM pio12_respuestas WHERE celular = ? ORDER BY id`,
      [celular]
    );
    return NextResponse.json({ respuestas: filas });
  } catch {
    return NextResponse.json({ respuestas: [] });
  }
}

export async function POST(request) {
  try {
    const { nombre, cargo, celular, bloque, respuestas } = await request.json();

    if (!nombre || !celular || !Array.isArray(respuestas)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    await ensureTable();

    // Borrar respuestas previas del mismo empleado para permitir re-envío
    await d1Execute(
      `DELETE FROM pio12_respuestas WHERE celular = ?`,
      [celular]
    );

    // Insertar cada pregunta/respuesta como fila
    for (const { pregunta, respuesta } of respuestas) {
      await d1Execute(
        `INSERT INTO pio12_respuestas (nombre, cargo, celular, bloque, pregunta, respuesta)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, cargo || '', celular, bloque || '', pregunta, respuesta || '']
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('pio12 respuestas error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
