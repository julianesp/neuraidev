module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Autoprefixer agregará prefijos automáticamente basándose en .browserslistrc
      // Configuración para máxima compatibilidad
      flexbox: 'no-2009', // Solo usar la sintaxis moderna de flexbox
      grid: 'autoplace', // Habilitar autoprefixer para CSS Grid
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'Firefox >= 78',
        'not dead',
        'not IE 11',
      ],
    },
  },
};
