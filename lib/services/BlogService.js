/**
 * BlogService - Service Layer para lógica de negocio del blog
 *
 * Separa la lógica de negocio del acceso a datos
 */

import { ValidationError } from '../errors/AppErrors';

export class BlogService {
  constructor(blogRepository) {
    this.blogRepo = blogRepository;
  }

  /**
   * Obtiene posts publicados con filtros
   */
  async getPublishedPosts(filters = {}) {
    try {
      const posts = await this.blogRepo.getPublishedPosts(filters);

      // Calcular tiempo de lectura si no existe
      return posts.map((post) => ({
        ...post,
        read_time: post.read_time || this._calculateReadTime(post.content),
      }));
    } catch (error) {
      console.error('[BlogService.getPublishedPosts] Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene un post por slug e incrementa vistas
   */
  async getPostBySlug(slug, incrementViews = true) {
    try {
      const post = await this.blogRepo.getPostBySlug(slug);

      if (!post) {
        return null;
      }

      // Incrementar vistas de forma asíncrona (no bloquear)
      if (incrementViews) {
        this.blogRepo.incrementViews(post.id).catch((error) => {
          console.warn('[BlogService] Error al incrementar vistas:', error);
        });
      }

      // Calcular tiempo de lectura si no existe
      return {
        ...post,
        read_time: post.read_time || this._calculateReadTime(post.content),
      };
    } catch (error) {
      console.error('[BlogService.getPostBySlug] Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene posts relacionados
   */
  async getRelatedPosts(postId, category, limit = 3) {
    try {
      const posts = await this.blogRepo.getRelatedPosts(postId, category, limit);

      return posts.map((post) => ({
        ...post,
        read_time: post.read_time || this._calculateReadTime(post.content),
      }));
    } catch (error) {
      console.error('[BlogService.getRelatedPosts] Error:', error);
      throw error;
    }
  }

  /**
   * Obtiene categorías con conteo de posts
   */
  async getCategoriesWithCount() {
    try {
      const allPosts = await this.blogRepo.getPublishedPosts();
      const categories = {};

      allPosts.forEach((post) => {
        const category = post.category || 'Sin categoría';
        categories[category] = (categories[category] || 0) + 1;
      });

      return Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('[BlogService.getCategoriesWithCount] Error:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo post con validación
   */
  async createPost(postData) {
    try {
      // Validar datos requeridos
      this._validatePostData(postData);

      // Generar slug si no existe
      if (!postData.slug) {
        postData.slug = this._generateSlug(postData.title);
      }

      // Calcular tiempo de lectura
      if (!postData.read_time && postData.content) {
        postData.read_time = this._calculateReadTime(postData.content);
      }

      return await this.blogRepo.createPost(postData);
    } catch (error) {
      console.error('[BlogService.createPost] Error:', error);
      throw error;
    }
  }

  /**
   * Actualiza un post con validación
   */
  async updatePost(postId, updates) {
    try {
      // Validar que existan datos para actualizar
      if (!updates || Object.keys(updates).length === 0) {
        throw new ValidationError('No hay datos para actualizar');
      }

      // Regenerar slug si cambió el título
      if (updates.title && !updates.slug) {
        updates.slug = this._generateSlug(updates.title);
      }

      // Recalcular tiempo de lectura si cambió el contenido
      if (updates.content && !updates.read_time) {
        updates.read_time = this._calculateReadTime(updates.content);
      }

      return await this.blogRepo.updatePost(postId, updates);
    } catch (error) {
      console.error('[BlogService.updatePost] Error:', error);
      throw error;
    }
  }

  /**
   * Elimina un post
   */
  async deletePost(postId) {
    try {
      return await this.blogRepo.deletePost(postId);
    } catch (error) {
      console.error('[BlogService.deletePost] Error:', error);
      throw error;
    }
  }

  /**
   * Busca posts por término
   */
  async searchPosts(searchTerm, options = {}) {
    try {
      const allPosts = await this.blogRepo.getPublishedPosts(options);

      // Buscar en título, excerpt y contenido
      const results = allPosts.filter((post) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          post.title?.toLowerCase().includes(searchLower) ||
          post.excerpt?.toLowerCase().includes(searchLower) ||
          post.content?.toLowerCase().includes(searchLower)
        );
      });

      return results;
    } catch (error) {
      console.error('[BlogService.searchPosts] Error:', error);
      throw error;
    }
  }

  /**
   * MÉTODOS PRIVADOS (Algoritmos)
   */

  /**
   * Calcula el tiempo estimado de lectura
   * Algoritmo: ~200 palabras por minuto (promedio de lectura en español)
   */
  _calculateReadTime(content) {
    if (!content) return 1;

    // Contar palabras
    const words = content.trim().split(/\s+/).length;

    // Calcular minutos (200 palabras por minuto)
    const minutes = Math.ceil(words / 200);

    return Math.max(1, minutes); // Mínimo 1 minuto
  }

  /**
   * Genera un slug a partir de un título
   * Algoritmo: normalización y limpieza de texto
   */
  _generateSlug(title) {
    if (!title) return '';

    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno
      .substring(0, 100); // Máximo 100 caracteres
  }

  /**
   * Valida los datos de un post
   */
  _validatePostData(postData) {
    const errors = [];

    if (!postData.title || postData.title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    if (!postData.content || postData.content.trim().length < 50) {
      errors.push('El contenido debe tener al menos 50 caracteres');
    }

    if (!postData.category) {
      errors.push('La categoría es requerida');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }
  }

  /**
   * Extrae el primer párrafo como excerpt (si no existe)
   */
  _generateExcerpt(content, maxLength = 200) {
    if (!content) return '';

    // Eliminar HTML tags
    const text = content.replace(/<[^>]*>/g, '');

    // Tomar primeros caracteres
    return text.length > maxLength
      ? text.substring(0, maxLength).trim() + '...'
      : text;
  }
}

/**
 * Factory para crear instancia del servicio
 */
export function createBlogService(blogRepository) {
  return new BlogService(blogRepository);
}
