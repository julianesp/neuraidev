// Para guardar las suscripciones (puedes usar una base de datos más adelante)
const subscriptions = [];

export async function POST(request) {
  try {
    const subscription = await request.json();

    // Verificar si la suscripción ya existe
    const exists = subscriptions.find(
      (sub) => sub.endpoint === subscription.endpoint,
    );

    if (!exists) {
      subscriptions.push(subscription);
      // console.log("Nueva suscripción guardada");
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving subscription:", error);
    return Response.json(
      { error: "Failed to save subscription" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json({ subscriptions });
}
