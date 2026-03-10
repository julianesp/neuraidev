"use client";

/**
 * Componente de Preguntas Frecuentes con Schema.org
 * Genera rich snippets en los resultados de búsqueda de Google
 */
export default function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Hacen envíos a toda Colombia?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, realizamos envíos a todo Colombia. Los productos se envían desde Valle de Sibundoy, Putumayo. El tiempo de entrega varía según la ubicación, generalmente entre 3 a 7 días hábiles."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué métodos de pago aceptan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aceptamos múltiples métodos de pago: tarjetas de crédito y débito (Visa, Mastercard), PSE, pagos en efectivo a través de puntos autorizados, y transferencias bancarias. Todos los pagos son procesados de forma segura."
        }
      },
      {
        "@type": "Question",
        "name": "¿Tienen garantía los productos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, todos nuestros productos nuevos cuentan con garantía. Los productos tecnológicos tienen garantía de 30 días contra defectos de fabricación. Los productos usados tienen garantía de 15 días. Consulta nuestra política de devoluciones para más detalles."
        }
      },
      {
        "@type": "Question",
        "name": "¿Venden accesorios para celulares?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, vendemos una amplia variedad de accesorios para celulares: fundas, protectores de pantalla, cargadores rápidos, cables USB tipo C, auriculares, controles de juego, manos libres, y mucho más. Todos con garantía y a precios competitivos."
        }
      },
      {
        "@type": "Question",
        "name": "¿Tienen accesorios para computadoras?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, contamos con memorias RAM DDR3/DDR4, discos SSD (SATA, M.2, mSATA), discos duros, teclados, mouse inalámbricos y con cable, webcams, adaptadores USB, hubs, y más accesorios para computadoras de escritorio y portátiles."
        }
      },
      {
        "@type": "Question",
        "name": "¿Ofrecen servicios técnicos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, ofrecemos servicios profesionales: desarrollo web (páginas web, tiendas online, aplicaciones), soporte técnico en sistemas (mantenimiento de computadoras, instalación de software, reparaciones), y consultoría en tecnología."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo puedo verificar el estado de mi pedido?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Una vez realices tu compra, recibirás un correo electrónico con el número de seguimiento de tu pedido. Puedes contactarnos por WhatsApp al +57 317 450 3604 o escribirnos a través de nuestro formulario de contacto para verificar el estado de tu envío."
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo devolver un producto si no me gusta?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, aceptamos devoluciones dentro de los primeros 7 días después de la entrega, siempre que el producto esté en su empaque original, sin uso y en perfectas condiciones. Los costos de envío de devolución corren por cuenta del cliente. Consulta nuestra política de devoluciones completa."
        }
      },
      {
        "@type": "Question",
        "name": "¿Tienen tienda física en Valle de Sibundoy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, estamos ubicados en Valle de Sibundoy, Putumayo, Colombia. Puedes visitarnos para ver nuestros productos personalmente o contactarnos por WhatsApp al +57 317 450 3604 para coordinar una cita. También vendemos online con envíos a todo el país."
        }
      },
      {
        "@type": "Question",
        "name": "¿Los precios incluyen IVA?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, todos los precios publicados en neurai.dev ya incluyen el IVA. No hay costos adicionales excepto el envío, que se calcula según tu ubicación y se muestra antes de confirmar la compra."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
