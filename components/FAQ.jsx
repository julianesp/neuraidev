import React, { useState } from "react";
import styles from "./FAQ.module.scss";

const faqData = [
  {
    question: "¿Cómo puedo realizar una compra?",
    answer:
      "Para realizar una compra, abre el producto deseado y luego pulsa sobre el botón 'Consultar por WhatsApp' para atenderte de forma personalizada.",
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer:
      "Por el momento, se aceptan pagos a través de transferencia a Nequi o Dale! y en efectivo al momento de la entrega.",
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer:
      "Sí, se realiza envíos a todos los lugares del país, sin embargo, tú asumes los costos de envío. Los tiempos de entrega varían según la ubicación.",
  },
  {
    question: "¿Tienen garantía los productos?",
    answer:
      "Todos los productos cuentan con garantía. El período de garantía es de un mes. Si el producto presenta algún defecto de fábrica, puedes contactarme para coordinar una solución. Recuerda que la garantía no cubre daños causados por mal uso o accidentes.",
  },
  {
    question: "¿Cómo puedo contactar servicio al cliente?",
    answer:
      "Puedes contactarme a través de las redes sociales que se encuentran en el botón del lado inferior izquierdo de la página o enviando un correo electrónico a través de la sección de contacto al final de la página.",
  },
];

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      {faqData.map((item, index) => (
        <div
          key={index}
          className={`${styles.faqItem} ${openItem === index ? styles.active : ""}`}
        >
          <button
            className={`${styles.question}  dark:border-white dark:text-white`}
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
            className={styles.answer}
            aria-hidden={openItem !== index}
          >
            {item.answer}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;
