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
          src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fnext.png?alt=media&token=e66ac434-3360-4247-b1e1-aaf095c30a57"
          priority
          width={30}
          height={30}
          onError={() =>
            setImageError((prev) => ({ ...prev, [arrowImageId]: true }))
          }
        />
      </button>

      <article className={`${styles.description}`}>
        <Link href="/">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flogo.png?alt=media&token=96ed73e2-f6fd-4daf-ad5d-4cb0690aa9fb"
            alt="neurai.dev"
            width={100}
            height={100}
            className="rounded-full object-cover"
            onError={() =>
              setImageError((prev) => ({ ...prev, [logoImageId]: true }))
            }
          />
        </Link>
      </article>

      {/* Columna 1: Información */}
      <article className={`${styles.information} ${styles.informationLinks}`}>
        <h2>Información</h2>
        <h3>
          <Link href="/politicas">Políticas de privacidad</Link>
        </h3>
        <h3>
          <Link href="/clientes">Atención al cliente</Link>
        </h3>
        <p>NIT: 1124315657-2</p>
      </article>

      {/* Columna 2: Ubicación */}
      <article className={`${styles.information} ${styles.ubicacionInfo}`}>
        <h2>Ubicación</h2>
        <p>Colón - Putumayo</p>
        <p>Calle 1A # 6 - 7</p>
      </article>

      {/* Columna 3: Contacto */}
      <article
        className={`${styles.information} ${styles.contactoInfo} flex flex-col items-center`}
      >
        <h2>Contacto</h2>
        <Link href="mailto:julii1295@gmail.com">Enviar correo</Link>
        <Link href="tel:+573174503604">Llamar</Link>
      </article>

      {/* Columna 4: Legal */}
      <article className={`${styles.information} ${styles.legalInfo}`}>
        <h2>Legal</h2>
        <h3>
          <Link href="/terminos-condiciones">Términos y condiciones</Link>
        </h3>

        <p>Horario:</p>
        <p> Lunes a Viernes, 8:00 a 18:00</p>
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
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fsocialmedia%2Ffacebook.png?alt=media&token=e719a37e-cb63-45ea-8535-ca23b6bdba35"
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
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fsocialmedia%2Finstagram.png?alt=media&token=dd5ed25b-1b37-4eaa-9467-a127ce8124b2"
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
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fsocialmedia%2Fsocial.png?alt=media&token=8b2f56eb-ce82-412c-b883-f088a9bfa752"
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
                  src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fsocialmedia%2Ftik-tok.png?alt=media&token=421205be-9170-4b4c-b873-04f63c9d727f"
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
