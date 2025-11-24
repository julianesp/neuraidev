"use client";

import { useState } from "react";
import { Facebook } from "lucide-react";
import styles from "./FacebookLogin.module.scss";

export default function FacebookLogin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFacebookLogin = async () => {
    setLoading(true);

    try {
      // Inicializar Facebook SDK
      if (typeof window !== 'undefined' && window.FB) {
        window.FB.login((response) => {
          if (response.authResponse) {
            // Usuario autenticado exitosamente
            window.FB.api('/me', { fields: 'name,email,picture' }, (userData) => {
              setUser({
                name: userData.name,
                email: userData.email,
                picture: userData.picture.data.url
              });

              // Aquí puedes enviar los datos al backend
              // console.log('Usuario autenticado:', userData);
            });
          } else {
            // Login cancelado
          }
          setLoading(false);
        }, { scope: 'public_profile,email' });
      } else {
        alert('Facebook SDK no está cargado. Por favor recarga la página.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error en login de Facebook:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.FB) {
      window.FB.logout(() => {
        setUser(null);
      });
    }
  };

  if (user) {
    return (
      <div className={styles.userProfile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.picture} alt={user.name} className={styles.avatar} />
        <div className={styles.userInfo}>
          <p className={styles.userName}>¡Hola, {user.name}!</p>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={loading}
      className={styles.facebookBtn}
    >
      <Facebook size={20} />
      {loading ? 'Conectando...' : 'Continuar con Facebook'}
    </button>
  );
}
