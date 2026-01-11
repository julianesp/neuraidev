/**
 * Servicio de créditos/fiados con Supabase Database
 * Gestiona créditos a clientes y pagos
 */

import { createClient } from './client';

/**
 * Obtiene todos los créditos con filtros opcionales
 */
export async function obtenerCreditos(filtros = {}) {
  try {
    const supabase = createClient();
    let query = supabase
      .from('creditos')
      .select(`
        *,
        pagos:pagos_credito(*)
      `);

    // Aplicar filtros
    if (filtros.estado) {
      query = query.eq('estado', filtros.estado);
    }

    if (filtros.email_cliente) {
      query = query.eq('email_cliente', filtros.email_cliente);
    }

    if (filtros.vencidos) {
      query = query.lt('fecha_limite_pago', new Date().toISOString());
    }

    // Ordenar por fecha de crédito (más recientes primero)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo créditos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo créditos:', error);
    return [];
  }
}

/**
 * Obtiene un crédito por su ID
 */
export async function obtenerCreditoPorId(id) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('creditos')
      .select(`
        *,
        pagos:pagos_credito(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo crédito:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error obteniendo crédito:', error);
    return null;
  }
}

/**
 * Crea un nuevo crédito
 */
export async function crearCredito(credito) {
  try {
    const supabase = createClient();

    // Calcular fecha límite de pago basada en los días de plazo
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + (credito.dias_plazo || 30));

    const creditoData = {
      ...credito,
      fecha_limite_pago: fechaLimite.toISOString(),
      monto_pendiente: credito.monto_total,
      estado: 'pendiente',
    };

    const { data, error } = await supabase
      .from('creditos')
      .insert([creditoData])
      .select()
      .single();

    if (error) {
      console.error('Error creando crédito:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creando crédito:', error);
    throw error;
  }
}

/**
 * Actualiza un crédito existente
 */
export async function actualizarCredito(id, cambios) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('creditos')
      .update(cambios)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando crédito:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error actualizando crédito:', error);
    throw error;
  }
}

/**
 * Elimina un crédito
 */
export async function eliminarCredito(id) {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('creditos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando crédito:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error eliminando crédito:', error);
    throw error;
  }
}

/**
 * Registra un pago parcial o total de un crédito
 */
export async function registrarPago(creditoId, pago) {
  try {
    const supabase = createClient();

    // Primero obtener el crédito actual
    const credito = await obtenerCreditoPorId(creditoId);
    if (!credito) {
      throw new Error('Crédito no encontrado');
    }

    // Registrar el pago
    const { data: pagoData, error: errorPago } = await supabase
      .from('pagos_credito')
      .insert([{
        credito_id: creditoId,
        monto_pago: pago.monto_pago,
        metodo_pago: pago.metodo_pago,
        comprobante_url: pago.comprobante_url,
        notas: pago.notas,
        created_by: pago.created_by,
      }])
      .select()
      .single();

    if (errorPago) {
      console.error('Error registrando pago:', errorPago);
      throw errorPago;
    }

    // Actualizar el monto pagado en el crédito
    const nuevoMontoPagado = credito.monto_pagado + pago.monto_pago;
    await actualizarCredito(creditoId, {
      monto_pagado: nuevoMontoPagado,
    });

    return pagoData;
  } catch (error) {
    console.error('Error registrando pago:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de créditos
 */
export async function obtenerEstadisticasCreditos() {
  try {
    const supabase = createClient();
    const { data: creditos, error } = await supabase
      .from('creditos')
      .select('id, estado, monto_total, monto_pendiente, fecha_limite_pago');

    if (error) {
      console.error('Error obteniendo estadísticas de créditos:', error);
      return {
        total: 0,
        pendientes: 0,
        vencidos: 0,
        montoPendiente: 0,
        montoRecaudado: 0,
      };
    }

    const total = creditos?.length || 0;
    const pendientes = creditos?.filter(c => c.estado === 'pendiente' || c.estado === 'pagado_parcial').length || 0;

    const ahora = new Date();
    const vencidos = creditos?.filter(c =>
      (c.estado === 'pendiente' || c.estado === 'pagado_parcial') &&
      new Date(c.fecha_limite_pago) < ahora
    ).length || 0;

    const montoPendiente = creditos?.reduce((sum, c) => sum + (parseFloat(c.monto_pendiente) || 0), 0) || 0;
    const montoRecaudado = creditos?.reduce((sum, c) => sum + (parseFloat(c.monto_total) || 0) - (parseFloat(c.monto_pendiente) || 0), 0) || 0;

    return {
      total,
      pendientes,
      vencidos,
      montoPendiente: montoPendiente.toFixed(2),
      montoRecaudado: montoRecaudado.toFixed(2),
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de créditos:', error);
    return {
      total: 0,
      pendientes: 0,
      vencidos: 0,
      montoPendiente: 0,
      montoRecaudado: 0,
    };
  }
}

/**
 * Obtiene créditos próximos a vencer (en los próximos N días)
 */
export async function obtenerCreditosProximosVencer(dias = 7) {
  try {
    const supabase = createClient();

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const { data, error } = await supabase
      .from('creditos')
      .select('*')
      .in('estado', ['pendiente', 'pagado_parcial'])
      .lte('fecha_limite_pago', fechaLimite.toISOString())
      .gte('fecha_limite_pago', new Date().toISOString())
      .order('fecha_limite_pago', { ascending: true });

    if (error) {
      console.error('Error obteniendo créditos próximos a vencer:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error obteniendo créditos próximos a vencer:', error);
    return [];
  }
}

/**
 * Marca un recordatorio como enviado
 */
export async function marcarRecordatorioEnviado(creditoId) {
  try {
    const supabase = createClient();

    const credito = await obtenerCreditoPorId(creditoId);
    if (!credito) {
      throw new Error('Crédito no encontrado');
    }

    const { data, error } = await supabase
      .from('creditos')
      .update({
        recordatorio_enviado: true,
        fecha_ultimo_recordatorio: new Date().toISOString(),
        numero_recordatorios: (credito.numero_recordatorios || 0) + 1,
      })
      .eq('id', creditoId)
      .select()
      .single();

    if (error) {
      console.error('Error marcando recordatorio:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error marcando recordatorio:', error);
    throw error;
  }
}
