"use client";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Neurai.dev",
    alternateName: "Neurai",
    url: "https://neurai.dev",
    logo: {
      "@type": "ImageObject",
      url: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
      width: 512,
      height: 512,
    },
    image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
    description:
      "Tienda online de accesorios tecnológicos, servicios de desarrollo web y soporte técnico en sistemas. Venta de accesorios para celulares, computadoras, libros y más.",
    sameAs: [
      "https://www.facebook.com/neuraidev",
      "https://www.instagram.com/neuraidev",
      "https://twitter.com/neuraidev",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+57-317-450-3604",
      contactType: "customer service",
      availableLanguage: ["es", "Spanish"],
      areaServed: "CO",
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "CO",
      addressLocality: "Valle de Sibundoy",
      addressRegion: "Putumayo",
    },
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Desarrollo Web",
          description: "Desarrollo de sitios web, tiendas online y aplicaciones",
          url: "https://neurai.dev/servicios/desarrollador-software",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Soporte Técnico",
          description: "Mantenimiento y reparación de computadoras",
          url: "https://neurai.dev/servicios/tecnico-sistemas",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Accesorios para Celulares",
          url: "https://neurai.dev/accesorios/celulares",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Accesorios para Computadoras",
          url: "https://neurai.dev/accesorios/computadoras",
        },
      },
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Neurai.dev",
    url: "https://neurai.dev",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://neurai.dev/accesorios?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["Store", "OnlineStore"],
    name: "Neurai.dev",
    image: "https://0dwas2ied3dcs14f.public.blob.vercel-storage.com/logo.png",
    "@id": "https://neurai.dev",
    url: "https://neurai.dev",
    telephone: "+57-317-450-3604",
    priceRange: "$$",
    paymentAccepted: "Cash, Credit Card, Debit Card, Online Payment",
    currenciesAccepted: "COP",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Valle de Sibundoy",
      addressRegion: "Putumayo",
      addressCountry: "CO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "1.1333",
      longitude: "-76.9",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Catálogo de Productos",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Accesorios para Celulares",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Accesorios para Celulares",
              },
            },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Accesorios para Computadoras",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Product",
                name: "Accesorios para Computadoras",
              },
            },
          ],
        },
      ],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://neurai.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Accesorios",
        item: "https://neurai.dev/accesorios",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Celulares",
        item: "https://neurai.dev/accesorios/celulares",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Computadoras",
        item: "https://neurai.dev/accesorios/computadoras",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Damas",
        item: "https://neurai.dev/accesorios/damas",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Belleza",
        item: "https://neurai.dev/accesorios/belleza",
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Libros Nuevos",
        item: "https://neurai.dev/accesorios/libros-nuevos",
      },
      {
        "@type": "ListItem",
        position: 8,
        name: "Libros Usados",
        item: "https://neurai.dev/accesorios/libros-usados",
      },
      {
        "@type": "ListItem",
        position: 9,
        name: "Generales",
        item: "https://neurai.dev/accesorios/generales",
      },
      {
        "@type": "ListItem",
        position: 10,
        name: "Servicios",
        item: "https://neurai.dev/servicios",
      },
      {
        "@type": "ListItem",
        position: 11,
        name: "Blog",
        item: "https://neurai.dev/Blog",
      },
    ],
  };

  // Schema para servicios profesionales
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Servicios Profesionales",
    description: "Servicios de desarrollo web, soporte técnico en sistemas y más",
    url: "https://neurai.dev/servicios",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          "@id": "https://neurai.dev/servicios/desarrollador-software",
          name: "Desarrollo Web",
          description: "Desarrollo de páginas web, aplicaciones web, tiendas online y sistemas a medida",
          url: "https://neurai.dev/servicios/desarrollador-software",
          provider: {
            "@type": "Organization",
            name: "Neurai.dev",
          },
          areaServed: "CO",
          availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: "https://neurai.dev/servicios/desarrollador-software",
          },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          "@id": "https://neurai.dev/servicios/tecnico-sistemas",
          name: "Soporte Técnico en Sistemas",
          description: "Mantenimiento y reparación de computadoras, instalación de software, soporte técnico",
          url: "https://neurai.dev/servicios/tecnico-sistemas",
          provider: {
            "@type": "Organization",
            name: "Neurai.dev",
          },
          areaServed: "CO",
          availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: "https://neurai.dev/servicios/tecnico-sistemas",
          },
        },
      },
    ],
  };

  // Schema para categorías de productos
  const productCategoriesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Categorías de Productos",
    description: "Accesorios tecnológicos, celulares, computadoras, libros y más",
    url: "https://neurai.dev/accesorios",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/celulares",
          name: "Accesorios para Celulares",
          description: "Fundas, protectores, cargadores y accesorios para celulares",
          url: "https://neurai.dev/accesorios/celulares",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/computadoras",
          name: "Accesorios para Computadoras",
          description: "Teclados, mouse, memorias RAM, discos duros y más accesorios para computadoras",
          url: "https://neurai.dev/accesorios/computadoras",
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/libros-nuevos",
          name: "Libros Nuevos",
          description: "Libros nuevos de diversas categorías y temáticas",
          url: "https://neurai.dev/accesorios/libros-nuevos",
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/libros-usados",
          name: "Libros Usados",
          description: "Libros usados en buen estado, diversas categorías",
          url: "https://neurai.dev/accesorios/libros-usados",
        },
      },
      {
        "@type": "ListItem",
        position: 5,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/generales",
          name: "Productos Generales",
          description: "Productos varios y accesorios generales",
          url: "https://neurai.dev/accesorios/generales",
        },
      },
      {
        "@type": "ListItem",
        position: 6,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/damas",
          name: "Accesorios para Damas",
          description: "Accesorios y productos para damas",
          url: "https://neurai.dev/accesorios/damas",
        },
      },
      {
        "@type": "ListItem",
        position: 7,
        item: {
          "@type": "CollectionPage",
          "@id": "https://neurai.dev/accesorios/belleza",
          name: "Productos de Belleza",
          description: "Productos de belleza y cuidado personal",
          url: "https://neurai.dev/accesorios/belleza",
        },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productCategoriesSchema) }}
      />
    </>
  );
}
