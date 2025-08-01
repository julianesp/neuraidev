import Head from 'next/head';

const ProductMetaTags = ({ product, category }) => {
  if (!product) return null;

  // Generar URL de imagen OG dinámica
  const getOGImageUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neuraidev.vercel.app';
    const ogParams = new URLSearchParams();
    
    // Parámetros para la imagen OG
    ogParams.set('title', product.nombre || 'Producto');
    
    if (product.precio) {
      const priceStr = typeof product.precio === 'number' 
        ? product.precio.toLocaleString('es-CO')
        : product.precio.toString();
      ogParams.set('price', priceStr);
    }
    
    if (product.descripcion) {
      // Limpiar descripción de emojis para la imagen
      const cleanDescription = product.descripcion
        .replace(/[^\w\s\-.,áéíóúñü]/gi, '')
        .trim();
      ogParams.set('description', cleanDescription);
    }
    
    if (category) {
      ogParams.set('category', category);
    }
    
    // Incluir imagen del producto si existe
    if (product.imagenPrincipal) {
      ogParams.set('image', product.imagenPrincipal);
    } else if (product.imagenes && product.imagenes.length > 0) {
      const firstImage = typeof product.imagenes[0] === 'object' && product.imagenes[0].url
        ? product.imagenes[0].url
        : product.imagenes[0];
      ogParams.set('image', firstImage);
    }
    
    return `${baseUrl}/api/og?${ogParams.toString()}`;
  };

  // Generar descripción optimizada
  const getProductDescription = () => {
    let description = product.descripcion || product.nombre;
    
    // Limpiar emojis y caracteres especiales para mejor SEO
    description = description.replace(/[^\w\s\-.,áéíóúñü]/gi, '').trim();
    
    // Agregar precio si existe
    const price = product.precio 
      ? (typeof product.precio === 'number' 
          ? `$${product.precio.toLocaleString('es-CO')}` 
          : `$${product.precio}`)
      : '';
    
    // Agregar información adicional
    const extras = [];
    if (price) extras.push(`Precio: ${price}`);
    if (product.marca) extras.push(`Marca: ${product.marca}`);
    if (product.disponible !== undefined) {
      extras.push(product.disponible ? 'Disponible' : 'No disponible');
    }
    
    const finalDescription = extras.length > 0 
      ? `${description} | ${extras.join(' | ')}`
      : description;

    // Limitar a 155 caracteres para SEO
    return finalDescription.length > 155 
      ? finalDescription.substring(0, 152) + '...'
      : finalDescription;
  };

  // Obtener URL actual
  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://neuraidev.vercel.app'}`;
  };

  const ogImageUrl = getOGImageUrl();
  const productDescription = getProductDescription();
  const currentUrl = getCurrentUrl();
  const siteName = "NeuraIdev";
  const productTitle = `${product.nombre} | ${siteName}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{productTitle}</title>
      <meta name="description" content={productDescription} />
      <meta name="keywords" content={`${product.nombre}, ${category || 'accesorios'}, ${product.marca || ''}, productos, tecnología`} />
      
      {/* Open Graph Meta Tags (Facebook, WhatsApp, etc.) */}
      <meta property="og:title" content={product.nombre} />
      <meta property="og:description" content={productDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={product.nombre} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="es_ES" />
      
      {/* Información adicional del producto */}
      {product.precio && (
        <>
          <meta property="product:price:amount" content={typeof product.precio === 'number' ? product.precio : product.precio.toString()} />
          <meta property="product:price:currency" content="COP" />
        </>
      )}
      
      {product.disponible !== undefined && (
        <meta property="product:availability" content={product.disponible ? "in stock" : "out of stock"} />
      )}
      
      {product.marca && <meta property="product:brand" content={product.marca} />}
      {category && <meta property="product:category" content={category} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={product.nombre} />
      <meta name="twitter:description" content={productDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      <meta name="twitter:image:alt" content={product.nombre} />
      
      {/* WhatsApp específico (usa Open Graph) */}
      <meta property="og:image:type" content="image/jpeg" />
      
      {/* Schema.org structured data para mejor SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.nombre,
            "description": productDescription,
            "image": ogImageUrl,
            "brand": {
              "@type": "Brand",
              "name": product.marca || "Generic"
            },
            "offers": {
              "@type": "Offer",
              "price": product.precio,
              "priceCurrency": "COP",
              "availability": product.disponible ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "url": currentUrl
            },
            ...(product.peso && { "weight": product.peso }),
            ...(product.dimensiones && { "size": product.dimensiones }),
            ...(product.garantia && { "warranty": `${product.garantia} meses` })
          })
        }}
      />
    </Head>
  );
};

export default ProductMetaTags;