// Datos estructurados globales (Organization + LocalBusiness + WebSite).
// La ubicación debe coincidir exactamente con la del mapa del home y la de
// Google Business Profile: Colón, Putumayo (1.189785, -76.970495).

const SITE_URL = "https://neurai.dev";
const LOGO_URL = "https://media.neurai.dev/logo.png";

const address = {
  "@type": "PostalAddress",
  addressLocality: "Colón",
  addressRegion: "Putumayo",
  addressCountry: "CO",
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Store", "ComputerStore"],
      "@id": `${SITE_URL}/#negocio`,
      name: "neurai.dev",
      alternateName: "Neurai",
      description:
        "Tienda de tecnología y técnico en sistemas en Colón, Putumayo: accesorios para celulares y computadoras, formateo y mantenimiento de computadores y desarrollo web. Envío gratis en todo el Alto Putumayo.",
      url: SITE_URL,
      logo: LOGO_URL,
      image: LOGO_URL,
      telephone: "+57 317 450 3604",
      priceRange: "$$",
      currenciesAccepted: "COP",
      paymentAccepted:
        "Efectivo, Nequi, tarjeta de crédito, tarjeta débito, PSE",
      address,
      geo: {
        "@type": "GeoCoordinates",
        latitude: 1.189785,
        longitude: -76.970495,
      },
      hasMap: "https://www.google.com/maps?q=1.189785,-76.970495",
      areaServed: [
        { "@type": "AdministrativeArea", name: "Alto Putumayo" },
        { "@type": "AdministrativeArea", name: "Valle de Sibundoy" },
        { "@type": "City", name: "Colón" },
        { "@type": "City", name: "Sibundoy" },
        { "@type": "City", name: "Santiago" },
        { "@type": "City", name: "San Francisco" },
        { "@type": "Country", name: "Colombia" },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "08:00",
          closes: "14:00",
        },
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+57 317 450 3604",
        contactType: "customer service",
        availableLanguage: "es",
        areaServed: "CO",
      },
      sameAs: [
        "https://www.facebook.com/profile.php?id=100085485673809",
        "https://www.instagram.com/julianrio95/",
        "https://www.tiktok.com/@julii1295",
      ],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Soporte técnico y mantenimiento de computadores",
            url: `${SITE_URL}/servicios/tecnico-sistemas`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Desarrollo web",
            url: `${SITE_URL}/servicios/desarrollador-software`,
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "neurai.dev",
      url: SITE_URL,
      inLanguage: "es-CO",
      publisher: { "@id": `${SITE_URL}/#negocio` },
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
