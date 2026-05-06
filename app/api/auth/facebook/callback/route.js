import { NextResponse } from "next/server";

const FB_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/facebook/callback`;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = await Promise.resolve(searchParams.get("code"));
  const error = await Promise.resolve(searchParams.get("error"));

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/encuesta-presidencial?fb_error=cancelled`
    );
  }

  try {
    // Intercambiar code por access_token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&client_secret=${FB_APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error("No se obtuvo access_token");
    }

    // Obtener perfil del usuario
    const perfilRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`
    );
    const perfil = await perfilRes.json();

    const params = new URLSearchParams({
      fb_id: perfil.id,
      fb_name: perfil.name,
      fb_email: perfil.email || "",
      fb_picture: perfil.picture?.data?.url || "",
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/encuesta-presidencial?${params.toString()}`
    );
  } catch {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/encuesta-presidencial?fb_error=failed`
    );
  }
}
