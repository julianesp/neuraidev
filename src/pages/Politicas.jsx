import React, { useEffect, useState } from "react";
import RootLayout from "../app/layout";

const Politicas = () => {
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <div>
        <h1>Políticas y privacidad</h1>
        <section>
          <h2>Introducción</h2>
          <p>
            Bienvenido a nuestra página de políticas y privacidad. Aquí
            encontrará información sobre cómo manejamos sus datos personales.
          </p>
        </section>
        <section>
          <h2>Recolección de Información</h2>
          <p>
            Recopilamos información personal que usted nos proporciona
            directamente, así como información recopilada automáticamente a
            través de su uso de nuestros servicios.
          </p>
        </section>
        <section>
          <h2>Uso de la Información</h2>
          <p>
            Utilizamos la información recopilada para proporcionar, mantener y
            mejorar nuestros servicios, así como para comunicarnos con usted.
          </p>
        </section>
        <section>
          <h2>Compartir Información</h2>
          <p>
            No compartimos su información personal con terceros, excepto en las
            circunstancias descritas en esta política.
          </p>
        </section>
        <section>
          <h2>Seguridad</h2>
          <p>
            Implementamos medidas de seguridad para proteger su información
            personal contra el acceso no autorizado y la divulgación.
          </p>
        </section>
        <section>
          <h2>Sus Derechos</h2>
          <p>
            Usted tiene derecho a acceder, corregir o eliminar su información
            personal, así como a oponerse al procesamiento de sus datos.
          </p>
        </section>
        <section>
          <h2>Contacto</h2>
          <p>
            Si tiene alguna pregunta sobre nuestras políticas de privacidad, no
            dude en contactarnos.
          </p>
        </section>
      </div>
    </RootLayout>
  );
};

export default Politicas;
