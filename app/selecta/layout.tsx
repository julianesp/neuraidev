import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Selecta FM 93.3 - En Vivo | Valle de Sibundoy, Putumayo',
  description: 'Escucha Selecta FM 93.3 en vivo desde Valle de Sibundoy, Putumayo. Música 24/7, funciona con celular bloqueado. Transmisión en directo.',
  keywords: 'Selecta FM, radio en vivo, Valle de Sibundoy, Putumayo, 93.3 FM, radio online, streaming, música en vivo',
  authors: [{ name: 'Neurai Dev' }],

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://www.neurai.dev/selecta',
    siteName: 'Neurai Dev',
    title: 'Selecta FM 93.3 - Escucha en Vivo',
    description: '🎵 Radio en vivo desde Valle de Sibundoy, Putumayo. Funciona con celular bloqueado. ¡Escucha ahora!',
    images: [
      {
        url: 'https://selectafm.com/wp-content/uploads/2024/02/selecta-logo.jpg',
        width: 512,
        height: 512,
        alt: 'Selecta FM 93.3',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Selecta FM 93.3 - En Vivo',
    description: '🎵 Radio en vivo desde Valle de Sibundoy, Putumayo. ¡Escucha ahora!',
    images: ['https://selectafm.com/wp-content/uploads/2024/02/selecta-logo.jpg'],
  },

  // Meta tags adicionales
  other: {
    'og:audio': 'https://radio25.virtualtronics.com/proxy/selectafmsibundoy?mp=/stream',
    'og:audio:type': 'audio/mpeg',
  },

  // Canonical URL
  alternates: {
    canonical: 'https://www.neurai.dev/selecta',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function SelectaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
