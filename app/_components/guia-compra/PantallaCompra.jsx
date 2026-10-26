"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Mouse,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import {
  anim,
  AppBar,
  Btn,
  Dots,
  Field,
  Layer,
  Pop,
  Tap,
  Toast,
  Typed,
  usePrefersReducedMotion,
} from "./ui";

const PRODUCTO = { nombre: "Mouse Logitech G304", precio: "$ 59.900" };

function CarritoIcono({ cantidad }) {
  return (
    <span className="relative">
      <ShoppingCart className="h-4 w-4" />
      {cantidad > 0 && (
        <span
          className={`${anim.pop} absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-blue-600`}
          style={{ animationDelay: "1100ms" }}
        >
          {cantidad}
        </span>
      )}
    </span>
  );
}

/** Cambia de "Pendiente" a "Aceptada" tras un momento (solo se monta en su paso). */
function EstadoPago() {
  const reduced = usePrefersReducedMotion();
  const [aceptada, setAceptada] = useState(reduced);

  useEffect(() => {
    if (aceptada) return;
    const id = window.setTimeout(() => setAceptada(true), 1600);
    return () => window.clearTimeout(id);
  }, [aceptada]);

  if (!aceptada) {
    return (
      <div className="flex flex-col items-center gap-3 pt-10 text-center">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-800">
          Pendiente
        </span>
        <p className="text-[12px] text-slate-600">
          Confirmando tu pago con ePayco
        </p>
        <Dots />
      </div>
    );
  }

  return (
    <Pop className="flex flex-col items-center gap-2 pt-8 text-center">
      <CheckCircle2 className="h-14 w-14 text-blue-600" />
      <p className="text-[15px] font-bold text-slate-900">¡Pago aceptado!</p>
      <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
        Aceptada
      </span>
      <div className="mt-3 w-full space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-left text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Producto</span>
          <span className="font-medium">{PRODUCTO.nombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Método</span>
          <span className="font-medium">Nequi</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total</span>
          <span className="font-bold">{PRODUCTO.precio}</span>
        </div>
      </div>
    </Pop>
  );
}

function MetodoPago({ icono: Icono, nombre, detalle, elegido = false, tap = false }) {
  return (
    <div
      className={`relative flex items-center gap-2.5 rounded-lg border bg-white p-2.5 transition-all duration-500 ${
        elegido ? "border-blue-600 ring-2 ring-blue-600/25" : "border-slate-200"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-600">
        <Icono className="h-4 w-4" />
      </span>
      <span className="flex-1">
        <span className="block text-[12px] font-semibold text-slate-800">
          {nombre}
        </span>
        <span className="block text-[10px] text-slate-500">{detalle}</span>
      </span>
      <Tap show={tap} delay={900} />
    </div>
  );
}

export default function PantallaCompra({ step }) {
  return (
    <>
      {/* 0. Producto */}
      <Layer active={step === 0}>
        <AppBar
          title="neurai.dev"
          right={<CarritoIcono cantidad={step === 0 ? 1 : 0} />}
        />
        <div className="flex-1 space-y-3 p-3">
          <div className="flex h-36 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-slate-100">
            <Mouse className="h-16 w-16 text-blue-600" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900">
              {PRODUCTO.nombre}
            </p>
            <p className="text-[16px] font-bold text-blue-600">
              {PRODUCTO.precio}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Inalámbrico · 12.000 DPI · Envío gratis en el Alto Putumayo
            </p>
          </div>
          <Btn tap={step === 0} tapDelay={500}>
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </Btn>
        </div>
        <Toast show={step === 0} delay={1100}>
          Agregado al carrito
        </Toast>
      </Layer>

      {/* 1. Carrito */}
      <Layer active={step === 1}>
        <AppBar title="Tu carrito" />
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50">
              <Mouse className="h-5 w-5 text-blue-600" />
            </span>
            <span className="flex-1">
              <span className="block text-[12px] font-medium">
                {PRODUCTO.nombre}
              </span>
              <span className="block text-[11px] text-slate-500">Cantidad: 1</span>
            </span>
            <span className="text-[12px] font-semibold">{PRODUCTO.precio}</span>
          </div>
          <div className="mt-auto space-y-2 border-t border-slate-200 pt-3">
            <div className="flex justify-between text-[13px] font-bold">
              <span>Total</span>
              <span>{PRODUCTO.precio}</span>
            </div>
            <Btn tap={step === 1} tapDelay={900}>
              Proceder al pago
            </Btn>
          </div>
        </div>
      </Layer>

      {/* 2. Datos de envío */}
      <Layer active={step === 2}>
        <AppBar title="Datos de envío" />
        <div className="flex-1 space-y-2 p-3">
          <Field label="Nombre completo *" active={step === 2}>
            {step === 2 && <Typed text="Ana Gómez" />}
          </Field>
          <Field label="Correo (aquí llega tu factura) *" active={step === 2}>
            {step === 2 && <Typed text="ana@correo.com" delayMs={700} />}
          </Field>
          <Field label="Teléfono *" active={step === 2}>
            {step === 2 && <Typed text="320 123 4567" delayMs={1600} />}
          </Field>
          <Field label="Dirección y ciudad *" active={step === 2}>
            {step === 2 && <Typed text="Cra 5 #3-20, Colón" delayMs={2400} />}
          </Field>
        </div>
        <div className="p-3">
          <Btn tap={step === 2} tapDelay={4300}>
            Pagar {PRODUCTO.precio}
          </Btn>
        </div>
      </Layer>

      {/* 3-4. Checkout ePayco + aprobación en Nequi */}
      <Layer active={step === 3 || step === 4}>
        <AppBar
          title="ePayco · Pago seguro"
          className="bg-blue-900"
          right={<ShieldCheck className="h-4 w-4" />}
        />
        <div className="flex-1 space-y-2 p-3">
          <div className="rounded-lg bg-white p-3 text-center shadow-sm">
            <p className="text-[10px] text-slate-500">Total a pagar</p>
            <p className="text-[18px] font-bold text-slate-900">
              {PRODUCTO.precio}
            </p>
          </div>
          <p className="pt-1 text-[11px] font-semibold text-slate-600">
            Elige cómo pagar
          </p>
          <MetodoPago
            icono={CreditCard}
            nombre="Tarjeta"
            detalle="Crédito o débito"
          />
          <MetodoPago icono={Building2} nombre="PSE" detalle="Desde tu banco" />
          <MetodoPago
            icono={Smartphone}
            nombre="Nequi"
            detalle="Aprueba en tu celular"
            elegido={step === 4}
            tap={step === 3}
          />
          {step === 4 && (
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-600">
              Esperando aprobación <Dots />
            </div>
          )}
        </div>
        {step === 4 && (
          <div
            className={`${anim.drop} absolute inset-x-2 top-7 z-20 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200`}
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Smartphone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[11px] font-bold">Nequi</span>
                <span className="block text-[10px] text-slate-500">
                  ¿Apruebas el pago de {PRODUCTO.precio} a ePayco?
                </span>
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <Btn outline>Rechazar</Btn>
              <Btn tap tapDelay={1500}>
                Aceptar
              </Btn>
            </div>
          </div>
        )}
      </Layer>

      {/* 5. Respuesta de pago */}
      <Layer active={step === 5}>
        <AppBar title="Respuesta del pago" />
        <div className="flex-1 p-3">{step === 5 && <EstadoPago />}</div>
      </Layer>

      {/* 6. Factura y coordinación */}
      <Layer active={step === 6}>
        <AppBar title="Tu pedido" />
        <div className="flex-1 space-y-3 p-3">
          {step === 6 && (
            <>
              <Pop className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-[12px] font-semibold">
                    Factura electrónica
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    Enviada a ana@correo.com · PDF
                  </span>
                </span>
              </Pop>
              <Pop
                delay={900}
                className="mr-6 rounded-2xl rounded-tl-sm bg-blue-600 p-3 text-[12px] text-white"
              >
                <span className="mb-1 block text-[10px] font-semibold text-blue-100">
                  Neurai · Soporte
                </span>
                ¡Hola Ana! Recibimos tu pago. ¿A qué hora te queda bien la
                entrega?
              </Pop>
              <Pop
                delay={1900}
                className="ml-10 rounded-2xl rounded-tr-sm bg-white p-3 text-[12px] text-slate-800 ring-1 ring-slate-200"
              >
                Hoy en la tarde, ¡gracias! 🙌
              </Pop>
            </>
          )}
        </div>
        <Toast show={step === 6} delay={2800}>
          Pedido confirmado
        </Toast>
      </Layer>
    </>
  );
}
