/**
 * Portafolio de sitios web / PWAs desarrollados.
 *
 * Fuente única compartida entre la página de inicio y la página de
 * /servicios/desarrollador-software, para que ambas muestren la misma lista.
 */
export const portafolioSitios = [
  {
    id: 1,
    nombre: "posib.dev",
    url: "https://posib.dev/",
    descripcion: "Plataforma de desarrollo web y servicios digitales",
    imagen: "https://pub-ea40242d92ce470fbb6e43d46f01cefe.r2.dev/images/logo.png",
    // Ícono con fondo transparente: completo dentro del círculo, sin recortar.
    ajuste: "contain",
  },
  {
    id: 2,
    nombre: "ipsinka.com",
    url: "https://ipsinka.com/",
    descripcion: "Sistema de gestión y servicios administrativos",
    imagen: "https://pub-1180f62273e4461daa58e3267d5d7b32.r2.dev/logo.jpg",
  },
  {
    id: 3,
    nombre: "neurai.dev",
    url: "https://neurai.dev/",
    descripcion: "E-commerce de tecnología y servicios profesionales",
    imagen: "https://media.neurai.dev/logo.png",
    // Retrato vertical: encuadre arriba para que se vea la cara.
    posicion: "top",
  },
  {
    id: 4,
    nombre: "motaxi.dev",
    url: "https://motaxi.dev/",
    descripcion: "Plataforma de servicios de transporte y movilidad",
    imagen: "/portafolio/motaxi.png",
  },
];

export default portafolioSitios;
