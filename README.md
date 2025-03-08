# neurai.dev

Bienvenido a **neurai.dev**, un sitio web dedicado a mostrar mi preparación como ingeniero de software utilizando el lenguaje JavaScript para el frontend y backend (próximamente).

## Índice

- Sitio web personal enfocado en aplicar las tecnologías del momento.
- JavaScript, Next.js, CSS Grid, flex, Git.
- [Instalación](#instalación)
- [Uso](#uso)
- [Contribuciones](#contribuciones)
- [Licencia] MIT
- [Contacto](#https://wa.me/573174503604)

# NeurAIDev

## Descripción del Proyecto

neurai.dev es un sitio web construido con Next.js que se enfoca en mostrar mi perfil profesional. Este proyecto utiliza las últimas tecnologías de desarrollo frontend para crear una experiencia de usuario fluida y atractiva.

## Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (v14.2.23)
- **Lenguajes**: JavaScript
- **UI/Componentes**:
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Radix UI](https://www.radix-ui.com/) (accordions, dropdown menus)
  - [Framer Motion](https://www.framer.com/motion/) para animaciones
  - [Embla Carousel](https://www.embla-carousel.com/) para carruseles
  - [TailwindCSS](https://tailwindcss.com/) para estilos
  - [DaisyUI](https://daisyui.com/) como complemento de Tailwind
- **Networking**: [Axios](https://axios-http.com/) para peticiones HTTP
- **Optimización**: [Sharp](https://sharp.pixelplumbing.com/) para optimización de imágenes
- **Theming**: Soporte para temas claro/oscuro con [next-themes](https://github.com/pacocoursey/next-themes)

## Requisitos Previos

- Node.js (versión recomendada: 18.x o superior)
- npm o yarn
- Conocimientos de React y Next.js
- Conocimientos básicos de TailwindCSS

## Instalación

1. Clona este repositorio

   ```bash
   git clone https://github.com/[tu-usuario]/neuraidev.git
   cd neuraidev
   ```

2. Instala las dependencias

   ```bash
   npm install
   # o
   yarn install
   ```

3. Inicia el servidor de desarrollo

   ```bash
   npm run dev
   # o
   yarn dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia la aplicación en modo producción
- `npm run lint` - Ejecuta el linter para verificar errores de código

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

## Convenciones de Código

Este proyecto usa:

- ESLint y Prettier para formateo de código
- Comillas dobles para strings (según configuración de Prettier)
- Las reglas completas están definidas en los archivos `.eslintrc.json` y en la configuración de Prettier del package.json

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
