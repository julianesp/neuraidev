// // pages/api/send-notification.js o app/api/send-notification/route.js
// import webpush from "web-push";

// webpush.setVapidDetails(
//   "mailto:tu-email@ejemplo.com",
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY,
// );

// export default async function handler(req, res) {
//   if (req.method === "POST") {
//     const { subscription, message } = req.body;

//     try {
//       await webpush.sendNotification(
//         subscription,
//         JSON.stringify({
//           title: "Nueva oferta disponible!",
//           body: message,
//           icon: "/icon-192x192.png",
//           url: "/productos",
//         }),
//       );

//       res.status(200).json({ success: true });
//     } catch (error) {
//       console.error("Error sending notification:", error);
//       res.status(500).json({ error: "Failed to send notification" });
//     }
//   }
// }

import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:julii1295@gmail.com", // Cambia por tu email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export async function POST(request) {
  try {
    const { subscription, message, title } = await request.json();

    const payload = JSON.stringify({
      title: title || "Nueva notificación de tu tienda",
      body: message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      url: "/", // URL a la que redirigir cuando hagan clic
    });

    await webpush.sendNotification(subscription, payload);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return Response.json(
      { error: "Failed to send notification", details: error.message },
      { status: 500 },
    );
  }
}
