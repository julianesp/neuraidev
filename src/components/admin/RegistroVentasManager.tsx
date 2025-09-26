"use client";

import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Venta {
  id: string;
  numero: string;
  cliente?: {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
  };
  items: VentaItem[];
  subtotal: number;
  impuestos: number;
  descuentos: number;
  total: number;
  estado: string;
  metodoPago?: string;
  notas?: string;
  fechaVenta: string;
  createdAt: string;
  tienda: {
    id: string;
    nombre: string;
  };
}

interface VentaItem {
  id: string;
  producto: {
    id: string;
    nombre: string;
    categoria: string;
  };
  cantidad: number;
  precioUnit: number;
  subtotal: number;
}

interface EstadisticasVentas {
  totalVentas: number;
  montoTotal: number;
  ventasHoy: number;
  montoHoy: number;
  ventasSemana: number;
  montoSemana: number;
  ventasMes: number;
  montoMes: number;
}

type PeriodoFiltro = 'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizado';

export default function RegistroVentasManager() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventasFiltradas, setVentasFiltradas] = useState<Venta[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasVentas>({
    totalVentas: 0,
    montoTotal: 0,
    ventasHoy: 0,
    montoHoy: 0,
    ventasSemana: 0,
    montoSemana: 0,
    ventasMes: 0,
    montoMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [ventaAEliminar, setVentaAEliminar] = useState<string | null>(null);

  useEffect(() => {
    fetchVentas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [ventas, filtroTexto, periodo, fechaInicio, fechaFin, filtroEstado, filtroMetodoPago]);

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ventas?includeItems=true');
      if (response.ok) {
        const data = await response.json();
        setVentas(data.ventas || []);
        calcularEstadisticas(data.ventas || []);
      }
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setMessage({ type: 'error', text: 'Error cargando las ventas' });
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (ventasData: Venta[]) => {
    const ahora = new Date();
    const hoy = {
      inicio: startOfDay(ahora),
      fin: endOfDay(ahora)
    };
    const semana = {
      inicio: startOfWeek(ahora, { locale: es }),
      fin: endOfWeek(ahora, { locale: es })
    };
    const mes = {
      inicio: startOfMonth(ahora),
      fin: endOfMonth(ahora)
    };

    const ventasCompletas = ventasData.filter(v => v.estado !== 'cancelada');

    const ventasHoy = ventasCompletas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= hoy.inicio && fechaVenta <= hoy.fin;
    });

    const ventasSemana = ventasCompletas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= semana.inicio && fechaVenta <= semana.fin;
    });

    const ventasMes = ventasCompletas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= mes.inicio && fechaVenta <= mes.fin;
    });

    setEstadisticas({
      totalVentas: ventasCompletas.length,
      montoTotal: ventasCompletas.reduce((sum, v) => sum + Number(v.total), 0),
      ventasHoy: ventasHoy.length,
      montoHoy: ventasHoy.reduce((sum, v) => sum + Number(v.total), 0),
      ventasSemana: ventasSemana.length,
      montoSemana: ventasSemana.reduce((sum, v) => sum + Number(v.total), 0),
      ventasMes: ventasMes.length,
      montoMes: ventasMes.reduce((sum, v) => sum + Number(v.total), 0)
    });
  };

  const aplicarFiltros = () => {
    let filtradas = [...ventas];

    // Filtro por texto
    if (filtroTexto) {
      filtradas = filtradas.filter(v =>
        v.numero.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        v.cliente?.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        v.items.some(item => item.producto.nombre.toLowerCase().includes(filtroTexto.toLowerCase()))
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(v => v.estado === filtroEstado);
    }

    // Filtro por método de pago
    if (filtroMetodoPago !== 'todos') {
      filtradas = filtradas.filter(v => v.metodoPago === filtroMetodoPago);
    }

    // Filtro por fecha
    const ahora = new Date();
    let fechaInicioPeriodo: Date;
    let fechaFinPeriodo: Date;

    switch (periodo) {
      case 'hoy':
        fechaInicioPeriodo = startOfDay(ahora);
        fechaFinPeriodo = endOfDay(ahora);
        break;
      case 'ayer': {
        const ayer = subDays(ahora, 1);
        fechaInicioPeriodo = startOfDay(ayer);
        fechaFinPeriodo = endOfDay(ayer);
        break;
      }
      case 'semana':
        fechaInicioPeriodo = startOfWeek(ahora, { locale: es });
        fechaFinPeriodo = endOfWeek(ahora, { locale: es });
        break;
      case 'mes':
        fechaInicioPeriodo = startOfMonth(ahora);
        fechaFinPeriodo = endOfMonth(ahora);
        break;
      case 'personalizado':
        if (fechaInicio && fechaFin) {
          fechaInicioPeriodo = startOfDay(new Date(fechaInicio));
          fechaFinPeriodo = endOfDay(new Date(fechaFin));
        } else {
          setVentasFiltradas(filtradas);
          return;
        }
        break;
      default:
        setVentasFiltradas(filtradas);
        return;
    }

    filtradas = filtradas.filter(v => {
      const fechaVenta = new Date(v.fechaVenta);
      return fechaVenta >= fechaInicioPeriodo && fechaVenta <= fechaFinPeriodo;
    });

    setVentasFiltradas(filtradas);
  };

  const eliminarVenta = async (ventaId: string) => {
    try {
      const response = await fetch(`/api/ventas/${ventaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Actualizar la lista de ventas
        setVentas(ventas.filter(v => v.id !== ventaId));
        setMessage({ type: 'success', text: 'Venta eliminada exitosamente' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Error al eliminar la venta' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error eliminando venta:', error);
      setMessage({ type: 'error', text: 'Error de conexión al eliminar la venta' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setVentaAEliminar(null);
    }
  };

  const exportarExcel = () => {
    try {
      const datosParaExcel = ventasFiltradas.map(venta => ({
        'Número': venta.numero,
        'Fecha': format(new Date(venta.fechaVenta), 'dd/MM/yyyy HH:mm', { locale: es }),
        'Cliente': venta.cliente?.nombre || 'Cliente sin registro',
        'Teléfono': venta.cliente?.telefono || '',
        'Email': venta.cliente?.email || '',
        'Productos': venta.items.map(item => `${item.producto.nombre} (${item.cantidad})`).join(', '),
        'Subtotal': Number(venta.subtotal),
        'Descuentos': Number(venta.descuentos),
        'Total': Number(venta.total),
        'Método de Pago': venta.metodoPago || '',
        'Estado': venta.estado,
        'Notas': venta.notas || '',
        'Tienda': venta.tienda.nombre
      }));

      const worksheet = XLSX.utils.json_to_sheet(datosParaExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

      // Establecer anchos de columna
      const wscols = [
        { wch: 15 }, // Número
        { wch: 20 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 15 }, // Teléfono
        { wch: 25 }, // Email
        { wch: 40 }, // Productos
        { wch: 12 }, // Subtotal
        { wch: 12 }, // Descuentos
        { wch: 12 }, // Total
        { wch: 15 }, // Método de Pago
        { wch: 12 }, // Estado
        { wch: 30 }, // Notas
        { wch: 20 }  // Tienda
      ];
      worksheet['!cols'] = wscols;

      const fecha = format(new Date(), 'yyyy-MM-dd', { locale: es });
      XLSX.writeFile(workbook, `ventas_${fecha}.xlsx`);

      setMessage({ type: 'success', text: 'Archivo Excel exportado exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      setMessage({ type: 'error', text: 'Error al exportar archivo Excel' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF();

      // Configurar fuentes y títulos
      doc.setFontSize(20);
      doc.text('NEURAIDEV', 14, 22);
      doc.setFontSize(16);
      doc.text('Registro de Ventas', 14, 32);

      doc.setFontSize(10);
      const fechaReporte = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es });
      doc.text(`Fecha del reporte: ${fechaReporte}`, 14, 42);

      // Estadísticas resumidas
      const totalVentasFiltradas = ventasFiltradas.length;
      const montoTotalFiltrado = ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0);

      doc.text(`Ventas mostradas: ${totalVentasFiltradas}`, 14, 52);
      doc.text(`Monto total: ${formatPrice(montoTotalFiltrado)}`, 14, 58);

      // Preparar datos para la tabla
      const datosTabla = ventasFiltradas.map(venta => [
        venta.numero,
        format(new Date(venta.fechaVenta), 'dd/MM/yyyy', { locale: es }),
        venta.cliente?.nombre || 'Sin registro',
        venta.items.map(item => `${item.producto.nombre} (${item.cantidad})`).join('\n'),
        formatPrice(Number(venta.total)),
        venta.metodoPago || '',
        venta.estado
      ]);

      // Agregar tabla
      autoTable(doc, {
        startY: 70,
        head: [['N° Venta', 'Fecha', 'Cliente', 'Productos', 'Total', 'Pago', 'Estado']],
        body: datosTabla,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [74, 144, 226] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
          2: { cellWidth: 30 },
          3: { cellWidth: 60 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 15 }
        }
      });

      const fecha = format(new Date(), 'yyyy-MM-dd', { locale: es });
      doc.save(`ventas_${fecha}.pdf`);

      setMessage({ type: 'success', text: 'Archivo PDF exportado exitosamente' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      setMessage({ type: 'error', text: 'Error al exportar archivo PDF' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando registro de ventas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Registro de Ventas</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportarExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📊 Exportar Excel
          </button>
          <button
            onClick={exportarPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Hoy</div>
          <div className="text-2xl font-bold text-blue-600">{estadisticas.ventasHoy}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{formatPrice(estadisticas.montoHoy)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Esta Semana</div>
          <div className="text-2xl font-bold text-green-600">{estadisticas.ventasSemana}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{formatPrice(estadisticas.montoSemana)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Este Mes</div>
          <div className="text-2xl font-bold text-purple-600">{estadisticas.ventasMes}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{formatPrice(estadisticas.montoMes)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</div>
          <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{estadisticas.totalVentas}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{formatPrice(estadisticas.montoTotal)}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">🔍 Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Número, cliente, producto..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="semana">Esta semana</option>
              <option value="mes">Este mes</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="enviada">Enviada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Método de Pago</label>
            <select
              value={filtroMetodoPago}
              onChange={(e) => setFiltroMetodoPago(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
            </select>
          </div>
        </div>

        {periodo === 'personalizado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de Ventas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">
            Ventas encontradas: {ventasFiltradas.length}
            {ventasFiltradas.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Total: {formatPrice(ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0))})
              </span>
            )}
          </h3>
        </div>

        {ventasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron ventas con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Venta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Método Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {ventasFiltradas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{venta.numero}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(venta.fechaVenta), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {venta.cliente?.nombre || 'Cliente sin registro'}
                      </div>
                      {venta.cliente?.telefono && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{venta.cliente.telefono}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {venta.items.map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.producto.nombre} x{item.cantidad}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {formatPrice(Number(venta.total))}
                      </div>
                      {Number(venta.descuentos) > 0 && (
                        <div className="text-xs text-gray-500">
                          Desc: {formatPrice(Number(venta.descuentos))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {venta.metodoPago || 'No especificado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        venta.estado === 'completada' ? 'bg-green-100 text-green-800' :
                        venta.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                        venta.estado === 'enviada' ? 'bg-yellow-100 text-yellow-800' :
                        venta.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {venta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setVentaAEliminar(venta.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Eliminar venta"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar venta */}
      {ventaAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setVentaAEliminar(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarVenta(ventaAEliminar)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}