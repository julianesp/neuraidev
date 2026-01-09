import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Hacer fetch de la URL para obtener los metadatos
    const response = await fetch(url, {
      headers: {
        "User-Agent": "WhatsApp/2.23.20.70",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL", status: response.status },
        { status: 500 }
      );
    }

    const html = await response.text();

    // Extraer metadatos Open Graph
    const ogTags = {};
    const ogRegex = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["']/gi;
    let match;

    while ((match = ogRegex.exec(html)) !== null) {
      ogTags[match[1]] = match[2];
    }

    // Extraer metadatos Twitter Card
    const twitterTags = {};
    const twitterRegex =
      /<meta\s+name=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']/gi;

    while ((match = twitterRegex.exec(html)) !== null) {
      twitterTags[match[1]] = match[2];
    }

    // Extraer título y descripción regulares
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descriptionMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
    );

    return NextResponse.json({
      url,
      title: titleMatch ? titleMatch[1] : null,
      description: descriptionMatch ? descriptionMatch[1] : null,
      openGraph: ogTags,
      twitter: twitterTags,
      hasImage: !!ogTags.image,
      hasTitle: !!ogTags.title,
      hasDescription: !!ogTags.description,
      isValid:
        !!ogTags.image && !!ogTags.title && !!ogTags.description,
    });
  } catch (error) {
    console.error("Error validating metadata:", error);
    return NextResponse.json(
      { error: "Failed to validate metadata", details: error.message },
      { status: 500 }
    );
  }
}
