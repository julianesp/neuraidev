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

      <section className={styles.dev}>
        <article className={styles.description}>
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
              priority={false}
              loading="lazy"
              quality={85}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
              onError={() =>
                setImageError((prev) => ({ ...prev, [imageId]: true }))
              }
            />
          </div>
        </article>

        <article className={styles.study}>
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
        </article>

        <article className={styles.redes}>
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
                priority={false}
                loading="lazy"
                quality={85}
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
                priority={false}
                loading="lazy"
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
                onError={() =>
                  setImageError((prev) => ({ ...prev, [imageId]: true }))
                }
              />
            </Link>
          </div>
        </article>

        <article
          className={`${styles.favoritos} flex flex-col items-center mb-12`}
        >
          <h2 className="text-2xl font-bold text-center mt-9 pt-2 border-gray-950 dark:border-stone-50 border-t-2  w-9/12 mx-auto rounded-lg">
            Mis favoritos
          </h2>
          <p className="pt-4 text-lg text-center w-9/12 mx-auto mb-5">
            Te presento mi preferencia musical y literaria.
          </p>
          <div className={`${styles.videos} `}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/V7q1jN7k5lg?si=CLBaSavRaJ7-u2Y4"
              title="Mujer amante - Rata Blanca"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/Y14M89v26iw?si=ZhBpWmWSgTYb5_8O"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/8JYXkBYSek4?si=ZEKoBIukVF1e-v8a"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/VRxF8H-x_J0?si=PJUjZPqj1MWTvPVM"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/hbiQn4-1qv8?si=iU9zKYjbf9L3OM2G"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
        </article>
      </section>
      <BackToTop />
    </RootLayout>
  );
};

export default Profile;
