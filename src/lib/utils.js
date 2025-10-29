// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Loads and merges accessories data from all relevant JSON files in the public folder
 * @returns {Promise<Array>} Array of normalized accessory objects
 */
export async function loadAllAccessories() {
  // List of accessory-related JSON files to load
  const accessoryFiles = [
    "/accesoriosDestacados.json",
    "/accesoriosNuevos.json",
    "/accesoriosDestacados.json",
    "/accesoriesDamas.json",
    "/accesoriesBooksNew.json",
    "/accesoriesBooksOld.json",
    "/accesorios_generales.json",
  ];

  try {
    const allAccessories = [];
    let idCounter = 1; // For generating IDs if not present

    // Load each file and process it
    for (const file of accessoryFiles) {
      try {
        const response = await fetch(file);

        // Skip if file not found or other errors
        if (!response.ok) {
          console.warn(`File not found or could not be loaded: ${file}`);
          continue;
        }

        const data = await response.json();

        // Handle different JSON structures
        let accessories = [];

        if (Array.isArray(data)) {
          // Direct array of accessories (like in accesoriosDestacados.json)
          accessories = data;
        } else if (data.accesorios && Array.isArray(data.accesorios)) {
          // Object with accesorios array (like in accesoriosNuevos.json)
          accessories = data.accesorios;
        } else {
          console.warn(`Unrecognized data structure in file: ${file}`);
          continue;
        }

        // Process each accessory and normalize the data structure
        for (const item of accessories) {
          // Ensure we have an ID
          const id = item.id ?? idCounter++;

          // Determine title (different files use different property names)
          const title = item.title || item.nombre || "";

          // Determine description
          const description = item.description || item.descripcion || "";

          // Determine price
          const price = item.price || item.precio || "";

          // Handle different image structures
          let images;

          if (item.imagenPrincipal) {
            // Single main image
            images = item.imagenPrincipal;
          } else if (typeof item.images === "string") {
            // Single image as string
            images = item.images;
          } else if (Array.isArray(item.images)) {
            // Array of images
            images = item.images;
          } else if (Array.isArray(item.imagenes)) {
            // Array of image objects with URL property
            images = item.imagenes.map((img) => img.url);
          } else {
            // Default empty array
            images = [];
          }

          // Create normalized accessory object
          const normalizedAccessory = {
            id,
            title,
            description,
            price,
            images,
            // Keep original data for compatibility
            ...item,
          };

          allAccessories.push(normalizedAccessory);
        }
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
        // Continue with other files even if one fails
      }
    }

    return allAccessories;
  } catch (error) {
    console.error("Error loading accessories:", error);
    throw new Error("Failed to load accessories data");
  }
}
