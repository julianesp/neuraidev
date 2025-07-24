// module.exports = {
//   root: true,
//   env: {
//     browser: true,
//     es2021: true,
//     node: true,
//   },
//   extends: [
//     "eslint:recommended",
//     "plugin:react/recommended",
//     // Quitamos la configuración de react-hooks para evitar conflictos
//     // 'plugin:react-hooks/recommended',
//     "plugin:@typescript-eslint/recommended",
//     "plugin:jsx-a11y/recommended",
//     "plugin:import/errors",
//     "plugin:import/warnings",
//     "next/core-web-vitals", // Esta ya incluye configuración para react-hooks
//   ],
//   parser: "@typescript-eslint/parser",
//   parserOptions: {
//     ecmaFeatures: {
//       jsx: true,
//     },
//     ecmaVersion: 12,
//     sourceType: "module",
//   },
//   plugins: [
//     "react",
//     // La configuración next/core-web-vitals ya incluye react-hooks
//     // 'react-hooks',
//     "@typescript-eslint",
//     "jsx-a11y",
//     "import",
//   ],
//   settings: {
//     react: {
//       version: "detect",
//     },
//   },
//   rules: {
//     // Reglas personalizadas específicas para tu proyecto
//     "react/react-in-jsx-scope": "off", // No es necesario importar React en Next.js >= 17
//     "react/prop-types": "off", // Si usas TypeScript, no necesitas PropTypes
//     "react-hooks/rules-of-hooks": "error",
//     "react-hooks/exhaustive-deps": "warn",
//     "@typescript-eslint/explicit-module-boundary-types": "off",
//     // "@typescript-eslint/no-unused-vars": [
//     //   "warn",
//     //   {
//     //     argsIgnorePattern: "^_",
//     //     varsIgnorePattern:
//     //       "^presentationImages$|^setPresentationImages$|^loading$|^setLoading$|^error$|^setError$|^currentIndex$|^setCurrentIndex$|^isPaused$|^setIsPaused$|^autoplayTimerRef$|^clearTimeout$|^setCurrentImage$|^accesoriosDestacados$|^todosAccesorios$|^relatedSlideIndex$|^accesorioActual$|^isAtBottom$|^cargando$",
//     //   },
//     // ],
//     "@tyscript-eslint/no-unused-vars": "off",
//     "no-console": ["warn", { allow: ["warn", "error"] }],
//     "import/no-unresolved": "off", // Si tienes problemas con las importaciones en Next.js

//     // Reglas específicas que detecté en tu código
//     "react/no-unescaped-entities": "warn",
//     "jsx-a11y/anchor-is-valid": "warn", // Para enlaces de Next.js
//     "jsx-a11y/click-events-have-key-events": "warn", // Para enlaces con onClick pero sin eventos de teclado
//     "jsx-a11y/no-static-element-interactions": "warn", // Para elementos no interactivos con manejadores de eventos

//     // Reglas para detectar errores comunes
//     "no-unused-expressions": "warn",
//     "no-undef": "error",
//     "no-var": "error",
//     "prefer-const": "warn",
//     "spaced-comment": ["warn", "always"], // Para comentarios consistentes
//   },
//   // Ignora ciertos archivos y directorios
//   ignorePatterns: [
//     "node_modules/",
//     ".next/",
//     "out/",
//     "public/",
//     "*.config.js",
//     "*.setup.js",
//   ],
// };

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    // Quitamos la configuración de react-hooks para evitar conflictos
    // 'plugin:react-hooks/recommended',
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "next/core-web-vitals", // Esta ya incluye configuración para react-hooks
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [
    "react",
    // La configuración next/core-web-vitals ya incluye react-hooks
    // 'react-hooks',
    "@typescript-eslint",
    "jsx-a11y",
    "import",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Reglas personalizadas específicas para tu proyecto
    "react/react-in-jsx-scope": "off", // No es necesario importar React en Next.js >= 17
    "react/prop-types": "off", // Si usas TypeScript, no necesitas PropTypes
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Desactivar completamente las advertencias de variables no utilizadas
    "@typescript-eslint/no-unused-vars": "off",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "import/no-unresolved": "off", // Si tienes problemas con las importaciones en Next.js

    // Reglas específicas que detecté en tu código
    "react/no-unescaped-entities": "warn",
    "jsx-a11y/anchor-is-valid": "warn", // Para enlaces de Next.js
    "jsx-a11y/click-events-have-key-events": "warn", // Para enlaces con onClick pero sin eventos de teclado
    "jsx-a11y/no-static-element-interactions": "warn", // Para elementos no interactivos con manejadores de eventos

    // Reglas para detectar errores comunes
    "no-unused-expressions": "warn",
    "no-undef": "error",
    "no-var": "error",
    "prefer-const": "warn",
    "spaced-comment": ["warn", "always"], // Para comentarios consistentes
  },
  // Ignora ciertos archivos y directorios
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "public/",
    "*.config.js",
    "*.setup.js",
  ],
};
