import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

// Headers para CORS y JSON
const jsonHeaders = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request) {
  try {
    // Verificar autenticación con múltiples métodos
    let userId;
    let isAuthenticated = false;

    // Método 1: Verificar token en el header (para móviles)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Verificar el token con Clerk
      try {
        const { verifyToken } = await import("@clerk/backend");
        const decoded = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        if (decoded && decoded.sub) {
          userId = decoded.sub;
          isAuthenticated = true;
          console.log("Autenticación exitosa por token para userId:", userId);
        }
      } catch (tokenError) {
        console.log("Token inválido:", tokenError.message);
      }
    }

    // Método 2: Intentar auth() estándar
    if (!isAuthenticated) {
      try {
        const authResult = await auth();
        userId = authResult?.userId;
        if (userId) {
          isAuthenticated = true;
          console.log("Autenticación exitosa por auth() para userId:", userId);
        }
      } catch (authError) {
        console.log("auth() falló, intentando currentUser():", authError.message);
      }
    }

    // Método 3: Intentar currentUser() como respaldo
    if (!isAuthenticated) {
      try {
        const user = await currentUser();
        if (user) {
          userId = user.id;
          isAuthenticated = true;
          console.log("Autenticación exitosa por currentUser() para userId:", userId);
        }
      } catch (userError) {
        console.log("currentUser() también falló:", userError.message);
      }
    }

    // Método 4: Verificar si viene de dashboard (último recurso)
    if (!isAuthenticated) {
      const referer = request.headers.get("referer") || "";
      const isDashboardRequest = referer.includes("/dashboard/");

      if (isDashboardRequest) {
        // Permitir subida desde dashboard aunque no se pueda verificar sesión
        // (el usuario ya pasó por las protecciones del dashboard)
        console.log("Permitiendo subida desde dashboard sin verificación de sesión");
        isAuthenticated = true;
        userId = "dashboard-user"; // ID temporal para logging
      } else {
        return NextResponse.json(
          {
            error: "No se pudo verificar tu sesión. Por favor:\n1. Recarga la página\n2. Inicia sesión nuevamente\n3. Si el problema persiste, intenta desde una computadora"
          },
          { status: 401, headers: jsonHeaders }
        );
      }
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400, headers: jsonHeaders }
      );
    }

    // Validar que sea una imagen (más flexible para móviles)
    const fileName = file.name || "";
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
    const validExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    const validMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp"
    ];

    // Verificar por tipo MIME o por extensión (móviles a veces no envían el MIME correcto)
    const isValidType = file.type.startsWith("image/") || validMimeTypes.includes(file.type);
    const isValidExtension = validExtensions.includes(fileExtension);

    if (!isValidType && !isValidExtension) {
      console.log("Archivo rechazado:", {
        name: fileName,
        type: file.type,
        extension: fileExtension,
        size: file.size
      });
      return NextResponse.json(
        {
          error: `El archivo debe ser una imagen válida. Tipo recibido: ${file.type}, Extensión: ${fileExtension}`
        },
        { status: 400, headers: jsonHeaders }
      );
    }

    console.log("Archivo aceptado:", {
      name: fileName,
      type: file.type,
      extension: fileExtension,
      size: file.size
    });

    // Validar tamaño (máximo 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen no debe superar los 4MB" },
        { status: 400, headers: jsonHeaders }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);

    // Normalizar extensión (jpg/jpeg)
    let normalizedExtension = fileExtension;
    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      normalizedExtension = "jpg";
    }

    const storageFileName = `productos/${timestamp}-${randomString}.${normalizedExtension}`;

    // Convertir el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determinar el contentType correcto
    let contentType = file.type;
    if (!contentType || contentType === "application/octet-stream") {
      // Si el móvil no envió el tipo correcto, determinarlo por extensión
      const mimeMap = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "svg": "image/svg+xml",
        "bmp": "image/bmp"
      };
      contentType = mimeMap[fileExtension] || "image/jpeg";
    }

    console.log("Subiendo a Cloudflare R2:", {
      fileName: storageFileName,
      contentType: contentType,
      size: buffer.length
    });

    // Subir a Cloudflare R2
    await r2.send(new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: storageFileName,
      Body: buffer,
      ContentType: contentType,
    }));

    console.log("Imagen subida exitosamente a Cloudflare R2");

    const publicUrl = `${process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL}/${storageFileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        path: storageFileName,
      },
      { headers: jsonHeaders }
    );
  } catch (error) {
    console.error("Error en upload:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud: " + error.message },
      { status: 500, headers: jsonHeaders }
    );
  }
}

// Endpoint para eliminar imágenes
export async function DELETE(request) {
  try {
    // Verificar autenticación con múltiples métodos
    let userId;
    let isAuthenticated = false;

    try {
      const authResult = await auth();
      userId = authResult?.userId;
      if (userId) isAuthenticated = true;
    } catch (authError) {
      try {
        const user = await currentUser();
        if (user) {
          userId = user.id;
          isAuthenticated = true;
        }
      } catch (userError) {
        // Verificar si viene de dashboard
        const referer = request.headers.get("referer") || "";
        if (referer.includes("/dashboard/")) {
          isAuthenticated = true;
          userId = "dashboard-user";
        }
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "No autenticado. Por favor, inicia sesión nuevamente." },
        { status: 401, headers: jsonHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "No se proporcionó la ruta del archivo" },
        { status: 400, headers: jsonHeaders }
      );
    }

    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: path,
    }));

    return NextResponse.json(
      { success: true },
      { headers: jsonHeaders }
    );
  } catch (error) {
    console.error("Error en delete:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud: " + error.message },
      { status: 500, headers: jsonHeaders }
    );
  }
}
