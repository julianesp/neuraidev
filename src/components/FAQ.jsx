import React, { useState } from 'react';
import styles from './FAQ.module.scss';

const faqData = [
  {
    question: "¿Cómo puedo realizar una compra?",
    answer: "Para realizar una compra, selecciona el producto deseado, añádelo al carrito y sigue el proceso de checkout. Aceptamos diferentes métodos de pago."
  },
  {
    question: "¿Cuáles son los métodos de pago aceptados?",
    answer: "Aceptamos pagos a través de tarjetas de crédito/débito, transferencias bancarias y pagos en efectivo."
  },
  {
    question: "¿Realizan envíos a todo el país?",
    answer: "Sí, realizamos envíos a todas las provincias del país. Los tiempos de entrega varían según la ubicación."
  },
  {
    question: "¿Tienen garantía los productos?",
    answer: "Todos nuestros productos cuentan con garantía. El período de garantía varía según el tipo de producto."
  },
  {
    question: "¿Cómo puedo contactar al servicio al cliente?",
    answer: "Puedes contactarnos a través de nuestro formulario de contacto, por correo electrónico o mediante nuestras redes sociales."
  }
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
          className={`${styles.faqItem} ${openItem === index ? styles.active : ''}`}
        >
          <button
            className={styles.question}
            onClick={() => toggleItem(index)}
            aria-expanded={openItem === index}
            aria-controls={`faq-answer-${index}`}
          >
            <span>{item.question}</span>
            <span className={styles.arrow}>
              {openItem === index ? '−' : '+'}
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

