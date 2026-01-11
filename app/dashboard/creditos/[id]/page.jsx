"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  CreditCard,
  Plus,
  CheckCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DetalleCreditoPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [credito, setCredito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarFormPago, setMostrarFormPago] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const [formPago, setFormPago] = useState({
    monto_pago: "",
    metodo_pago: "efectivo",
    notas: "",
  });

  useEffect(() => {
    if (user && id) {
      cargarCredito();
    }
  }, [user, id]);

  async function cargarCredito() {
    try {
      setLoading(true);
      const response = await fetch(`/api/creditos?id=${id}`);
      const data = await response.json();

      if (response.ok && data.creditos && data.creditos.length > 0) {
        setCredito(data.creditos[0]);
      } else {
        throw new Error("Crédito no encontrado");
      }
    } catch (error) {
      console.error("Error cargando crédito:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar el crédito",
      }).then(() => {
        router.push("/dashboard/creditos");
      });
    } finally {
      setLoading(false);
    }
  }

  async function registrarPago(e) {
    e.preventDefault();

    const montoPago = parseFloat(formPago.monto_pago);

    if (montoPago <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Monto inválido",
        text: "El monto debe ser mayor a 0",
      });
      return;
    }

    if (montoPago > credito.monto_pendiente) {
      Swal.fire({
        icon: "warning",
        title: "Monto excedido",
        text: "El monto no puede ser mayor al saldo pendiente",
      });
      return;
    }

    try {
      setProcesandoPago(true);

      const response = await fetch("/api/creditos/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credito_id: id,
          ...formPago,
          monto_pago: montoPago,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Pago registrado!",
          text: "El pago se ha registrado exitosamente",
          timer: 2000,
        });

        // Resetear formulario
        setFormPago({
          monto_pago: "",
          metodo_pago: "efectivo",
          notas: "",
        });
        setMostrarFormPago(false);

        // Recargar crédito
        cargarCredito();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error registrando pago:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo registrar el pago",
      });
    } finally {
      setProcesandoPago(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!credito) {
    return null;
  }

  const fechaLimite = new Date(credito.fecha_limite_pago);
  const diasRestantes = Math.ceil((fechaLimite - new Date()) / (1000 * 60 * 60 * 24));
  const porcentajePagado = (credito.monto_pagado / credito.monto_total) * 100;

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4">
      <Link
        href="/dashboard/creditos"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a créditos
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Detalle del Crédito
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crédito #{credito.id.slice(0, 8)}...
            </p>
          </div>
          <div className="text-right">
            {credito.estado === "pagado_total" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                <CheckCircle className="w-5 h-5" />
                Pagado Completamente
              </span>
            ) : diasRestantes < 0 ? (
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
                Vencido
              </span>
            ) : (
              <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                Pendiente
              </span>
            )}
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Información del Cliente
            </h3>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{credito.nombre_cliente}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{credito.email_cliente}</span>
            </div>
            {credito.telefono_cliente && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{credito.telefono_cliente}</span>
              </div>
            )}
            {credito.cedula_cliente && (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  CC: {credito.cedula_cliente}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Información del Crédito
            </h3>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha de crédito</p>
                <p className="text-gray-700 dark:text-gray-300">
                  {new Date(credito.fecha_credito || credito.created_at).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Fecha límite de pago</p>
                <p className={`font-medium ${diasRestantes < 0 ? 'text-red-600' : diasRestantes <= 3 ? 'text-orange-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {fechaLimite.toLocaleDateString('es-CO')}
                  {diasRestantes >= 0 && ` (${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'})`}
                  {diasRestantes < 0 && ` (Vencido hace ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'día' : 'días'})`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Producto */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Producto</h3>
          <p className="text-gray-700 dark:text-gray-300">{credito.producto_nombre}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cantidad: {credito.cantidad} | Precio unitario: ${Number(credito.producto_precio).toLocaleString('es-CO')}
          </p>
        </div>

        {/* Resumen Financiero */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Resumen Financiero</h3>

          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progreso de pago</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {porcentajePagado.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(porcentajePagado, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto Total</p>
              <p className="text-2xl font-bold text-blue-600">
                ${Number(credito.monto_total).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monto Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                ${Number(credito.monto_pagado).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-red-600">
                ${Number(credito.monto_pendiente).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>

        {/* Notas */}
        {credito.notas && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notas</h3>
            <p className="text-gray-700 dark:text-gray-300">{credito.notas}</p>
          </div>
        )}
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Historial de Pagos
          </h2>
          {credito.estado !== "pagado_total" && (
            <button
              onClick={() => setMostrarFormPago(!mostrarFormPago)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar Pago
            </button>
          )}
        </div>

        {/* Formulario de Nuevo Pago */}
        {mostrarFormPago && (
          <form onSubmit={registrarPago} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nuevo Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPago.monto_pago}
                  onChange={(e) => setFormPago({ ...formPago, monto_pago: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo: ${Number(credito.monto_pendiente).toLocaleString('es-CO')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de pago *
                </label>
                <select
                  value={formPago.metodo_pago}
                  onChange={(e) => setFormPago({ ...formPago, metodo_pago: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas
                </label>
                <input
                  type="text"
                  value={formPago.notas}
                  onChange={(e) => setFormPago({ ...formPago, notas: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                  placeholder="Opcional"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={procesandoPago}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {procesandoPago ? "Procesando..." : "Registrar Pago"}
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormPago(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de Pagos */}
        {credito.pagos && credito.pagos.length > 0 ? (
          <div className="space-y-3">
            {credito.pagos
              .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
              .map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${Number(pago.monto_pago).toLocaleString('es-CO')}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {pago.metodo_pago} • {new Date(pago.fecha_pago).toLocaleDateString('es-CO')}
                      </p>
                      {pago.notas && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {pago.notas}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay pagos registrados aún
          </p>
        )}
      </div>
    </div>
  );
}
