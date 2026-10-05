// Informe del presupuesto en PDF, pensado para cualquier persona: resumen,
// gráficas y detalle del mes. jsPDF se carga solo al pulsar el botón.

const AZUL = [37, 99, 235];
const VERDE = [22, 163, 74];
const ROJO = [220, 38, 38];
const NARANJA = [217, 119, 6];
const ESMERALDA = [5, 150, 105];
const GRIS = [107, 114, 128];
const GRIS_CLARO = [229, 231, 235];
const TEXTO = [17, 24, 39];

const M = 15; // margen
const ANCHO = 210;
const UTIL = ANCHO - M * 2;

const hexARgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// jsPDF usa fuentes estándar (Latin-1): sin espacios duros ni signos raros
const cop = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  })
    .format(Math.round(n || 0))
    .replace(/ /g, " ");

const copCorto = (n) => {
  const v = Math.abs(n);
  const signo = n < 0 ? "-" : "";
  if (v >= 1e6) return `${signo}$${(v / 1e6).toFixed(1).replace(".", ",")}M`;
  if (v >= 1e3) return `${signo}$${Math.round(v / 1e3)}k`;
  return `${signo}$${Math.round(v)}`;
};

export async function generarInformePDF({
  datos,
  mes,
  calcularMes,
  categoriaPorId,
  nombreMes,
}) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const calc = calcularMes(datos, mes);
  const datosMes = {
    ingresos: [],
    gastos: [],
    fijosPagados: {},
    sueldoRecibido: false,
    ...(datos.meses[mes] || {}),
  };

  const color = (c) => doc.setTextColor(...c);
  const relleno = (c) => doc.setFillColor(...c);
  const fuente = (estilo, tam) => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tam);
  };

  let y = 0;

  const titulo = (texto, sub) => {
    if (y > 250) {
      doc.addPage();
      y = M;
    }
    fuente("bold", 13);
    color(TEXTO);
    doc.text(texto, M, y);
    y += 5;
    if (sub) {
      fuente("normal", 8.5);
      color(GRIS);
      const lineas = doc.splitTextToSize(sub, UTIL);
      doc.text(lineas, M, y);
      y += lineas.length * 3.8;
    }
    y += 3;
  };

  // ── Encabezado ──
  relleno(AZUL);
  doc.rect(0, 0, ANCHO, 34, "F");
  fuente("bold", 20);
  color([255, 255, 255]);
  doc.text("Informe de presupuesto", M, 15);
  fuente("normal", 12);
  doc.text(nombreMes(mes), M, 23);
  fuente("normal", 8.5);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}  |  neurai.dev/herramientas/presupuesto`,
    M,
    29.5,
  );
  y = 44;

  // ── Tarjetas de resumen ──
  const tarjetas = [
    [
      "Ingresos del mes",
      cop(calc.ingresosPrevistos),
      `Recibido: ${cop(calc.ingresosRecibidos)}`,
      VERDE,
    ],
    [
      "Gastos del mes",
      cop(calc.gastosTotales),
      `Fijos ${copCorto(calc.totalFijos)} | Otros ${copCorto(calc.totalVariables)}`,
      ROJO,
    ],
    [
      "Te queda disponible",
      cop(calc.disponible),
      calc.disponible < 0
        ? "Gastas más de lo que ganas"
        : "Después de todos los gastos",
      calc.disponible < 0 ? ROJO : AZUL,
    ],
    [
      `Meta de ahorro (${datos.metaAhorroPct}%)`,
      cop(calc.metaAhorro),
      calc.ingresosPrevistos === 0
        ? "Sin ingresos registrados"
        : calc.ahorroReal >= calc.metaAhorro
          ? "Meta cumplida"
          : `Faltan ${cop(calc.metaAhorro - calc.ahorroReal)}`,
      ESMERALDA,
    ],
  ];
  const anchoT = (UTIL - 3 * 4) / 4;
  tarjetas.forEach(([t, v, d, c], i) => {
    const x = M + i * (anchoT + 4);
    relleno([249, 250, 251]);
    doc.setDrawColor(...GRIS_CLARO);
    doc.roundedRect(x, y, anchoT, 24, 2.5, 2.5, "FD");
    relleno(c);
    doc.rect(x, y + 3, 1.2, 18, "F");
    fuente("normal", 7.5);
    color(GRIS);
    doc.text(t, x + 4, y + 6.5);
    fuente("bold", 12);
    color(c);
    doc.text(v, x + 4, y + 13.5);
    fuente("normal", 6.8);
    color(GRIS);
    doc.text(doc.splitTextToSize(d, anchoT - 6), x + 4, y + 18.5);
  });
  y += 32;

  // ── Barra de uso ──
  const pct =
    calc.ingresosPrevistos > 0
      ? (calc.gastosTotales / calc.ingresosPrevistos) * 100
      : 0;
  fuente("normal", 9);
  color(TEXTO);
  doc.text(`Has comprometido el ${pct.toFixed(0)}% de tus ingresos`, M, y);
  fuente("bold", 9);
  doc.text(
    `${cop(calc.gastosTotales)} de ${cop(calc.ingresosPrevistos)}`,
    ANCHO - M,
    y,
    { align: "right" },
  );
  y += 3;
  relleno(GRIS_CLARO);
  doc.roundedRect(M, y, UTIL, 4, 2, 2, "F");
  relleno(pct >= 100 ? ROJO : pct >= 80 ? NARANJA : VERDE);
  if (pct > 0)
    doc.roundedRect(M, y, (UTIL * Math.min(pct, 100)) / 100, 4, 2, 2, "F");
  y += 14;

  // ── Gráfica: gastos por categoría ──
  const categorias = Object.entries(calc.porCategoria).sort(
    (a, b) => b[1] - a[1],
  );
  titulo(
    "Tus gastos por categoría",
    "Cuánto gastaste en cada tipo de cosa este mes y qué parte de todos tus gastos representa.",
  );
  if (categorias.length === 0) {
    fuente("italic", 9);
    color(GRIS);
    doc.text("Aún no hay gastos registrados este mes.", M, y);
    y += 8;
  } else {
    const max = categorias[0][1];
    const xBarra = M + 52;
    const anchoBarra = UTIL - 52 - 42;
    categorias.forEach(([cat, monto]) => {
      const info = categoriaPorId[cat];
      const c = info ? hexARgb(info.color) : GRIS;
      fuente("normal", 8.5);
      color(TEXTO);
      doc.text(info?.nombre || cat, M, y + 3.2);
      relleno([243, 244, 246]);
      doc.roundedRect(xBarra, y, anchoBarra, 4.5, 1.5, 1.5, "F");
      relleno(c);
      doc.roundedRect(
        xBarra,
        y,
        Math.max((anchoBarra * monto) / max, 1.5),
        4.5,
        1.5,
        1.5,
        "F",
      );
      fuente("bold", 8.5);
      doc.text(cop(monto), ANCHO - M - 12, y + 3.2, { align: "right" });
      fuente("normal", 8);
      color(GRIS);
      doc.text(
        `${((monto / calc.gastosTotales) * 100).toFixed(0)}%`,
        ANCHO - M,
        y + 3.2,
        { align: "right" },
      );
      y += 7.5;
    });
    y += 4;
  }

  // ── Gráfica: regla 50/30/20 ──
  titulo(
    "¿Cómo repartes tu dinero? (regla 50/30/20)",
    "Una guía sencilla recomienda usar el 50% de lo que ganas en necesidades (arriendo, mercado, servicios), el 30% en gustos (salidas, ropa, entretenimiento) y ahorrar el 20%. La barra de color es lo tuyo; la línea negra, lo recomendado.",
  );
  if (calc.ingresosPrevistos === 0) {
    fuente("italic", 9);
    color(GRIS);
    doc.text("Agrega tus ingresos para ver esta comparación.", M, y);
    y += 8;
  } else {
    [
      ["Necesidades", calc.porTipo.necesidad, 50, false],
      ["Gustos", calc.porTipo.gusto, 30, false],
      ["Ahorro", calc.ahorroReal, 20, true],
    ].forEach(([nombre, monto, ideal, masEsMejor]) => {
      const p = (monto / calc.ingresosPrevistos) * 100;
      const bien = masEsMejor ? p >= ideal : p <= ideal;
      const c = bien ? VERDE : NARANJA;
      const xB = M + 30;
      const aB = UTIL - 30 - 50;
      fuente("normal", 9);
      color(TEXTO);
      doc.text(nombre, M, y + 4);
      relleno([243, 244, 246]);
      doc.roundedRect(xB, y, aB, 6, 1.5, 1.5, "F");
      relleno(c);
      doc.roundedRect(
        xB,
        y,
        Math.max((aB * Math.min(p, 100)) / 100, 1.5),
        6,
        1.5,
        1.5,
        "F",
      );
      // marca de lo recomendado
      doc.setDrawColor(...TEXTO);
      doc.setLineWidth(0.6);
      const xi = xB + (aB * ideal) / 100;
      doc.line(xi, y - 1, xi, y + 7);
      fuente("bold", 9);
      color(c);
      doc.text(`${p.toFixed(0)}%`, xB + aB + 4, y + 4.3);
      fuente("normal", 7.5);
      color(GRIS);
      doc.text(
        `${bien ? "Bien" : masEsMejor ? "Por debajo" : "Por encima"} (ideal ${ideal}%)`,
        xB + aB + 15,
        y + 4.3,
      );
      y += 10;
    });
    y += 4;
  }

  // ── Gráfica: ingresos vs gastos del año ──
  const anio = mes.slice(0, 4);
  const mesesAnio = Array.from(
    { length: 12 },
    (_, i) => `${anio}-${String(i + 1).padStart(2, "0")}`,
  ).filter((k) => k === mes || datos.meses[k]);
  if (mesesAnio.length > 1) {
    if (y > 200) {
      doc.addPage();
      y = M;
    }
    titulo(
      `Ingresos y gastos en ${anio}`,
      "Compara mes a mes cuánto ganaste (verde) y cuánto gastaste (rojo).",
    );
    const resumenes = mesesAnio.map((k) => ({ k, ...calcularMes(datos, k) }));
    const maxV = Math.max(
      1,
      ...resumenes.flatMap((r) => [r.ingresosPrevistos, r.gastosTotales]),
    );
    const alto = 45;
    const base = y + alto;
    const grupo = UTIL / resumenes.length;
    const barra = Math.min(grupo * 0.32, 9);
    doc.setDrawColor(...GRIS_CLARO);
    doc.setLineWidth(0.2);
    [0.25, 0.5, 0.75, 1].forEach((f) =>
      doc.line(M, base - alto * f, ANCHO - M, base - alto * f),
    );
    resumenes.forEach((r, i) => {
      const cx = M + grupo * i + grupo / 2;
      const hI = (alto * r.ingresosPrevistos) / maxV;
      const hG = (alto * r.gastosTotales) / maxV;
      relleno(VERDE);
      if (hI > 0) doc.rect(cx - barra - 0.5, base - hI, barra, hI, "F");
      relleno(ROJO);
      if (hG > 0) doc.rect(cx + 0.5, base - hG, barra, hG, "F");
      fuente("normal", 6.5);
      color(GRIS);
      if (hI > 0)
        doc.text(
          copCorto(r.ingresosPrevistos),
          cx - barra / 2 - 0.5,
          base - hI - 1,
          { align: "center" },
        );
      if (hG > 0)
        doc.text(
          copCorto(r.gastosTotales),
          cx + barra / 2 + 0.5,
          base - hG - 1,
          { align: "center" },
        );
      fuente(r.k === mes ? "bold" : "normal", 8);
      color(TEXTO);
      const nombre = new Date(Number(anio), Number(r.k.slice(5)) - 1, 1)
        .toLocaleDateString("es-CO", { month: "short" })
        .replace(".", "");
      doc.text(
        nombre.charAt(0).toUpperCase() + nombre.slice(1),
        cx,
        base + 4.5,
        { align: "center" },
      );
    });
    doc.setDrawColor(...GRIS);
    doc.line(M, base, ANCHO - M, base);
    y = base + 12;
  }

  // ── Consejos automáticos ──
  const consejos = [];
  if (calc.ingresosPrevistos === 0) {
    consejos.push(
      "Registra tu sueldo y lo que esperas ganar para que el informe pueda orientarte.",
    );
  } else {
    if (calc.disponible < 0)
      consejos.push(
        `Este mes tus gastos superan tus ingresos en ${cop(-calc.disponible)}. Revisa qué gastos puedes reducir o aplazar.`,
      );
    else
      consejos.push(
        `Te quedan ${cop(calc.disponible)} libres este mes. Si los apartas apenas recibes tu pago, es más fácil no gastarlos.`,
      );
    if (categorias[0])
      consejos.push(
        `Donde más gastas es en "${categoriaPorId[categorias[0][0]]?.nombre || categorias[0][0]}" (${cop(categorias[0][1])}).`,
      );
    const pNec = (calc.porTipo.necesidad / calc.ingresosPrevistos) * 100;
    if (pNec > 50)
      consejos.push(
        `Tus necesidades se llevan el ${pNec.toFixed(0)}% de tus ingresos (lo ideal es 50%). Compara precios de servicios, plan de celular o mercado.`,
      );
    const pGus = (calc.porTipo.gusto / calc.ingresosPrevistos) * 100;
    if (pGus > 30)
      consejos.push(
        `Los gustos suman el ${pGus.toFixed(0)}% de tus ingresos (lo ideal es 30%). Ponles un tope mensual.`,
      );
    if (calc.ahorroReal >= calc.metaAhorro)
      consejos.push(
        `¡Bien! Cumples tu meta de ahorrar el ${datos.metaAhorroPct}% de tus ingresos.`,
      );
    else
      consejos.push(
        `Para cumplir tu meta de ahorro te faltan ${cop(calc.metaAhorro - calc.ahorroReal)}.`,
      );
    const pendientes = datos.fijos.filter((f) => !datosMes.fijosPagados[f.id]);
    if (pendientes.length)
      consejos.push(
        `Tienes ${pendientes.length} gasto(s) fijo(s) por pagar: ${pendientes.map((f) => f.concepto).join(", ")}.`,
      );
  }
  titulo("Recomendaciones para ti");
  consejos.forEach((c) => {
    fuente("normal", 9);
    const lineas = doc.splitTextToSize(c, UTIL - 6);
    if (y + lineas.length * 4.2 > 282) {
      doc.addPage();
      y = M;
    }
    relleno(AZUL);
    doc.circle(M + 1.2, y - 1.1, 0.9, "F");
    fuente("normal", 9);
    color(TEXTO);
    doc.text(lineas, M + 5, y);
    y += lineas.length * 4.2 + 2;
  });

  // ── Detalle (tablas) ──
  doc.addPage();
  y = M + 2;
  fuente("bold", 15);
  color(TEXTO);
  doc.text(`Detalle de ${nombreMes(mes).toLowerCase()}`, M, y);
  y += 6;

  const tabla = (encabezado, cuerpo, total, colorTitulo, tituloTabla) => {
    fuente("bold", 11);
    color(colorTitulo);
    doc.text(tituloTabla, M, y + 4);
    autoTable(doc, {
      startY: y + 6,
      head: [encabezado],
      body: cuerpo.length
        ? cuerpo
        : [
            [
              {
                content: "Sin registros",
                colSpan: encabezado.length,
                styles: {
                  halign: "center",
                  textColor: GRIS,
                  fontStyle: "italic",
                },
              },
            ],
          ],
      foot: cuerpo.length ? [total] : undefined,
      theme: "striped",
      margin: { left: M, right: M },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2 },
      headStyles: { fillColor: colorTitulo, textColor: 255 },
      footStyles: {
        fillColor: [243, 244, 246],
        textColor: TEXTO,
        fontStyle: "bold",
      },
      // La última columna (monto) va a la derecha en encabezado, filas y total
      didParseCell: (d) => {
        if (d.column.index === encabezado.length - 1) {
          d.cell.styles.halign = "right";
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  };

  const ingresos = [
    ...(calc.sueldo > 0
      ? [
          [
            "Sueldo fijo",
            datosMes.sueldoRecibido ? "Recibido" : "Pendiente",
            cop(calc.sueldo),
          ],
        ]
      : []),
    ...datosMes.ingresos.map((i) => [
      i.concepto,
      i.recibido ? "Recibido" : "Pendiente",
      cop(i.monto),
    ]),
  ];
  tabla(
    ["Concepto", "Estado", "Monto"],
    ingresos,
    ["Total", "", cop(calc.ingresosPrevistos)],
    VERDE,
    "Ingresos",
  );

  tabla(
    ["Concepto", "Categoría", "Estado", "Monto"],
    datos.fijos.map((f) => [
      f.concepto,
      categoriaPorId[f.categoria]?.nombre || f.categoria,
      datosMes.fijosPagados[f.id] ? "Pagado" : "Pendiente",
      cop(f.monto),
    ]),
    ["Total", "", "", cop(calc.totalFijos)],
    ROJO,
    "Gastos fijos",
  );

  tabla(
    ["Fecha", "Concepto", "Categoría", "Monto"],
    [...datosMes.gastos]
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .map((g) => [
        g.fecha
          ? new Date(`${g.fecha}T12:00:00`).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "short",
            })
          : "",
        g.concepto,
        categoriaPorId[g.categoria]?.nombre || g.categoria,
        cop(g.monto),
      ]),
    ["Total", "", "", cop(calc.totalVariables)],
    NARANJA,
    "Otros gastos del mes",
  );

  // ── Pie de página ──
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    fuente("normal", 7.5);
    color(GRIS);
    doc.text("Presupuesto personal | neurai.dev", M, 290);
    doc.text(`Página ${i} de ${paginas}`, ANCHO - M, 290, { align: "right" });
  }

  doc.save(`Presupuesto ${nombreMes(mes)}.pdf`);
}
