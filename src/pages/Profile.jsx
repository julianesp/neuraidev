"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import styles from "../styles/components/Perfil.module.scss";

import Link from "next/link";
import BackToTop from "../components/backTop/BackToTop";
import RootLayout from "../app/layout";

const Profile = () => {
  const [imageError, setImageError] = useState({});
  const [imageId, setImageId] = useState({});
  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  return (
    <RootLayout>
      <Head>
        <title>Sobre mí</title>
      </Head>

      <div className={styles.dev}>
        <div className={styles.description}>
          <div className={styles.texto}>
            <p>
              <span>¡Hola! 👋🏼</span>
              <span>Soy</span>
              <span>Julián España</span>
            </p>
          </div>

          <div className={styles.face}>
            <Image
              className={styles.me}
              alt="Desarrollador web"
              src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fdev.jpg?alt=media&token=9e22983b-7efe-43c4-9b4e-4bbb41ff3cb0"
              width={100}
              height={100}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} // Solo true para imágenes above-the-fold
              loading="lazy"
              quality={85} // Reduce de 100 a 85
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [imageId]: true }))
              }
            />
          </div>
        </div>

        <div className={styles.study}>
          <h2>Descripción personal</h2>

          <p>Hola! 😉</p>
          <p>
            Apasionado por la lectura, los paseos tranquilos y la música,
            especialmente el hard rock. Disfruto tocar la guitarra y, aunque
            disfrutaba correr, ahora valoro el ritmo pausado de la vida
            caminando.
          </p>

          <div className={styles.study__container}>
            <div className={styles["study--areas"]}>
              <p id="titulo">Técnico sistemas</p>
              <p id="logo">SENA</p>
            </div>

            <div className={styles["study--areas"]}>
              <p id="titulo">Tecnólogo ADSI</p>
              <p>SENA</p>
            </div>

            <div className={styles["study--areas"]}>
              <p id="titulo">Ingeniero de software</p>
              <p>Ibero</p>
            </div>
          </div>
        </div>

        <div className={styles.redes}>
          <div className={styles.title}>
            <h1>Redes profesionales</h1>
          </div>

          <div className={styles.links}>
            <Link
              href="https://www.linkedin.com/in/julianesprio/"
              target="_blank"
            >
              <Image
                alt="LinkedIn"
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flinkedin.png?alt=media&token=f709970c-0660-409b-b141-f47cde75b110"
                width={80}
                height={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false} // Solo true para imágenes above-the-fold
                loading="lazy"
                quality={85} // Reduce de 100 a 85
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                onError={() =>
                  setImageError((prev) => ({ ...prev, [imageId]: true }))
                }
              />
            </Link>

            <Link href="https://github.com/julianesp" target="_blank">
              <Image
                alt="GitHub"
                src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fgithub.png?alt=media&token=236a6e79-361e-470a-8743-5fa0a1e501ac"
                width={80}
                height={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false} // Solo true para imágenes above-the-fold
                loading="lazy"
                quality={85} // Reduce de 100 a 85
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                onError={() =>
                  setImageError((prev) => ({ ...prev, [imageId]: true }))
                }
              />
            </Link>
          </div>
        </div>
      </div>

      <BackToTop />
    </RootLayout>
  );
};

export default Profile;
