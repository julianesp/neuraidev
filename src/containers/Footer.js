"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/components/Footer.module.scss";

const Footer = () => {
  const [menuOption, setMenuOptions] = useState(false);
  const [isClient, setIsClient] = useState(false); // Nuevo estado para detectar hidratación
  const [imageError, setImageError] = useState({});
  const menuRef = useRef(null);
  const flechaRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Define unique IDs for each image
  const arrowImageId = "footer-arrow";
  const logoImageId = "footer-logo";
  const facebookImageId = "footer-facebook";
  const instagramImageId = "footer-instagram";
  const whatsappImageId = "footer-whatsapp";
  const tiktokImageId = "footer-tiktok";

  const switchOptions = () => {
    setMenuOptions(!menuOption);
  };

  // useEffect para detectar cuando el componente se hidrata en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Solo ejecutar lógica del browser después de la hidratación
    if (!isClient) return;

    // Función para manejar el scroll y detectar si estamos en el fondo
    const handleScroll = () => {
      const isBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      setIsAtBottom(isBottom);
    };

    // Función para cerrar el menú cuando se hace clic fuera
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        flechaRef.current &&
        !flechaRef.current.contains(event.target)
      ) {
        setMenuOptions(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isClient]); // Dependencia del estado isClient

  return (
    <footer className={styles.footer}>
      <button ref={flechaRef} className={styles.flecha} onClick={switchOptions}>
        <Image
          alt="Links to navigation"
          src="/images/next.svg"
          priority
          width={30}
          height={30}
          unoptimized
          onError={() =>
            setImageError((prev) => ({ ...prev, [arrowImageId]: true }))
          }
        />
      </button>

      {/* Columna 1: Información */}
      <article className={`${styles.information} ${styles.informationLinks}`}>
        <h2>Información</h2>
        <h3>
          <Link href="/politicas">Políticas de privacidad</Link>
        </h3>
        <h3>
          <Link href="/clientes">Atención al cliente</Link>
        </h3>
        <h3>
          <Link href="/sobre-nosotros">Sobre nosotros</Link>
        </h3>
        <h3>
          <Link href="/preguntas-frecuentes">FAQ</Link>
        </h3>
      </article>

      {/* Logo en el centro */}
      <article className={`${styles.description}`}>
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="neurai.dev"
            width={120}
            height={120}
            className="rounded-full object-cover"
            onError={() =>
              setImageError((prev) => ({ ...prev, [logoImageId]: true }))
            }
          />
        </Link>
      </article>

      {/* Columna 3: Categorías */}
      <article className={`${styles.information} ${styles.categoriasInfo}`}>
        <h2>Categorías</h2>
        <h3>
          <Link href="/accesorios/celulares">Celulares</Link>
        </h3>
        <h3>
          <Link href="/accesorios/computadoras">Computadores</Link>
        </h3>
        <h3>
          <Link href="/accesorios/damas">Damas</Link>
        </h3>
        <h3>
          <Link href="/accesorios/libros-nuevos">Libros</Link>
        </h3>
        <h3>
          <Link href="/accesorios/generales">Generales</Link>
        </h3>
      </article>

      {/* Servicios */}
      <article className={`${styles.information} ${styles.serviciosInfo}`}>
        <h2>Servicios</h2>
        <h3>
          {/* <Link href="/servicios">Formateo PC</Link> */}
          <p>Formateo PC</p>
        </h3>
        <h3>
          {/* <Link href="/servicios">Mantenimiento PC</Link> */}
          <p>Mantenimiento PC</p>
        </h3>
        <h3>
          {/* <Link href="/servicios">Desarrollo Web</Link> */}
          <p>Desarrollo web</p>
        </h3>
      </article>

      {/* Contacto */}
      <article className={`${styles.information} ${styles.contactoInfo}`}>
        <h2>Contacto</h2>
        <h3>
          <Link href="mailto:julii1295@gmail.com">📧 Enviar correo</Link>
        </h3>
        <h3>
          <Link href="tel:+573174503604">📞 +57 317 450 3604</Link>
        </h3>
        <h3>
          <Link href="https://wa.me/573174503604" target="_blank">
            💬 WhatsApp
          </Link>
        </h3>
      </article>

      {/* Ubicación y horario */}
      <article className={`${styles.information} ${styles.ubicacionInfo}`}>
        <h2>Ubicación</h2>
        <p>📍 Colón - Putumayo</p>
        <p>🏪 Calle 1A # 6 - 7</p>
        <p>🕒 Lun-Vie: 8:00-18:00</p>
        <p>NIT: 1124315657-2</p>
      </article>

      {/* Legal y pagos */}
      <article className={`${styles.information} ${styles.legalInfo}`}>
        <h2>Legal</h2>
        <h3>
          <Link href="/terminos-condiciones">Términos</Link>
        </h3>
        <h3>
          <Link href="/politica-devoluciones">Devoluciones</Link>
        </h3>

        <p className={styles.copyright}>
          © 2025 NeuraI.dev - Todos los derechos reservados
        </p>
      </article>

      {/* Redes Sociales Flotantes - Solo se renderiza después de hidratación */}
      {isClient && (
        <article
          ref={menuRef}
          className={`${styles.redes} ${menuOption ? styles.open : styles.closed}`}
        >
          <ul>
            <li>
              <Link
                href="https://www.facebook.com/profile.php?id=100085485673809"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  alt="Facebook"
                  src="/images/social/facebook.png"
                  width={40}
                  height={40}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({
                      ...prev,
                      [facebookImageId]: true,
                    }))
                  }
                />
              </Link>
            </li>
            <li>
              <Link
                href="https://www.instagram.com/julianrio95/"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  alt="Instagram"
                  src="/images/social/instagram.png"
                  width={40}
                  height={40}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({
                      ...prev,
                      [instagramImageId]: true,
                    }))
                  }
                />
              </Link>
            </li>
            <li>
              <Link
                href="https://wa.me/573174503604"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  alt="Whatsapp"
                  src="/images/social/whatsapp.png"
                  width={40}
                  height={40}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({
                      ...prev,
                      [whatsappImageId]: true,
                    }))
                  }
                />
              </Link>
            </li>
            <li className={styles.tiktok}>
              <Link
                href="https://www.tiktok.com/@julii1295?_t=8n2OQ52Q4aD&_r=1"
                target="_blank"
                rel="noreferrer"
              >
                <Image
                  alt="TikTok"
                  src="/images/social/tiktok.png"
                  width={40}
                  height={40}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={false} // Solo true para imágenes above-the-fold
                  loading="lazy"
                  quality={85} // Reduce de 100 a 85
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                  onError={() =>
                    setImageError((prev) => ({
                      ...prev,
                      [tiktokImageId]: true,
                    }))
                  }
                />
              </Link>
            </li>
          </ul>
        </article>
      )}
    </footer>
  );
};

export default Footer;
