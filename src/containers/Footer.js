"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import face from '../../public/assets/redes/facebook.png'
import ins from '../../public/assets/redes/instagram.png'
import tik from '../../public/assets/redes/tiktok.png'
import wha from '../../public/assets/redes/whatsapp.png'
import map from '../../public/images/map.png'
import arrow from '../../public/next.png'
import phone from '../../public/phone.png'
import styles from '../styles/Footer.module.css'


const Contacto = () => {

  const [menuOption, setMenuOptions] = useState(false)

  const switchOptions = () => {
    setMenuOptions(!menuOption)
  }

  return (
    <footer className={styles.footer}>

      <div className={styles.flecha} onClick={switchOptions}>
        <Image
          alt='Links to navigation'
          src={arrow}
          priority
        />
      </div>

      <div className={styles.description}>
        <p>Servicio de cirugía general</p>
      </div>



      <div className={styles.ubicacion}>


        <p>Sibundoy - Putumayo</p>
        {/* <p>Información: 313-862-7818</p> */}
        <div className={styles.call}>
          Llámame:
          <a href="tel:+3174503604">
            <Image
              src={phone}
              alt='Imagen de teléfono'
            />

          </a>

        </div>


        {/* <p className={styles.consultorio}>
          <a href="https://www.google.com/maps/@1.2029865,-76.9187532,3a,75y,207.78h,74.79t/data=!3m7!1e1!3m5!1svaLjiSaMu9z6CaGL2yRraw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fpanoid%3DvaLjiSaMu9z6CaGL2yRraw%26cb_client%3Dmaps_sv.tactile.gps%26w%3D203%26h%3D100%26yaw%3D340.7478%26pitch%3D0%26thumbfov%3D100!7i13312!8i6656?entry=ttu" target={'_blank'} rel='noreferrer'>Ir al consultorio

            <Image
              src={map}
              alt='Imagen de mapa'
              priority
            />
          </a>
        </p> */}
      </div>

      {/* <div className={`${styles.screenshot} ${menuOption ? styles.open : styles.closed}`}>
        <ScreenshotComponent />
      </div> */}

      {/* <div className={`${styles.back} ${menuOption ? styles.open : styles.closed}`}>
        <GoBackButton />
      </div> */}

      <div className={`${styles.redes} ${menuOption ? styles.open : styles.closed}`}>

        <ul>
          <li>
            <Link href='https://www.facebook.com/ALIRIO.SOLARTE' target='_blank' rel='noreferrer' passHref>
              <Image
                alt='Facebook'
                src={face}
                priority
              />
            </Link>
          </li>

          <li>
            <Link href='https://www.instagram.com/alirio8308/' target='_blank' rel='noreferrer' passHref>
              <Image
                alt='Instagram'
                src={ins}
                priority
              />
            </Link>
          </li>

          <li>
            <Link href='https://www.instagram.com/alirio8308/' target='_blank' rel='noreferrer' passHref>
              <Image
                alt='Whatsapp'
                src={wha}
                priority
              />
            </Link>
          </li>

          <li className={styles.tiktok}>
            <Link href='https://www.tiktok.com/@cirugia_general?is_from_webapp=1&sender_device=pc' target='_blank' rel='noreferrer' passHref>
              <Image
                alt='TikTok'
                src={tik}
                priority
              />
            </Link>
          </li>
        </ul>
      </div>

      <div className={styles.externo}>
        <a href="https://www.flaticon.es/iconos-gratis/facebook" title="facebook iconos" target='_blank' rel='noreferrer'>Iconos creados por Freepik - Flaticon</a>
      </div>

    </footer>
  )
}

export default Contacto