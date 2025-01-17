import React, { useEffect, useState } from "react";
import RootLayout from "@/app/layout";
import styles from "@/styles/Politicas.module.scss";

const Clientes = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div className={styles.container}>
        <h1>Atención al cliente</h1>

        <p>
          En <strong>neurai.dev</strong>, estamos comprometidos a brindarte la
          mejor experiencia posible. Estaremos disponibles para ayudarte con
          cualquier duda, consulta o inconveniente que puedas tener.
        </p>
        <h2>¿Cómo podemos ayudarte?</h2>
        <ul>
          <li>Consultas sobre productos y servicios.</li>
          <li>Soporte técnico para tus compras.</li>
          <li>Devoluciones, cambios y garantías.</li>
          <li>Sugerencias y retroalimentación.</li>
        </ul>

        <h2>Contáctanos</h2>
        <p>
          Puedes comunicarte con nosotros a través de los siguientes canales:
        </p>
        <ul>
          <li>
            <strong>Correo electrónico:</strong>{" "}
            <a href="mailto:julii1295@gmail.com">enviar mensaje</a>
          </li>
          <li>
            <strong>Chat en línea:</strong> Disponible en nuestra página
            principal.
          </li>
        </ul>
        <h2>Preguntas Frecuentes</h2>
        <p>
          Antes de contactarnos, te invitamos a visitar nuestra sección de{" "}
          <a href="/faqs">Preguntas Frecuentes (FAQs)</a>, donde hemos
          recopilado las respuestas a las dudas más comunes.
        </p>
        <p>
          Agradecemos tu confianza en <strong>neurai.dev</strong>. Estamos aquí
          para ayudarte y asegurarnos de que tengas una experiencia excepcional.
        </p>

        <h2>Horarios de atención</h2>
        <p>
          El horario de atención es de <strong>lunes a viernes</strong>, de{" "}
          <strong>8:00 AM a 6:00 PM</strong>. Fuera de este horario, puedes
          dejarnos un mensaje a través de las redes sociales que se encuentran
          en el botón del lado inferior izquierdo y te responderemos lo antes
          posible.
        </p>
      </div>
    </RootLayout>
  );
};

export default Clientes;
