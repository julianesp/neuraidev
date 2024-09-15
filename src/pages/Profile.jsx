"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";

import dev from "/public/images/dev.jpg";
import tecni from "/public/images/tecnico.png";
import tecno from "/public/images/tecnologo.png";
import linkedin from "/public/images/linkedin.png";
import github from "/public/images/github.png";
import styles from "@/styles/Perfil.module.scss";
import RootLayout from "@/app/layout";
import Link from "next/link";

const Profile = () => {
  const [showImage, setShowImage] = useState(false);
  const [showImage1, setShowImage1] = useState(false);

  // Solution for hydratation errors
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  if (!isLoaded) return null;

  const toggleImage1 = () => {
    setShowImage1(!showImage1);
  };

  const toggleImage = () => {
    setShowImage(!showImage);
  };

  const closeImage = () => {
    setShowImage(false);
  };

  const closeImage2 = () => {
    setShowImage1(false);
  };

  return (
    <RootLayout>
      <Head>
        <title>Sobre mí</title>
      </Head>
      <div className={styles.dev}>
        <div className={styles.description}>
          <p>
            <span>¡Hola! 👋🏼</span>
            <span>Soy</span>
            <span>Julián España</span>
          </p>
          <div>
            <Image
              className={styles.me}
              alt="Desarrollador web"
              src={dev}
              priority
            />
          </div>
        </div>

        <div className={styles.study}>
          <h2>Descripción personal</h2>

          <p>
            Soy técnico en sistemas con más de 5 años de experiencia 🪛🖥️.
            <br />
            Especialista en instalación de programas.
          </p>

          <div className={styles.study__container}>
            <div className={styles["study--areas"]}>
              <p id="titulo">Técnico sistemas</p>
              <button className={styles["image-button"]} onClick={toggleImage}>
                Ver
              </button>
              {showImage && (
                <div className="image-modal">
                  <Image src={tecni} alt="Imagen" priority />
                  <button
                    className={styles["image-button--cerrar"]}
                    onClick={closeImage}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
            <div className={styles["study--areas"]}>
              <p id="titulo">Tecnólogo ADSI</p>
              <button className={styles["image-button"]} onClick={toggleImage1}>
                Ver
              </button>
              {showImage1 && (
                <div className="image-modal">
                  <Image src={tecno} alt="Imagen" priority />
                  <button
                    className={styles["image-button--cerrar"]}
                    onClick={closeImage2}
                  >
                    X
                  </button>
                </div>
              )}
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
              <Image alt="LinkedIn" src={linkedin} />
            </Link>

            <Link href="https://github.com/julianesp" target="_blank">
              <Image alt="GitHub" src={github} />
            </Link>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Profile;
