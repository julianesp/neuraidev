// /lib/getPosts.js

// Esta es una función temporal que devuelve posts de ejemplo
// En el futuro, puedes reemplazarla con una llamada a una API o CMS
export async function getPosts() {
  // Array de posts de ejemplo
  const posts = [
    {
      slug: "mi-opinion-sobre-nextjs",
      title:
        "Por qué Next.js es mi framework favorito para desarrollar sitios web",
      publishedAt: "5 de marzo, 2025",
      category: "Desarrollo Web",
      excerpt:
        "Después de trabajar con varios frameworks, Next.js se ha convertido en mi preferido para desarrollar sitios web. En este artículo comparto mi experiencia y las razones por las que lo recomiendo.",
      coverImage: "/images/nextjs-blog.jpg",
      content: `
          # Por qué Next.js es mi framework favorito para desarrollar sitios web
  
          Después de años de experiencia desarrollando sitios web con diferentes frameworks, he llegado a la conclusión de que Next.js ofrece la mejor combinación de características para la mayoría de los proyectos.
  
          ## Ventajas de Next.js
  
          ### 1. Renderizado híbrido
          
          La capacidad de elegir entre SSR, SSG o ISR según las necesidades de cada página es simplemente genial. Esto permite optimizar el rendimiento y la experiencia del usuario de manera específica para cada parte de tu aplicación.
  
          ### 2. Enrutamiento basado en archivos
          
          La estructura de carpetas como sistema de rutas hace que sea muy intuitivo organizar tu proyecto. Además, con la App Router, las páginas, layouts y componentes de servidor están mejor organizados que nunca.
  
          ### 3. Optimización de imágenes
          
          El componente Image de Next.js es una maravilla para la optimización automática de imágenes, lo que mejora significativamente los tiempos de carga.
  
          ## Conclusión
          
          Si estás pensando en qué framework utilizar para tu próximo proyecto, te recomiendo darle una oportunidad a Next.js. La curva de aprendizaje inicial vale completamente la pena por todas las ventajas que ofrece.
        `,
    },
    {
      slug: "el-futuro-de-la-ia-en-el-desarrollo-web",
      title: "El impacto de la IA en el desarrollo web moderno",
      publishedAt: "1 de marzo, 2025",
      category: "Tecnología",
      excerpt:
        "La inteligencia artificial está transformando la manera en que desarrollamos sitios web. Analizo cómo estas herramientas están cambiando nuestro flujo de trabajo y qué podemos esperar en el futuro.",
      coverImage: "/images/ai-web-dev.jpg",
      content: `
          # El impacto de la IA en el desarrollo web moderno
  
          La inteligencia artificial está revolucionando la forma en que creamos sitios web, desde la generación de código hasta el diseño de interfaces.
  
          ## Herramientas de IA para desarrolladores
  
          Las nuevas herramientas basadas en IA están permitiendo a los desarrolladores:
  
          - Generar código a partir de descripciones en lenguaje natural
          - Depurar código más eficientemente
          - Crear diseños personalizados sin necesidad de un diseñador
          - Optimizar el SEO con contenido generado específicamente para cada audiencia
  
          ## El desarrollador del futuro
  
          En lugar de reemplazar a los desarrolladores, la IA está potenciando sus capacidades, permitiéndoles enfocarse en tareas de mayor valor mientras se automatizan los aspectos más repetitivos.
  
          ## Conclusión
  
          La IA no es una amenaza para los desarrolladores web, sino una oportunidad para evolucionar y mejorar. Aquellos que aprendan a integrar estas herramientas en su flujo de trabajo tendrán una ventaja competitiva significativa.
        `,
    },
  ];

  return posts;
}

// Función para obtener un post específico por su slug
export async function getPostBySlug(slug) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) || null;
}
