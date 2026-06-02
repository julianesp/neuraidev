import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  return NextResponse.json({
    celular: process.env.ADMIN_CELULAR || '',
    emailCorporativo: process.env.ADMIN_EMAIL_CORPORATIVO || '',
  });
}
