"use client";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Neurai.dev",
    url: "https://www.neurai.dev",
    logo: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb",
    description:
      "Tienda online de accesorios tecnológicos, servicios de desarrollo web y soporte técnico en sistemas",
    sameAs: [
      "https://www.facebook.com/neuraidev",
      "https://www.instagram.com/neuraidev",
      "https://twitter.com/neuraidev",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+57-317-450-3604",
      contactType: "customer service",
      availableLanguage: ["Spanish"],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Neurai.dev",
    url: "https://www.neurai.dev",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.neurai.dev/accesorios?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Neurai.dev",
    image:
      "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb",
    "@id": "https://www.neurai.dev",
    url: "https://www.neurai.dev",
    telephone: "+57-317-450-3604",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Colombia",
      addressCountry: "CO",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://www.neurai.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Accesorios",
        item: "https://www.neurai.dev/accesorios",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Celulares",
        item: "https://www.neurai.dev/accesorios/celulares",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Computadoras",
        item: "https://www.neurai.dev/accesorios/computadoras",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Damas",
        item: "https://www.neurai.dev/accesorios/damas",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Belleza",
        item: "https://www.neurai.dev/accesorios/belleza",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Libros Nuevos",
        item: "https://www.neurai.dev/accesorios/libros-nuevos",
      },
      {
        "@type": "ListItem",
        position: 8,
        name: "Libros Usados",
        item: "https://www.neurai.dev/accesorios/libros-usados",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Generales",
        item: "https://www.neurai.dev/accesorios/generales",
      },
      {
        "@type": "ListItem",
        position: 10,
        name: "Servicios",
        item: "https://www.neurai.dev/servicios",
      },
      {
        "@type": "ListItem",
        position: 11,
        name: "Blog",
        item: "https://www.neurai.dev/Blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
