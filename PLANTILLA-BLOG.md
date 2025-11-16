# 📝 Plantilla para Nuevos Artículos de Blog

## Instrucciones de Uso

Esta plantilla te permite crear nuevos artículos de blog con **fecha y tiempo de lectura automáticos**.

---

## ✅ Características Automáticas

1. **Fecha de Publicación**: Se genera automáticamente con la fecha actual
2. **Tiempo de Lectura**: Se calcula automáticamente basado en el contenido
3. **Breadcrumbs**: Se generan automáticamente
4. **SEO**: Schema.org y metadatos incluidos
5. **Formato**: Diseño consistente en todos los artículos

---

## 📋 Plantilla Base

Crea un nuevo archivo en: `src/app/blog/tu-articulo/page.js`

```jsx
import React from "react";
import Link from "next/link";
import BlogArticle from "../../../components/BlogArticle";

export const metadata = {
  title: "Tu Título Completo | Neurai.dev",
  description:
    "Descripción breve y atractiva de tu artículo (150-160 caracteres)",
  keywords: "palabra1, palabra2, palabra3, Colombia",
  authors: [{ name: "Equipo Neurai.dev" }],
  openGraph: {
    title: "Tu Título para Redes Sociales",
    description: "Descripción para cuando se comparta en redes sociales",
    type: "article",
    url: "https://neurai.dev/blog/tu-articulo",
    siteName: "Neurai.dev",
    locale: "es_CO",
    images: [
      {
        url: "https://neurai.dev/images/blog/tu-articulo-og.jpg",
        width: 1200,
        height: 630,
        alt: "Descripción de la imagen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tu Título para Twitter",
    description: "Descripción para Twitter",
    images: ["https://neurai.dev/images/blog/tu-articulo-og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://neurai.dev/blog/tu-articulo",
  },
};

export default function TuArticulo() {
  return (
    <BlogArticle
      title="Tu Título Completo"
      description="Descripción breve del artículo"
      category="Categoría del Artículo" // Ej: "Guías de Compra", "Tutoriales", "Noticias"
      url="/blog/tu-articulo"
      readTime={8} // OPCIONAL: Se calcula automáticamente si no lo pones
      // datePublished="2025-01-15T00:00:00Z" // OPCIONAL: Se genera automáticamente si no lo pones
    >
      {/* ========================================
          CONTENIDO DEL ARTÍCULO
          ======================================== */}
      <>
        {/* Introducción */}
        <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Tu introducción atractiva aquí. Primera impresión del artículo.
        </p>

        {/* Consejo destacado (opcional) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Consejo Rápido
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-0">
            Un consejo o dato importante que quieras destacar.
          </p>
        </div>

        {/* Sección 1 */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-12 mb-4">
          1. Primera Sección
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Contenido de la primera sección...
        </p>

        {/* Subsección */}
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
          Subsección 1.1
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Contenido de la subsección...
        </p>

        {/* Lista */}
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6 space-y-2">
          <li>Punto importante 1</li>
          <li>Punto importante 2</li>
          <li>Punto importante 3</li>
        </ul>

        {/* Advertencia (opcional) */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded mb-8">
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
            ⚠️ Importante
          </h3>
          <p className="text-yellow-800 dark:text-yellow-200 mb-0">
            Algo importante que el lector debe tener en cuenta.
          </p>
        </div>

        {/* CTA (Call to Action) */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg text-white mt-12">
          <h3 className="text-2xl font-bold mb-4">¿Necesitas Ayuda?</h3>
          <p className="mb-6 text-lg">
            En Neurai.dev estamos para ayudarte con lo que necesites.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tu-enlace"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Ver Más
            </Link>
            <a
              href="https://wa.me/573174503604?text=Hola, necesito información"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-block"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </>

      {/* ========================================
          ARTÍCULOS RELACIONADOS
          ======================================== */}
      <div className="mt-16 border-t border-gray-200 dark:border-gray-700 pt-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Artículos Relacionados
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/blog/articulo-relacionado-1"
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Título del Artículo Relacionado 1
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Breve descripción del artículo
            </p>
          </Link>

          <Link
            href="/blog/articulo-relacionado-2"
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Título del Artículo Relacionado 2
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Breve descripción del artículo
            </p>
          </Link>

          <Link
            href="/blog/articulo-relacionado-3"
            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Título del Artículo Relacionado 3
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Breve descripción del artículo
            </p>
          </Link>
        </div>
      </div>
    </BlogArticle>
  );
}
```

---

## 🎨 Componentes Disponibles

### 1. **Caja de Consejo (Azul)**

```jsx
<div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded mb-8">
  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
    💡 Consejo
  </h3>
  <p className="text-blue-800 dark:text-blue-200 mb-0">Tu consejo aquí</p>
</div>
```

### 2. **Caja de Advertencia (Amarillo)**

```jsx
<div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded mb-8">
  <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
    ⚠️ Importante
  </h3>
  <p className="text-yellow-800 dark:text-yellow-200 mb-0">
    Información importante
  </p>
</div>
```

### 3. **Caja de Información (Gris)**

```jsx
<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Título</h4>
  <p className="text-gray-700 dark:text-gray-300">Contenido</p>
</div>
```

---

## 📊 Cómo Funciona

1. **Fecha Automática**: Si no especificas `datePublished`, se usa la fecha actual
2. **Tiempo de Lectura**: Si no especificas `readTime`, se calcula automáticamente contando las palabras (225 palabras/minuto)
3. **Formato de Fecha**: Se formatea automáticamente a "15 de Enero, 2025"

---

## 💡 Tips

1. ✅ **Usa títulos descriptivos** - Ayudan al SEO
2. ✅ **Agrega keywords relevantes** - Mejora el posicionamiento
3. ✅ **Incluye imágenes Open Graph** - Se ven mejor al compartir
4. ✅ **Escribe descripciones atractivas** - Mejora el CTR
5. ✅ **Usa listas y subtítulos** - Facilita la lectura
6. ✅ **Agrega CTAs** - Dirige a los usuarios a tomar acción

---

## 📁 Estructura de Archivos

```
src/
├── app/
│   └── blog/
│       └── tu-articulo/
│           └── page.js
├── components/
│   ├── BlogArticle.jsx (✅ Ya creado)
│   └── ArticleSchema.jsx (✅ Ya creado)
└── lib/
    └── blogUtils.js (✅ Ya creado)
```

---

## ✨ Beneficios

- ✅ Fecha automática en cada nuevo blog
- ✅ Tiempo de lectura calculado automáticamente
- ✅ SEO optimizado
- ✅ Diseño consistente
- ✅ Modo oscuro incluido
- ✅ Responsive (mobile-first)
- ✅ Accesibilidad mejorada
- ✅ Schema.org para rich snippets

---

¡Listo! Ahora solo copia esta plantilla y personaliza el contenido para cada nuevo artículo de blog.
