"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";

import dev from "/public/images/dev.jpg";
import tecni from "/public/diploma.png";
import tecno from "/public/diploma.png";
import styles from "@/styles/Perfil.module.css";
import RootLayout from "@/app/layout";

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
            <span>Julián España,</span>
            <span>Desarrollador</span>
            <span>Frontend</span>
          </p>
          <div>
            <Image
              className={styles.me}
              alt="Médico cirujano"
              src={dev}
              priority
            />
          </div>
        </div>
        <div className={styles.study}>
          <h2>Descripción profesional</h2>
          <div className={styles.study__container}>
            <div className={styles["study--areas"]}>
              <p id="titulo">Estudio 1</p>
              <button className={styles["image-button"]} onClick={toggleImage}>
                Ver
              </button>
              {showImage && (
                <div className="image-modal">
                  <Image src={dev} alt="Imagen" priority />
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
              <p id="titulo">Estudio 2</p>
              <button className={styles["image-button"]} onClick={toggleImage1}>
                Ver
              </button>
              {showImage1 && (
                <div className="image-modal">
                  <Image src={dev} alt="Imagen" priority />
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
      </div>
    </RootLayout>
  );
};

export default Profile;
