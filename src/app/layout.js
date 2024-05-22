export const metadata = {
  title: 'Neurai',
  description: 'Página oficial',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
