// services/anunciosApi.js
class AnunciosApiService {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Método para manejar respuestas de la API
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }
    return response.json();
  }

  // Método para hacer peticiones con manejo de errores
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const config = {
      headers: this.defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error);
      throw error;
    }
  }

  // GET - Obtener todos los anuncios
  async getAnuncios(params = {}) {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        searchParams.append(key, params[key]);
      }
    });

    const endpoint = `/anuncios${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    return this.request(endpoint);
  }

  // GET - Obtener anuncio por ID
  async getAnuncioById(id) {
    return this.request(`/anuncios/${id}`);
  }

  // POST - Crear nuevo anuncio
  async createAnuncio(anuncioData) {
    return this.request("/anuncios", {
      method: "POST",
      body: JSON.stringify(anuncioData),
    });
  }

  // PUT - Actualizar anuncio existente
  async updateAnuncio(id, anuncioData) {
    return this.request(`/anuncios/${id}`, {
      method: "PUT",
      body: JSON.stringify(anuncioData),
    });
  }

  // DELETE - Eliminar anuncio
  async deleteAnuncio(id) {
    return this.request(`/anuncios/${id}`, {
      method: "DELETE",
    });
  }

  // POST - Registrar click en anuncio
  async registerClick(id) {
    return this.request(`/anuncios/${id}/click`, {
      method: "POST",
    });
  }

  // GET - Obtener estadísticas generales
  async getStats() {
    return this.request("/anuncios/stats");
  }

  // GET - Obtener categorías
  async getCategorias() {
    return this.request("/categorias");
  }

  // Métodos de utilidad para filtros comunes
  async getAnunciosActivos(params = {}) {
    return this.getAnuncios({ ...params, active: true });
  }

  async getAnunciosDestacados(params = {}) {
    return this.getAnuncios({ ...params, featured: true, active: true });
  }

  async getAnunciosByCategory(category, params = {}) {
    return this.getAnuncios({ ...params, category, active: true });
  }

  async searchAnuncios(searchTerm, params = {}) {
    return this.getAnuncios({ ...params, search: searchTerm, active: true });
  }
}

// Crear instancia singleton
const anunciosApi = new AnunciosApiService();
export default anunciosApi;
