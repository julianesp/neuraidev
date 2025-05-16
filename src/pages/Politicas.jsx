import React, { useEffect, useState } from "react";
import RootLayout from "../app/layout";
import styles from "./Politicas.module.css";

const Politicas = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div className={styles.policyContainer}>
        <div className={styles.policyHeader}>
          <h1>Políticas y privacidad</h1>
        </div>
        
        <div className={styles.policySectionsGrid}>
          <section className={`${styles.policySection} ${styles.fullWidthSection}`}>
            <h2>Introducción</h2>
            <p>
              Bienvenido a nuestra página de políticas y privacidad. Aquí
              encontrará información sobre cómo manejamos sus datos personales.
            </p>
            <p>
              En neurai.dev, respetamos su privacidad y nos comprometemos a
              proteger sus datos personales. Esta política de privacidad describe
              cómo recopilamos, utilizamos y protegemos la información que nos
              proporciona cuando utiliza nuestros servicios de formateo y
              mantenimiento de computadores.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2>Utilizamos sus datos personales para:</h2>
            <ul>
              <li>
                Prestar los servicios solicitados de mantenimiento y formateo
              </li>
              <li>Comunicarnos con usted sobre su servicio</li>
              <li>Enviar presupuestos y facturas</li>
              <li>Proporcionar soporte técnico</li>
              <li>Mejorar nuestros servicios</li>
              <li>
                Enviar información sobre promociones (solo con su consentimiento)
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>Acceso a sus datos personales</h2>
            <p>
              Durante el servicio técnico, nuestros técnicos podrían tener acceso
              a archivos almacenados en su equipo. Este acceso se limita
              estrictamente a las operaciones necesarias para realizar el servicio
              solicitado. No accedemos, copiamos ni conservamos sus archivos
              personales sin su autorización expresa.
            </p>
          </section>
          
          <section className={styles.policySection}>
            <h2>Protección de datos</h2>
            <p>
              Implementamos medidas de seguridad adecuadas para proteger sus datos
              contra pérdida, acceso no autorizado, divulgación o alteración.
              Estas medidas incluyen:
            </p>
            <ul>
              <li>
                Acceso restringido a la información por parte de nuestro personal
              </li>
              <li>Acuerdos de confidencialidad con nuestros técnicos</li>
              <li>Capacitación del personal en protección de datos</li>
              <li>Copias de seguridad periódicas</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>Conservación de datos</h2>
            <p>
              Conservamos sus datos personales solo durante el tiempo necesario
              para los fines para los que fueron recopilados, incluyendo el
              cumplimiento de requisitos legales, contables o de informes.
            </p>
          </section>

          <section className={`${styles.contactSection} ${styles.fullWidthSection}`}>
            <h2>Contacto</h2>
            <p>
              Si tiene alguna pregunta sobre nuestras políticas de privacidad, no
              dude en contactarnos.
            </p>
          </section>
        </div>
      </div>
    </RootLayout>
  );
};

export default Politicas;
