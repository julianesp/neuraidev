"use client";

import { useEffect } from "react";

export default function FacebookComments() {
  useEffect(() => {
    // Cargar el SDK de Facebook si aún no está cargado
    if (window.FB) {
      window.FB.XFBML.parse();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        xfbml: true,
        version: "v19.0",
      });
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/es_LA/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  }, []);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://neurai.dev/pollos-colon";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border border-amber-100 dark:border-gray-700">
      <div id="fb-root" />
      <div
        className="fb-comments"
        data-href={pageUrl}
        data-width="100%"
        data-numposts="10"
        data-order-by="reverse_time"
        data-lazy="true"
      />
    </div>
  );
}
