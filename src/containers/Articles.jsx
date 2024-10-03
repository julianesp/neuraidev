import React from "react";
import ImageSlider from "./ImageSlider";
import Image from "next/image";
import styles from "@/styles/Articles.module.scss";

const Articles = () => {
  return (
    <section className={styles.container}>
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2FCelulares%2Fbrazalete%2F1.png?alt=media&token=3aaef89b-99cb-470f-8892-6c1450b08ecb"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2FCelulares%2Fusb_iphone%2F2.jpg?alt=media&token=3a9f7662-3654-4a23-b9b6-da353de50a04"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fadaptador%20disco.jpg?alt=media&token=8446d9da-b2b5-405a-aa39-e7bb25fd30f9"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fbombillo_usb.jpg?alt=media&token=f18daaa1-91e9-4d86-8273-e8b53f537f9c"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fluces_bici.jpg?alt=media&token=6dca1abb-ec2d-41ed-88a1-5fb7dc4474aa"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
      <Image
        src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/Accesorios%2Fssd_128.jpg?alt=media&token=3b3659d3-446b-40ec-b2a0-e061ee2e5aec"
        alt="Accesorio celular"
        width={300}
        height={200}
        className={styles.image}
      />
    </section>
  );
};

export default Articles;
