import { productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";

// Función para obtener todos los productos
async function getAll(req, res, next) {
  const { page, sort, category } = req.query;

  try {
    let products;
    let message;

    // Si se proporciona una categoría, obtener productos filtrados por categoría
    if (category) {
      products = await productsService.filteredAllProducts(category);
      message = "Productos filtrados con éxito";
    }
    // Si se proporciona un valor de ordenación, obtener productos ordenados
    else if (sort) {
      products = await productsService.orderedAllProducts(sort);
      message = "Productos ordenados con éxito";
    }
    // Si se proporciona una página, obtener productos paginados
    else if (page) {
      products = await productsService.paginatedAllProducts(page);
      message = "Productos paginados con éxito";
      products = products.docs; // En caso de paginación, los productos están en la propiedad 'docs'
    }
    // Si no se proporciona ninguna de las anteriores, obtener todos los productos
    else {
      products = await productsService.getAllProducts();
      message = "Productos obtenidos con éxito";
    }

    // Si no se encuentran productos, lanzar un error
    if (products.length === 0) {
      req.logger.error(
        `Error de base de datos: Error al obtener los productos ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(products, EErrors.DATABASE_ERROR),
        message,
        code: EErrors.DATABASE_ERROR,
      });
    }

    // Si se encuentran productos, registrar el éxito y enviar la respuesta
    req.logger.info({ message: `${message} ${new Date().toLocaleString()}` });
    res.json({ message, products });
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

// Función para obtener un producto por id
async function getOne(req, res, next) {
  // Extraer el id del producto de los parámetros de la ruta
  const { pid } = req.params;

  try {
    // Intentar obtener el producto de la base de datos
    const product = await productsService.getOneProduct(pid);

    // Si el producto no se encuentra, lanzar un error
    if (product.length === 0) {
      req.logger.error(
        `Error de base de datos: Error al obtener el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(product, EErrors.DATABASE_ERROR),
        message: "Error al obtener el producto",
        code: EErrors.DATABASE_ERROR,
      });
    }
    // Si el producto se encuentra, enviarlo en la respuesta
    else {
      req.logger.info({
        message: `Producto obtenido con éxito ${new Date().toLocaleString()}`,
      });
      res.json({ message: "Producto obtenido con éxito", product });
    }
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

export { getAll, getOne };
