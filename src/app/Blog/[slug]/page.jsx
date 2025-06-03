import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

// Array de posts (considera moverlo a un servicio o API)
const posts = [
  {
    id: 1,
    title: "No seas cavernícola 😁",
    date: "28 de mayo, 2025",
    excerpt:
      "No te quedes con lo que miras en la televisión 📺. Usa internet para investigar y aprender 🧠",
    content: `<p class="text-gray-600 dark:text-gray-300 italic mb-6"><em>¿Sigues esperando que te traigan las respuestas en bandeja de plata? Es hora de despertar y aprovechar el mundo de posibilidades que tienes al alcance de tus dedos 📱.</em></p>

<hr class="my-8 border-gray-300 dark:border-gray-600">

<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">🕰️ Imagínate vivir hace 50 años...</h2>

<p class="mb-4">Para conseguir información, tenías que:</p>
<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>Ir a la biblioteca y buscar en enormes enciclopedias</li>
  <li>Llamar por teléfono y pagar por minutos</li>
  <li>Comprar periódicos para saber las noticias del día anterior</li>
</ul>

<p class="mb-4"><strong>¿Te imaginas esa vida?</strong> Probablemente no, porque naciste en una era diferente. Pero aquí está el punto: <strong>muchas personas siguen viviendo como si fuera 1970.</strong></p>

<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">📱 La realidad de 2025</h2>

<p class="mb-4">Hoy tienes en tu bolsillo un dispositivo más poderoso 💪🏼 que las computadoras que enviaron al hombre a la luna 🌔. <strong>¿Y qué haces con él?</strong></p>

<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>Ver memes en Instagram por horas</li>
  <li>Scroll infinito en TikTok</li>
  <li>Quejarte en Facebook sobre la situación del país</li>
  <li>Esperar que la televisión te diga qué pensar</li>
</ul>

<p class="mb-6 text-5xl font-bold text-black dark:text-yellow-400 text-center">¡DESPIERTA! 🔥</p>

<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">🧠 Tu cerebro no es decoración</h2>

<p class="mb-4">No te quedes con lo que miras en la televisión 📺. Los medios tradicionales tienen agendas, horarios. <strong class="text-black dark:text-yellow-400 text-4xl">Internet no.</strong></p>

<p class="mb-4">En internet puedes:</p>

<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Aprender cualquier cosa</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
  <li><strong>¿Quieres aprender programación?</strong> YouTube, Coursera, Platzi, edX, Udemy</li>
  <li><strong>¿Te interesa la historia?</strong> Documentales, podcasts, cursos online</li>
  <li><strong>¿Necesitas reparar algo?</strong> Tutoriales paso a paso en Youtube o TikTok</li>
  
</ul>

<h2 class="text-2xl text-center font-bold mt-8 mb-4 text-gray-900 dark:text-white">🚫 Deja de hacer esto:</h2>

<h4 class="text-lg font-semibold mt-4 mb-2 text-red-600 dark:text-red-400">❌ "Vi en las noticias que..."</h4>
<p class="mb-4">¿Cuáles noticias? ¿De qué canal? ¿Quién escribió la nota? ¿Cuáles son sus fuentes?</p>

<h4 class="text-lg font-semibold mt-4 mb-2 text-red-600 dark:text-red-400">❌ "Mi primo me dijo que..."</h4>
<p class="mb-4">Tu primo no es Wikipedia. Busca datos reales.</p>

<h2 class="text-2xl font-bold mt-8 mb-4 text-green-600 dark:text-green-400">✅ Empieza a hacer esto:</h2>

<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">1. Cuestiona todo</h3>
<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>"¿Es esto verdad?"</li>
  <li>"¿Quién lo dice?"</li>
  <li>"¿Dónde están las fuentes?"</li>
  <li>"¿Hay otra perspectiva?"</li>
</ul>

<h2 class="text-2xl font-bold mt-8 mb-4 text-blue-600 dark:text-blue-400">🚀 Tu plan de acción (AHORA MISMO):</h2>

<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">Esta semana:</h3>
<ol class="list-decimal pl-6 mb-6 space-y-2">
  <li><strong>Descarga</strong> una app educativa (<a href="https://platzi.com" target="_blank" class="text-blue-600 dark:text-yellow-400 underline">Platzi</a> , <a href="https://duolingo.com" target="_blank" class="text-blue-600 dark:text-yellow-400 underline" target="_blank"> Duolingo</a>,   <a href="https://www.khanacademy.org/" target="_blank" class="text-blue-600 dark:text-yellow-400 underline">Khan Academy</a>, <a href="https://www.coursera.org/" target="_blank" class="text-blue-600 dark:text-yellow-400 underline">Coursera</a>)</li>
  <li><strong>Suscríbete</strong> a 3 canales de YouTube educativos </li>
  <li><strong>Busca</strong> información sobre un tema que te interese</li>
  <li><strong>Verifica</strong> la próxima noticia que veas antes de creerla</li>
</ol>

<h2 class="text-2xl font-bold mt-8 mb-4 text-black dark:text-yellow-400">🎯 El mensaje final</h2>

<p class="mb-4"><strong>No hay excusas válidas.</strong></p>

<ul class="list-disc pl-6 mb-6 space-y-2">
  <li>"Soy muy mayor" → ¡Hay abuelos YouTubers exitosos!</li>
  <li>"No tengo tiempo" → ¡15 minutos al día son 91 horas al año!</li>
  <li>"Es muy complicado" → ¡Todo tiene tutorial!</li>
  <li>"No me gusta la tecnología" → ¡A los cavernícolas tampoco les gustaba el fuego!</li>
</ul>

<hr class="my-8 border-gray-300 dark:border-gray-600">

<p class="text-xl font-bold text-center mb-4">La tecnología no muerde. La ignorancia sí.</p>

<p class="text-xl font-bold text-center text-orange-600 dark:text-yellow-400 mb-6">No seas cavernícola. El futuro es ahora, y tú decides si formas parte de él o te quedas pintando en las paredes de tu cueva. 🔥</p>

<hr class="my-8 border-gray-300 dark:border-gray-600">

<p class="text-gray-600 dark:text-gray-300 italic text-center"><em>¿Qué herramienta nueva vas a probar hoy? Escríbeme al WhatsApp y comienza tu transformación. El mundo digital te está esperando.</em></p>`,
    slug: "no-seas-cavernicola",
  },
];

// Función para obtener todos los posts (esto reemplazaría tu función getAllPosts)
async function getAllPosts() {
  return posts;
}

// Componente de página
export default async function PostPage({ params }) {
  const { slug } = await params;
  // Encontrar el post por slug
  const post = posts.find((p) => p.slug === slug);

  // Si no se encuentra el post, mostrar página 404
  if (!post) {
    notFound();
  }

  return (
    <main className="mt-10 container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/Blog"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-6 inline-block  "
      >
        <div className="bg-black dark:bg-white rounded-full grid place-items-center left-80 absolute transition-transform hover:scale-110 hover:rotate-180 top-18 w-12 h-12">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/neuraidev.appspot.com/o/images%2Fback.svg?alt=media&token=ae65c5f5-97e7-4557-81ef-57c09b11ea1a"
            alt="Volver al blog"
            width={18}
            height={18}
            className="invert dark:invert-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            loading="lazy"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+MTMftoJJoNY6mHQvGgBFO15tquD7xZg="
          />
        </div>
      </Link>

      <article>
        <h1 className="text-3xl font-bold mb-2 mt-6">{post.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
          {post.date}
        </p>

        <div
          className="prose dark:prose-invert max-w-none text-xl leading-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
  );
}

// Generación de rutas estáticas
export async function generateStaticParams() {
  const allPosts = await getAllPosts();

  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Esto añade metadatos para SEO (reemplaza el uso de Head)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post no encontrado",
    };
  }

  return {
    title: `${post.title} | Mi Blog`,
    description: post.excerpt,
  };
}
