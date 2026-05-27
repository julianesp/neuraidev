import { NextResponse } from "next/server";
import { d1Select } from "@/lib/db-d1";
import { isAdminServer } from "@/lib/auth/server-roles";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Solo admins
    const user = await currentUser();
    if (!user || !isAdminServer(user)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Agrupar por fecha para evitar duplicados en D1
    const rows = await d1Select(
      "SELECT date, MAX(visits) as visits FROM page_views GROUP BY date ORDER BY date DESC LIMIT 365"
    );

    // --- Semanas del mes actual ---
    const now = new Date();
    const colombiaOffset = -5 * 60;
    const local = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset()) * 60000);
    const year = local.getFullYear();
    const month = local.getMonth(); // 0-based

    // Primer día del mes actual
    const firstDay = new Date(year, month, 1);
    // Último día del mes actual
    const lastDay = new Date(year, month + 1, 0);

    // Dividir el mes en 4 semanas (días 1-7, 8-14, 15-21, 22-fin)
    const weekRanges = [
      { label: "Semana 1", from: 1, to: 7 },
      { label: "Semana 2", from: 8, to: 14 },
      { label: "Semana 3", from: 15, to: 21 },
      { label: "Semana 4", from: 22, to: lastDay.getDate() },
    ];

    const pad = (n) => String(n).padStart(2, "0");
    const monthStr = `${year}-${pad(month + 1)}`;

    const weeksData = weekRanges.map((w) => {
      const total = rows
        .filter((r) => {
          if (!r.date.startsWith(monthStr)) return false;
          const day = parseInt(r.date.split("-")[2]);
          return day >= w.from && day <= w.to;
        })
        .reduce((sum, r) => sum + (r.visits || 0), 0);
      return { label: w.label, visits: total };
    });

    // --- Acumulado por mes (últimos 12 meses) ---
    const monthlyMap = {};
    rows.forEach((r) => {
      const m = r.date.slice(0, 7); // YYYY-MM
      monthlyMap[m] = (monthlyMap[m] || 0) + (r.visits || 0);
    });

    const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const monthlyData = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, visits]) => {
        const [y, m] = key.split("-");
        return { label: `${monthNames[parseInt(m) - 1]} ${y}`, visits };
      });

    // --- Hoy y totales rápidos ---
    const todayStr = `${year}-${pad(month + 1)}-${pad(local.getDate())}`;
    const todayVisits = rows.find((r) => r.date === todayStr)?.visits || 0;
    const monthTotal = weeksData.reduce((s, w) => s + w.visits, 0);
    const allTimeTotal = rows.reduce((s, r) => s + (r.visits || 0), 0);

    // --- Top países del mes actual ---
    const topCountries = await d1Select(
      `SELECT country, country_code, COUNT(*) as visits
       FROM visit_details
       WHERE date LIKE ?
       GROUP BY country_code
       ORDER BY visits DESC
       LIMIT 10`,
      [`${monthStr}%`]
    );

    // --- Top ciudades del mes actual ---
    const topCities = await d1Select(
      `SELECT city, country, COUNT(*) as visits
       FROM visit_details
       WHERE date LIKE ? AND city IS NOT NULL AND city != ''
       GROUP BY city, country
       ORDER BY visits DESC
       LIMIT 10`,
      [`${monthStr}%`]
    );

    // --- Top páginas del mes actual ---
    const topPages = await d1Select(
      `SELECT page, COUNT(*) as visits
       FROM visit_details
       WHERE date LIKE ?
       GROUP BY page
       ORDER BY visits DESC
       LIMIT 10`,
      [`${monthStr}%`]
    );

    // --- Dispositivos del mes actual ---
    const devices = await d1Select(
      `SELECT device, COUNT(*) as visits
       FROM visit_details
       WHERE date LIKE ?
       GROUP BY device
       ORDER BY visits DESC`,
      [`${monthStr}%`]
    );

    return NextResponse.json({
      today: todayVisits,
      monthTotal,
      allTimeTotal,
      weeks: weeksData,
      monthly: monthlyData,
      topCountries,
      topCities,
      topPages,
      devices,
    });
  } catch (e) {
    console.error("[stats] Exception:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
