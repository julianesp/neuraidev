// export const metadata = {
//   title: "Neurai",
//   description: "Página oficial",
// };

// Define los metadatos del layout usando un objeto
export const metadata = {
  title: {
    default: 'Título por Defecto',
    template: '%s - Mi Sitio Web',
  },
  description: 'Descripción por defecto del sitio web',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
