/**
 * Parser ligero de user-agent (sin dependencias externas).
 * Extrae tipo de dispositivo, navegador y sistema operativo.
 */
export function parseUserAgent(ua = "") {
  const s = ua || "";

  // Tipo de dispositivo
  let deviceType = "desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(s) || (/Android/i.test(s) && !/Mobile/i.test(s))) {
    deviceType = "tablet";
  } else if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|webOS/i.test(s)) {
    deviceType = "mobile";
  }

  // Sistema operativo
  let os = "Desconocido";
  if (/Windows NT/i.test(s)) os = "Windows";
  else if (/Android/i.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Mac OS X/i.test(s)) os = "macOS";
  else if (/Linux/i.test(s)) os = "Linux";
  else if (/CrOS/i.test(s)) os = "ChromeOS";

  // Navegador (orden importa: Edge/Opera antes que Chrome)
  let browser = "Desconocido";
  if (/Edg\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Internet";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Chrome\//i.test(s)) browser = "Chrome";
  else if (/Safari\//i.test(s) && /Version\//i.test(s)) browser = "Safari";

  return { deviceType, browser, os };
}
