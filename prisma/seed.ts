// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de datos...");

  // Crear categorías de ejemplo
  const categorias = await Promise.all([
    prisma.categoria.upsert({
      where: { slug: "celulares" },
      update: {},
      create: {
        nombre: "Celulares",
        slug: "celulares",
        descripcion: "Smartphones y teléfonos móviles",
        icono: "📱",
        orden: 1,
        activa: true
      }
    }),
    prisma.categoria.upsert({
      where: { slug: "computadoras" },
      update: {},
      create: {
        nombre: "Computadoras",
        slug: "computadoras",
        descripcion: "Laptops, desktops y accesorios de cómputo",
        icono: "💻",
        orden: 2,
        activa: true
      }
    }),
    prisma.categoria.upsert({
      where: { slug: "accesorios" },
      update: {},
      create: {
        nombre: "Accesorios",
        slug: "accesorios",
        descripcion: "Accesorios para dispositivos electrónicos",
        icono: "🎧",
        orden: 3,
        activa: true
      }
    }),
    prisma.categoria.upsert({
      where: { slug: "libros" },
      update: {},
      create: {
        nombre: "Libros",
        slug: "libros",
        descripcion: "Libros nuevos y usados",
        icono: "📚",
        orden: 4,
        activa: true
      }
    })
  ]);

  console.log(`✅ Creadas ${categorias.length} categorías`);

  // Crear tienda principal
  const tiendaPrincipal = await prisma.tienda.upsert({
    where: { id: "neuraidev-principal" },
    update: {},
    create: {
      id: "neuraidev-principal",
      nombre: "Neuraidev - Tienda Principal",
      descripcion: "La tienda principal de Neuraidev en el Valle del Cauca",
      direccion: "Valle del Cauca, Colombia",
      telefono: "+57 300 123 4567",
      email: "ventas@neuraidev.com",
      activa: true
    }
  });

  console.log("✅ Creada tienda principal");

  // Crear productos de ejemplo
  const productos = [
    {
      nombre: "iPhone 15 Pro Max",
      descripcion: "El último iPhone de Apple con chip A17 Pro y cámara de 48MP",
      precio: 5299000,
      precioAnterior: 5699000,
      categoria: "celulares",
      destacado: true,
      stock: 5,
      marca: "Apple",
      condicion: "nuevo",
      tags: ["smartphone", "apple", "ios", "premium"],
      imagenPrincipal: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
    },
    {
      nombre: "MacBook Air M2",
      descripcion: "Laptop ultraligera con chip M2 de Apple, 8GB RAM y 256GB SSD",
      precio: 4899000,
      categoria: "computadoras",
      destacado: true,
      stock: 3,
      marca: "Apple",
      condicion: "nuevo",
      tags: ["laptop", "apple", "macbook", "m2"],
      imagenPrincipal: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
    },
    {
      nombre: "AirPods Pro 2da Gen",
      descripcion: "Audífonos inalámbricos con cancelación activa de ruido",
      precio: 899000,
      categoria: "accesorios",
      destacado: false,
      stock: 10,
      marca: "Apple",
      condicion: "nuevo",
      tags: ["audifonos", "inalambricos", "apple", "noise-cancelling"],
      imagenPrincipal: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
    },
    {
      nombre: "Cien años de soledad",
      descripcion: "Novela clásica de Gabriel García Márquez - Edición usado en buen estado",
      precio: 25000,
      categoria: "libros",
      destacado: false,
      stock: 1,
      marca: "Editorial Sudamericana",
      condicion: "usado",
      tags: ["literatura", "clasico", "garcia-marquez", "realismo-magico"],
      imagenPrincipal: "https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Flocal.png?alt=media&token=28b13e34-2396-4934-925b-75863006bb4b"
    }
  ];

  for (const productoData of productos) {
    await prisma.producto.create({
      data: {
        ...productoData,
        tienda: {
          connect: { id: tiendaPrincipal.id }
        },
        imagenes: {
          create: [
            {
              url: productoData.imagenPrincipal,
              alt: `Imagen de ${productoData.nombre}`,
              orden: 0
            }
          ]
        }
      }
    });
  }

  console.log(`✅ Creados ${productos.length} productos de ejemplo`);

  // Crear cliente de ejemplo
  const clienteEjemplo = await prisma.cliente.create({
    data: {
      nombre: "Cliente Ejemplo",
      email: "cliente@ejemplo.com",
      telefono: "+57 300 111 2222",
      direccion: "Cali, Valle del Cauca"
    }
  });

  console.log("✅ Creado cliente de ejemplo");

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });