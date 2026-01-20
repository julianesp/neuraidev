import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL es requerida" },
        { status: 400 }
      );
    }

    // Detectar si es Facebook
    const esFacebook = url.includes("facebook.com");

    // Para Facebook, devolver estructura básica
    if (esFacebook) {
      return NextResponse.json({
        titulo: "",
        descripcion: "",
        imagen: "",
        sitioWeb: "Facebook",
        manual: true, // Indicar que debe completarse manualmente
        mensaje: "Facebook requiere que ingreses los datos manualmente"
      });
    }

    // Hacer fetch de la URL con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Error al obtener la página");
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraer metadatos Open Graph y Twitter Cards
    const metadatos = {
      titulo:
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $("title").text() ||
        "",

      descripcion:
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="twitter:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "",

      imagen:
        $('meta[property="og:image"]').attr("content") ||
        $('meta[name="twitter:image"]').attr("content") ||
        $('meta[itemprop="image"]').attr("content") ||
        "",

      sitioWeb:
        $('meta[property="og:site_name"]').attr("content") ||
        new URL(url).hostname,
    };

    // Si la imagen es relativa, convertirla a absoluta
    if (metadatos.imagen && !metadatos.imagen.startsWith("http")) {
      const baseUrl = new URL(url);
      metadatos.imagen = new URL(metadatos.imagen, baseUrl.origin).href;
    }

    return NextResponse.json(metadatos);
  } catch (error) {
    console.error("Error al extraer metadatos:", error);

    // Devolver estructura para completar manualmente
    return NextResponse.json({
      titulo: "",
      descripcion: "",
      imagen: "",
      sitioWeb: "",
      manual: true,
      mensaje: "No se pudieron extraer los metadatos automáticamente. Por favor, ingresa los datos manualmente."
    });
  }
}
