const Producto = require('../models/Producto');
const client = require('../config/redis');

class ProductService {
  async getAllProducts({ nameFilter, page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;
    
    // Construir query
    const query = {};
    if (nameFilter) {
      query.nombre = { $regex: nameFilter, $options: 'i' };
    }

    // Obtener total y productos paginados
    const [products, total] = await Promise.all([
      Producto.find(query).skip(skip).limit(limit),
      Producto.countDocuments(query)
    ]);

    // Obtener categorías únicas para el filtro
    const categorias = await Producto.distinct('categoria');

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categorias
    };
  }

  async createProduct(data) {
    const producto = new Producto(data);
    await producto.save();
    await client.del('lista_productos');
    return producto;
  }

  async updateProduct(id, data) {
    const producto = await Producto.findByIdAndUpdate(id, data, { new: true });
    await client.del('lista_productos');
    return producto;
  }

  async deleteProduct(id) {
    await Producto.findByIdAndDelete(id);
    await client.del('lista_productos');
  }
}

module.exports = new ProductService();
