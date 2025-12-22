import React, { useState } from "react";
import styles from "./FAQ.module.scss";

const faqData = [
  {
    question: "¿Cómo puedo realizar una compra?",
    answer:
      "Puedes realizar tu compra de forma directa desde nuestra tienda en línea. Selecciona el producto que deseas, agrégalo al carrito y completa el proceso de pago de manera segura. ¡No necesitas WhatsApp para comprar!",
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer:
      "Aceptamos todos los métodos de pago disponibles a través de Wompi: tarjetas de crédito, débito, PSE, Nequi, Bancolombia y más. Puedes elegir el que más te convenga al momento de pagar.",
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer:
      "Sí, realizamos envíos a todo el país. Los costos de envío van por cuenta del cliente. ¡IMPORTANTE! Solo aplica ENVÍO GRATIS si tu compra supera los $50.000 COP Y vives en el Valle de Sibundoy. En cualquier otro caso, el envío tiene costo adicional que será calculado según tu ubicación.",
  },
  {
    question: "¿Tienen garantía los productos?",
    answer:
      "⚠️ IMPORTANTE: Todos nuestros productos tienen garantía de 1 MES contra defectos de fábrica. ⚠️ Después de este periodo, el producto NO TIENE CUBRIMIENTO de garantía. La garantía no cubre daños por mal uso, caídas o accidentes. Asegúrate de verificar tu producto dentro del primer mes.",
  },
  {
    question: "¿Cómo puedo contactar servicio al cliente?",
    answer:
      "Puedes contactarnos directamente a través de nuestras redes sociales. Haz clic en el botón con la flecha que se encuentra en el lado izquierdo de la página para acceder a todos nuestros canales de atención.",
  },
];

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {faqData.map((item, index) => {
        // Identificar la pregunta de garantía (índice 3)
        const isWarrantyQuestion = index === 3;

        return (
          <div
            key={index}
            className={`${styles.faqItem} ${openItem === index ? styles.active : ""} ${isWarrantyQuestion ? styles.warrantyItem : ""}`}
          >
            <button
              className={`${styles.question} ${isWarrantyQuestion ? styles.warrantyQuestion : ""} dark:border-white dark:text-white`}
              onClick={() => toggleItem(index)}
              aria-expanded={openItem === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span>{item.question}</span>
              <span className={styles.arrow}>
                {openItem === index ? "−" : "+"}
              </span>
            </button>
            <div
              id={`faq-answer-${index}`}
              className={`${styles.answer} ${isWarrantyQuestion ? styles.warrantyAnswer : ""}`}
              aria-hidden={openItem !== index}
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FAQ;
