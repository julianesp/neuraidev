"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import styles from "./HistorialCompras.module.scss";
import {
  ShoppingBagIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const ESTADOS = {
  pendiente: { label: "Pendiente", color: "#fbbf24", icon: ClockIcon },
  procesando: { label: "Procesando", color: "#3b82f6", icon: ClockIcon },
  enviado: { label: "Enviado", color: "#8b5cf6", icon: TruckIcon },
  entregado: { label: "Entregado", color: "#10b981", icon: CheckCircleIcon },
  cancelado: { label: "Cancelado", color: "#ef4444", icon: XCircleIcon },
};

export default function HistorialCompras() {
  const toast = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const response = await fetch("/api/perfil/pedidos");
      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
      toast.error("Error al cargar historial de compras");
    } finally {
      setLoading(false);
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className={styles.loading}>Cargando historial...</div>;
  }

  return (
    <div className={styles.historialCompras}>
      <h2 className={styles.title}>
        <ShoppingBagIcon className={styles.titleIcon} />
        Historial de Compras
      </h2>

      {pedidos.length === 0 ? (
        <div className={styles.empty}>
          <ShoppingBagIcon className={styles.emptyIcon} />
          <p>Aún no has realizado ninguna compra</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {pedidos.map((pedido) => {
            const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.pendiente;
            const IconoEstado = estadoInfo.icon;
            const isExpanded = expandedOrders.has(pedido.id);

            return (
              <div key={pedido.id} className={styles.orderCard}>
                <div
                  className={styles.orderHeader}
                  onClick={() => toggleOrder(pedido.id)}
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>
                      #{pedido.numero_orden}
                    </div>
                    <div className={styles.orderDate}>
                      {formatDate(pedido.created_at)}
                    </div>
                  </div>

                  <div className={styles.orderStatus}>
                    <div
                      className={styles.statusBadge}
                      style={{ backgroundColor: estadoInfo.color }}
                    >
                      <IconoEstado className={styles.statusIcon} />
                      {estadoInfo.label}
                    </div>
                  </div>

                  <div className={styles.orderTotal}>
                    ${pedido.total?.toLocaleString()}
                  </div>

                  <button className={styles.toggleBtn}>
                    {isExpanded ? (
                      <ChevronUpIcon className={styles.icon} />
                    ) : (
                      <ChevronDownIcon className={styles.icon} />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className={styles.orderDetails}>
                    {/* Resumen */}
                    <div className={styles.section}>
                      <h4>Resumen del Pedido</h4>
                      <div className={styles.summaryGrid}>
                        <div>
                          <span>Subtotal:</span>
                          <strong>${pedido.subtotal?.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Envío:</span>
                          <strong>${pedido.costo_envio?.toLocaleString()}</strong>
                        </div>
                        <div>
                          <span>Descuentos:</span>
                          <strong className={styles.discount}>
                            -${pedido.descuentos?.toLocaleString()}
                          </strong>
                        </div>
                        <div className={styles.totalRow}>
                          <span>Total:</span>
                          <strong>${pedido.total?.toLocaleString()}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Productos */}
                    <div className={styles.section}>
                      <h4>Productos ({pedido.items?.length || 0})</h4>
                      <div className={styles.itemsList}>
                        {pedido.items?.map((item) => (
                          <div key={item.id} className={styles.item}>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemName}>
                                {item.nombre_producto}
                              </div>
                              <div className={styles.itemQuantity}>
                                Cantidad: {item.cantidad}
                              </div>
                            </div>
                            <div className={styles.itemPrice}>
                              ${item.subtotal?.toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dirección de envío */}
                    {pedido.direccion_envio && (
                      <div className={styles.section}>
                        <h4>Dirección de Envío</h4>
                        <div className={styles.address}>
                          <p>{pedido.direccion_envio.nombre_completo}</p>
                          <p>{pedido.direccion_envio.direccion_linea1}</p>
                          {pedido.direccion_envio.direccion_linea2 && (
                            <p>{pedido.direccion_envio.direccion_linea2}</p>
                          )}
                          <p>
                            {pedido.direccion_envio.ciudad},{" "}
                            {pedido.direccion_envio.departamento}
                          </p>
                          <p>{pedido.direccion_envio.telefono}</p>
                        </div>
                      </div>
                    )}

                    {/* Seguimiento */}
                    {pedido.numero_seguimiento && (
                      <div className={styles.section}>
                        <h4>Información de Envío</h4>
                        <div className={styles.tracking}>
                          <p>
                            <strong>Número de seguimiento:</strong>{" "}
                            {pedido.numero_seguimiento}
                          </p>
                          {pedido.transportadora && (
                            <p>
                              <strong>Transportadora:</strong>{" "}
                              {pedido.transportadora}
                            </p>
                          )}
                          {pedido.fecha_estimada_entrega && (
                            <p>
                              <strong>Fecha estimada:</strong>{" "}
                              {formatDate(pedido.fecha_estimada_entrega)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
