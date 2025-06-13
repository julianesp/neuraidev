// hooks/useNotifications.js
import { useEffect, useState } from "react";

export function useNotifications() {
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js");
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToNotifications() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    setSubscription(sub);

    // Enviar la suscripción al servidor
    await fetch("/api/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sub),
    });

    return sub;
  }

  return {
    subscription,
    isSupported,
    subscribeToNotifications,
  };
}
