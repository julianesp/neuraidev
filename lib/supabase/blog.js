/**
 * Servicio de blog con Cloudflare D1
 */

import { d1Select, d1Execute, d1SelectOne } from '../db-d1';

export async function getPublishedPosts(category = null) {
  try {
    if (category && category !== 'Todos') {
      return await d1Select(
        'SELECT * FROM blog_posts WHERE published = 1 AND category = ? ORDER BY published_at DESC',
        [category]
      );
    }
    return await d1Select(
      'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    return await d1SelectOne(
      'SELECT * FROM blog_posts WHERE slug = ? AND published = 1 LIMIT 1',
      [slug]
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function incrementPostViews(slug) {
  try {
    await d1Execute(
      'UPDATE blog_posts SET views = COALESCE(views, 0) + 1 WHERE slug = ?',
      [slug]
    );
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

export async function getFeaturedPosts(limit = 3) {
  try {
    return await d1Select(
      'SELECT * FROM blog_posts WHERE published = 1 AND featured = 1 ORDER BY published_at DESC LIMIT ?',
      [limit]
    );
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

export async function getMostViewedPosts(limit = 5) {
  try {
    return await d1Select(
      'SELECT * FROM blog_posts WHERE published = 1 ORDER BY views DESC LIMIT ?',
      [limit]
    );
  } catch (error) {
    console.error('Error fetching most viewed posts:', error);
    return [];
  }
}

export async function searchPosts(searchTerm) {
  try {
    const term = `%${searchTerm}%`;
    return await d1Select(
      'SELECT * FROM blog_posts WHERE published = 1 AND (LOWER(title) LIKE LOWER(?) OR LOWER(excerpt) LIKE LOWER(?) OR LOWER(content) LIKE LOWER(?)) ORDER BY published_at DESC',
      [term, term, term]
    );
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const rows = await d1Select('SELECT DISTINCT category FROM blog_posts WHERE published = 1');
    const categories = rows.map(r => r.category).filter(Boolean);
    return ['Todos', ...categories];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['Todos'];
  }
}
