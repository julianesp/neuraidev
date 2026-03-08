/**
 * BlogRepository - Repository Pattern para Blog
 *
 * Abstrae todas las operaciones de base de datos para posts del blog
 */

import { RepositoryError } from '../errors/AppErrors';

export class BlogRepository {
  constructor(dbClient) {
    if (!dbClient) {
      throw new Error('BlogRepository requiere un cliente de base de datos');
    }
    this.db = dbClient;
  }

  /**
   * Obtiene todos los posts publicados
   */
  async getPublishedPosts(options = {}) {
    const { category = null, limit = null, offset = 0 } = options;

    try {
      let query = this.db
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (limit) {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new RepositoryError('Error al obtener posts publicados', error);
      }

      return data || [];
    } catch (error) {
      console.error('[BlogRepository.getPublishedPosts] Error:', error);
      throw new RepositoryError('Error al obtener posts publicados', error);
    }
  }

  /**
   * Obtiene un post por su slug
   */
  async getPostBySlug(slug) {
    try {
      const { data, error } = await this.db
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new RepositoryError('Error al obtener post', error);
      }

      return data;
    } catch (error) {
      console.error('[BlogRepository.getPostBySlug] Error:', error);
      throw new RepositoryError('Error al obtener post', error);
    }
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  async getCategories() {
    try {
      const { data, error } = await this.db
        .from('blog_posts')
        .select('category')
        .eq('published', true);

      if (error) {
        throw new RepositoryError('Error al obtener categorías', error);
      }

      // Extraer categorías únicas
      const categories = [...new Set(data.map((post) => post.category))];
      return ['Todos', ...categories];
    } catch (error) {
      console.error('[BlogRepository.getCategories] Error:', error);
      throw new RepositoryError('Error al obtener categorías', error);
    }
  }

  /**
   * Crea un nuevo post
   */
  async createPost(postData) {
    try {
      const { data, error } = await this.db
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();

      if (error) {
        throw new RepositoryError('Error al crear post', error);
      }

      return data;
    } catch (error) {
      console.error('[BlogRepository.createPost] Error:', error);
      throw new RepositoryError('Error al crear post', error);
    }
  }

  /**
   * Actualiza un post existente
   */
  async updatePost(postId, updates) {
    try {
      const { data, error } = await this.db
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        throw new RepositoryError('Error al actualizar post', error);
      }

      return data;
    } catch (error) {
      console.error('[BlogRepository.updatePost] Error:', error);
      throw new RepositoryError('Error al actualizar post', error);
    }
  }

  /**
   * Elimina un post
   */
  async deletePost(postId) {
    try {
      const { error } = await this.db
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw new RepositoryError('Error al eliminar post', error);
      }

      return { success: true, postId };
    } catch (error) {
      console.error('[BlogRepository.deletePost] Error:', error);
      throw new RepositoryError('Error al eliminar post', error);
    }
  }

  /**
   * Incrementa el contador de vistas de un post
   */
  async incrementViews(postId) {
    try {
      const { error } = await this.db.rpc('increment_blog_post_views', {
        post_id: postId,
      });

      if (error) {
        throw new RepositoryError('Error al incrementar vistas', error);
      }

      return { success: true };
    } catch (error) {
      console.error('[BlogRepository.incrementViews] Error:', error);
      // No lanzar error, solo registrar
      console.warn('No se pudo incrementar el contador de vistas');
      return { success: false };
    }
  }

  /**
   * Obtiene posts relacionados (misma categoría)
   */
  async getRelatedPosts(postId, category, limit = 3) {
    try {
      const { data, error } = await this.db
        .from('blog_posts')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .neq('id', postId)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new RepositoryError('Error al obtener posts relacionados', error);
      }

      return data || [];
    } catch (error) {
      console.error('[BlogRepository.getRelatedPosts] Error:', error);
      throw new RepositoryError('Error al obtener posts relacionados', error);
    }
  }
}

/**
 * Factory para crear instancia del repository
 */
export function createBlogRepository(dbClient) {
  return new BlogRepository(dbClient);
}
