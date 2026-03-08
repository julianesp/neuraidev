/**
 * EcommerceFacade - Facade Pattern
 *
 * PROPÓSITO: Simplificar la interacción con múltiples servicios relacionados
 *
 * PATRÓN: Facade
 * - Proporciona una interfaz unificada para un conjunto de interfaces en un subsistema
 * - Hace que el subsistema sea más fácil de usar
 *
 * BENEFICIOS:
 * - Los componentes no necesitan saber sobre múltiples repositorios/servicios
 * - Reduce el acoplamiento
 * - Simplifica el código del cliente
 *
 * EJEMPLO DE USO:
 *
 * // ❌ SIN FACADE (complicado):
 * const productRepo = createProductRepository(supabase);
 * const cartService = createCartService(productRepo);
 * const orderRepo = createOrderRepository(supabase);
 * const product = await productRepo.findById(id);
 * const result = await cartService.addToCart(cart, product);
 *
 * // ✅ CON FACADE (simple):
 * const ecommerce = createEcommerceFacade(supabase);
 * const result = await ecommerce.addProductToCart(cart, productId);
 */

import { createProductRepository } from '../repositories/ProductRepository';
import { createBlogRepository } from '../repositories/BlogRepository';
import { createOrderRepository } from '../repositories/OrderRepository';
import { createCartService } from '../services/CartService';
import { createBlogService } from '../services/BlogService';

export class EcommerceFacade {
  constructor(dbClient) {
    // Inicializar todos los repositorios
    this.productRepo = createProductRepository(dbClient);
    this.blogRepo = createBlogRepository(dbClient);
    this.orderRepo = createOrderRepository(dbClient);

    // Inicializar servicios
    this.cartService = createCartService(this.productRepo);
    this.blogService = createBlogService(this.blogRepo);
  }

  /**
   * ========================================
   * OPERACIONES DE PRODUCTOS
   * ========================================
   */

  /**
   * Obtiene un producto por ID
   */
  async getProduct(productId) {
    return await this.productRepo.findById(productId);
  }

  /**
   * Obtiene productos por categoría
   */
  async getProductsByCategory(category, options = {}) {
    return await this.productRepo.findByCategory(category, options);
  }

  /**
   * Busca productos
   */
  async searchProducts(searchTerm, limit = 20) {
    return await this.productRepo.search(searchTerm, limit);
  }

  /**
   * Obtiene productos destacados
   */
  async getFeaturedProducts(limit = 10) {
    return await this.productRepo.findFeatured(limit);
  }

  /**
   * Obtiene productos relacionados
   */
  async getRelatedProducts(productId, category, limit = 8) {
    return await this.productRepo.findRelated(productId, category, limit);
  }

  /**
   * ========================================
   * OPERACIONES DE CARRITO
   * ========================================
   */

  /**
   * Agrega un producto al carrito
   * (Facade maneja la complejidad de obtener el producto y agregarlo)
   */
  async addProductToCart(currentCart, productInfo) {
    return await this.cartService.addToCart(currentCart, productInfo);
  }

  /**
   * Actualiza cantidad en el carrito
   */
  async updateCartQuantity(currentCart, productId, variacion, newQuantity) {
    return await this.cartService.updateQuantity(
      currentCart,
      productId,
      variacion,
      newQuantity
    );
  }

  /**
   * Elimina producto del carrito
   */
  removeProductFromCart(currentCart, productId, variacion = null) {
    return this.cartService.removeFromCart(currentCart, productId, variacion);
  }

  /**
   * Limpia el carrito
   */
  clearCart() {
    return this.cartService.clearCart();
  }

  /**
   * Valida stock del carrito
   */
  async validateCartStock(cart) {
    return await this.cartService.validateCartStock(cart);
  }

  /**
   * Sincroniza carrito con la BD
   */
  async syncCart(cart) {
    return await this.cartService.syncCart(cart);
  }

  /**
   * Calcula total del carrito
   */
  calculateCartTotal(cart) {
    return this.cartService.calculateTotal(cart);
  }

  /**
   * ========================================
   * OPERACIONES DE ÓRDENES
   * ========================================
   */

  /**
   * Crea una orden completa (Facade simplifica el proceso completo)
   */
  async createOrder(orderData) {
    // 1. Validar stock de todos los productos
    const stockValidation = await this.cartService.validateCartStock(
      orderData.items
    );

    if (!stockValidation.valid) {
      throw new Error(
        `Stock insuficiente: ${stockValidation.invalidItems.map((i) => i.productName).join(', ')}`
      );
    }

    // 2. Crear la orden
    const order = await this.orderRepo.create(orderData);

    // 3. Decrementar stock de cada producto
    for (const item of orderData.items) {
      await this.productRepo.decrementStock(item.id, item.cantidad);
    }

    return order;
  }

  /**
   * Obtiene una orden por ID
   */
  async getOrder(orderId) {
    return await this.orderRepo.findById(orderId);
  }

  /**
   * Obtiene órdenes de un usuario
   */
  async getUserOrders(userId, options = {}) {
    return await this.orderRepo.findByUserId(userId, options);
  }

  /**
   * ========================================
   * OPERACIONES DE BLOG
   * ========================================
   */

  /**
   * Obtiene posts del blog
   */
  async getBlogPosts(filters = {}) {
    return await this.blogService.getPublishedPosts(filters);
  }

  /**
   * Obtiene un post por slug
   */
  async getBlogPost(slug, incrementViews = true) {
    return await this.blogService.getPostBySlug(slug, incrementViews);
  }

  /**
   * Obtiene posts relacionados
   */
  async getRelatedBlogPosts(postId, category, limit = 3) {
    return await this.blogService.getRelatedPosts(postId, category, limit);
  }

  /**
   * Busca posts
   */
  async searchBlogPosts(searchTerm, options = {}) {
    return await this.blogService.searchPosts(searchTerm, options);
  }

  /**
   * ========================================
   * OPERACIONES COMPUESTAS (Alto nivel)
   * ========================================
   */

  /**
   * Obtiene toda la información necesaria para una página de producto
   * (Producto + Relacionados en una sola llamada)
   */
  async getProductPageData(productId) {
    const product = await this.getProduct(productId);

    if (!product) {
      return null;
    }

    const relatedProducts = await this.getRelatedProducts(
      productId,
      product.categoria,
      8
    );

    return {
      product,
      relatedProducts,
    };
  }

  /**
   * Obtiene toda la información necesaria para una página de blog
   * (Post + Relacionados en una sola llamada)
   */
  async getBlogPageData(slug) {
    const post = await this.getBlogPost(slug);

    if (!post) {
      return null;
    }

    const relatedPosts = await this.getRelatedBlogPosts(
      post.id,
      post.category,
      3
    );

    return {
      post,
      relatedPosts,
    };
  }

  /**
   * Obtiene datos del home page (productos destacados + posts recientes)
   */
  async getHomePageData() {
    const [featuredProducts, recentPosts] = await Promise.all([
      this.getFeaturedProducts(8),
      this.getBlogPosts({ limit: 3 }),
    ]);

    return {
      featuredProducts,
      recentPosts,
    };
  }

  /**
   * Proceso completo de checkout
   */
  async processCheckout(checkoutData) {
    const { cart, customerInfo, paymentInfo } = checkoutData;

    // 1. Validar stock
    const stockValidation = await this.validateCartStock(cart);
    if (!stockValidation.valid) {
      return {
        success: false,
        error: 'Stock insuficiente',
        invalidItems: stockValidation.invalidItems,
      };
    }

    // 2. Calcular total
    const total = this.calculateCartTotal(cart);

    // 3. Crear orden
    const order = await this.createOrder({
      items: cart,
      customer: customerInfo,
      payment: paymentInfo,
      total,
    });

    return {
      success: true,
      order,
    };
  }
}

/**
 * Factory para crear instancia del facade
 */
export function createEcommerceFacade(dbClient) {
  return new EcommerceFacade(dbClient);
}

/**
 * Hook personalizado para usar el facade en React
 */
export function useEcommerce(dbClient) {
  return createEcommerceFacade(dbClient);
}
