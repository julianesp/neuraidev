import { headers } from "next/headers";
import { Webhook } from "svix";
import { createClient } from "@supabase/supabase-js";
// DESHABILITADO TEMPORALMENTE - n8n integration
// import { notifyUserCreated } from "@/lib/n8nService";

// Inicializar Supabase con service role key (necesario para bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  // Obtener el webhook secret de Clerk
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local"
    );
  }

  // Obtener headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Si no hay headers, error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Obtener el body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Crear una nueva instancia de Svix con el secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verificar el payload con los headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // El evento está verificado, procesar
  const { id } = evt.data;
  const eventType = evt.type;

  // eslint-disable-next-line no-console
  console.log(`Webhook with ID ${id} and type ${eventType}`);
  // eslint-disable-next-line no-console
  console.log("Webhook body:", body);

  // Manejar el evento user.created
  if (eventType === "user.created") {
    const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses?.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    try {
      // Crear perfil en Supabase
      const { data, error } = await supabase.from("profiles").insert([
        {
          clerk_user_id: clerkUserId,
          email: primaryEmail?.email_address || "",
          nombre_completo: `${first_name || ""} ${last_name || ""}`.trim() || null,
          avatar_url: image_url || null,
        },
      ]);

      if (error) {
        console.error("Error creating profile in Supabase:", error);
        return new Response(
          JSON.stringify({ error: "Error creating profile" }),
          { status: 500 }
        );
      }

      // eslint-disable-next-line no-console
      console.log("Profile created successfully:", data);

      // DESHABILITADO TEMPORALMENTE - n8n integration
      // Notificar a n8n del nuevo usuario (para onboarding automático)
      // try {
      //   await notifyUserCreated({
      //     id: clerkUserId,
      //     email: primaryEmail?.email_address || "",
      //     firstName: first_name,
      //     lastName: last_name,
      //   });
      // } catch (n8nError) {
      //   // No bloqueamos si falla n8n
      //   console.error("Error notifying n8n:", n8nError);
      // }
    } catch (error) {
      console.error("Error in user.created handler:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }

  // Manejar el evento user.updated
  if (eventType === "user.updated") {
    const { id: clerkUserId, email_addresses, first_name, last_name, image_url } = evt.data;

    const primaryEmail = email_addresses?.find(
      (email) => email.id === evt.data.primary_email_address_id
    );

    try {
      // Actualizar perfil en Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          email: primaryEmail?.email_address || "",
          nombre_completo: `${first_name || ""} ${last_name || ""}`.trim() || null,
          avatar_url: image_url || null,
        })
        .eq("clerk_user_id", clerkUserId);

      if (error) {
        console.error("Error updating profile in Supabase:", error);
        return new Response(
          JSON.stringify({ error: "Error updating profile" }),
          { status: 500 }
        );
      }

      // eslint-disable-next-line no-console
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error in user.updated handler:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }

  // Manejar el evento user.deleted
  if (eventType === "user.deleted") {
    const { id: clerkUserId } = evt.data;

    try {
      // Eliminar perfil en Supabase (esto también eliminará las tiendas por CASCADE)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("clerk_user_id", clerkUserId);

      if (error) {
        console.error("Error deleting profile in Supabase:", error);
        return new Response(
          JSON.stringify({ error: "Error deleting profile" }),
          { status: 500 }
        );
      }

      // eslint-disable-next-line no-console
      console.log("Profile deleted successfully");
    } catch (error) {
      console.error("Error in user.deleted handler:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
