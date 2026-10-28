// Valida y normaliza el enlace al perfil de Facebook que pega un cliente.
// Acepta facebook.com/usuario, profile.php?id=..., m./web./www., fb.com y
// enlaces sin "https://". Devuelve https://www.facebook.com/... o null.
export function normalizarFacebookUrl(entrada) {
  let texto = String(entrada || "").trim();
  if (!texto) return null;
  if (!/^https?:\/\//i.test(texto)) texto = `https://${texto}`;

  let url;
  try {
    url = new URL(texto);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(www|m|web|mbasic)\./, "");
  if (host !== "facebook.com" && host !== "fb.com") return null;

  const ruta = url.pathname.replace(/\/+$/, "");
  if (ruta === "/profile.php") {
    const id = url.searchParams.get("id");
    return id && /^\d+$/.test(id) ? `https://www.facebook.com/profile.php?id=${id}` : null;
  }
  // /usuario o /people/Nombre/123…: solo caracteres seguros
  if (!ruta || ruta === "/" || !/^\/[A-Za-z0-9.\-_/%]+$/.test(ruta)) return null;
  return `https://www.facebook.com${ruta}`;
}
