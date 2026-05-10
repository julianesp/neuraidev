# neurai.dev

Bienvenido a **neurai.dev**, ecommerce para venta de productos para computadores y celulares.

## Índice


# neurai.dev

## Descripción del Proyecto

neurai.dev es un sitio web construido con Next.js que se enfoca en mostrar los productos locales en el ambiente virtual. Este proyecto utiliza las últimas tecnologías de desarrollo frontend para crear una experiencia de usuario fluida y atractiva.

## Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (v14.2.23)
- **Lenguajes**: JavaScript
- **UI/Componentes**:
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Radix UI](https://www.radix-ui.com/) (accordions, dropdown menus)
  - [Framer Motion](https://www.framer.com/motion/) para animaciones
  - [TailwindCSS](https://tailwindcss.com/) para estilos
- **Networking**: [Axios](https://axios-http.com/) para peticiones HTTP
- **Optimización**: [Sharp](https://sharp.pixelplumbing.com/) para optimización de imágenes
- **Theming**: Soporte para temas claro/oscuro con [next-themes](https://github.com/pacocoursey/next-themes)


## Estructura del Proyecto

```
neuraidev/
├── public/          # Archivos estáticos
├── src/
│   ├── app/         # Rutas y páginas (App Router de Next.js)
│   ├── components/  # Componentes reutilizables
│   ├── lib/         # Utilidades y funciones helper
│   ├── hooks/       # Custom hooks
│   └── styles/      # Estilos globales (SASS)
├── .eslintrc.json   # Configuración de ESLint
├── next.config.js   # Configuración de Next.js
├── package.json     # Dependencias y scripts
├── postcss.config.js # Configuración de PostCSS
└── tailwind.config.js # Configuración de Tailwind CSS
```

## Características Principales

- Diseño responsivo con TailwindCSS
- Componentes de UI reutilizables con shadcn/ui y Radix UI
- Soporte para tema claro/oscuro
- Animaciones fluidas con Framer Motion
- Carruseles interactivos con Embla Carousel
- Optimización de imágenes con Sharp

## Cómo Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nombre-de-la-feature`
3. Haz commit de tus cambios: `git commit -m 'feat: añadir nueva funcionalidad'`
4. Haz push a la rama: `git push origin feature/nombre-de-la-feature`
5. Abre un Pull Request
