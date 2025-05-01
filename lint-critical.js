#!/usr/bin/env node

/**
 * Script personalizado para detectar errores críticos
 * Ejecutar con: node lint-critical.js
 */

// const { execSync } = require("child_process");
// const fs = require("fs");
// const path = require("path");

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Colores para la consola
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.blue}=== Iniciando verificación de errores críticos ===${colors.reset}\n`,
);

// Patrones de errores críticos a buscar
const criticalPatterns = [
  {
    type: "WINDOW_SSR",
    pattern: /window\./g,
    excludePattern: /useEffect|useLayoutEffect/,
    message:
      'Uso de objeto "window" fuera de un useEffect - puede causar errores en SSR',
    suggestion:
      'Mueve el acceso a "window" dentro de un hook useEffect o comprueba si window está definido',
  },
  {
    type: "UNUSED_IMPORT",
    pattern: /import\s+{[^}]*}/g,
    message: "Posible importación no utilizada",
    suggestion: "Elimina importaciones no utilizadas",
  },
  {
    type: "NEXT_LINK_HREF",
    pattern: /<Link[^>]*>(?!.*href)/g,
    message: "Componente Link sin prop href",
    suggestion: "Añade la prop href a todos los componentes Link",
  },
  {
    type: "DIRECT_DOM_MANIPULATION",
    pattern: /document\.|getElementById|querySelector/g,
    excludePattern: /useEffect|useLayoutEffect/,
    message: "Manipulación directa del DOM fuera de useEffect",
    suggestion: "Mueve la manipulación del DOM dentro de un hook useEffect",
  },
];

// Extensiones de archivos a verificar
const extensions = [".js", ".jsx", ".ts", ".tsx"];

// Directorios a excluir
const excludedDirs = [
  "node_modules",
  ".next",
  "out",
  "build",
  "dist",
  "public",
];

// Función para verificar si un directorio debe ser excluido
const shouldExcludeDir = (dir) => {
  return excludedDirs.some((excluded) => dir.includes(excluded));
};

// Función para verificar recursivamente los archivos
const checkFilesRecursively = (dir, fileCallback) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!shouldExcludeDir(filePath)) {
        checkFilesRecursively(filePath, fileCallback);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        fileCallback(filePath);
      }
    }
  });
};

// Función para verificar un archivo
const checkFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  let fileHasIssues = false;

  criticalPatterns.forEach((pattern) => {
    const matches = content.match(pattern.pattern);

    if (matches) {
      // Verificar si hay un patrón de exclusión y si coincide
      if (pattern.excludePattern) {
        const excludeMatches = content.match(pattern.excludePattern);
        if (excludeMatches) {
          // No reportar si hay coincidencia con el patrón de exclusión
          return;
        }
      }

      if (!fileHasIssues) {
        console.log(`\n${colors.cyan}Archivo: ${filePath}${colors.reset}`);
        fileHasIssues = true;
      }

      console.log(
        `  ${colors.red}${pattern.type}:${colors.reset} ${pattern.message}`,
      );
      console.log(
        `  ${colors.green}Sugerencia:${colors.reset} ${pattern.suggestion}`,
      );
      console.log(
        `  ${colors.yellow}Ocurrencias:${colors.reset} ${matches.length}`,
      );
    }
  });

  return fileHasIssues;
};

// Ejecutar ESLint
try {
  console.log(`${colors.blue}Ejecutando ESLint...${colors.reset}`);
  execSync("npx eslint . --max-warnings=0", { stdio: "inherit" });
  console.log(`\n${colors.green}✓ ESLint no encontró errores${colors.reset}`);
} catch (error) {
  console.log(
    `\n${colors.red}❌ ESLint encontró errores (ver arriba)${colors.reset}`,
  );
}

// Verificar errores críticos personalizados
console.log(
  `\n${colors.blue}Verificando patrones de errores críticos...${colors.reset}`,
);

let totalIssuesFound = 0;
const processFile = (filePath) => {
  const hasIssues = checkFile(filePath);
  if (hasIssues) {
    totalIssuesFound++;
  }
};

try {
  checkFilesRecursively(".", processFile);

  if (totalIssuesFound === 0) {
    console.log(
      `\n${colors.green}✓ No se encontraron errores críticos personalizados${colors.reset}`,
    );
  } else {
    console.log(
      `\n${colors.yellow}⚠ Se encontraron problemas en ${totalIssuesFound} archivos${colors.reset}`,
    );
  }
} catch (error) {
  console.error(
    `\n${colors.red}Error al verificar archivos:${colors.reset}`,
    error,
  );
}

console.log(`\n${colors.blue}=== Verificación completada ===${colors.reset}`);
