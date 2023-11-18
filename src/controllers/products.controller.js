import { productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateProductErrorInfo } from "../services/errors/info.js";

async function getAll(req, res, next) {
  const { page, sort, category } = req.query;
  try {
    let products;
    if (category) {
      products = await productsService.filteredAllProducts(category);
      if (products.length === 0) {
        req.logger.error(
          `Error de base de datos: Error al obtener los productos filtrados ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(products, EErrors.DATABASE_ERROR),
          message,
          code: EErrors.DATABASE_ERROR,
        });
        res.status(500).json({ message: "Error al obtener los productso" });
      } else {
        req.logger.info({
          message: `Productos filtrados con éxito ${new Date().toLocaleString()}`,
        });
        res.json({
          message: "Productos filtrados con éxito",
          products: products,
        });
      }
    } else if (sort) {
      products = await productsService.orderedAllProducts(sort);
      if (products.length === 0) {
        req.logger.error(
          `Error de base de datos: Error al obtener los productos ordenados ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(products, EErrors.DATABASE_ERROR),
          message,
          code: EErrors.DATABASE_ERROR,
        });
        res
          .status(500)
          .json({ message: "Error al obtener los productos ordenados" });
      } else {
        req.logger.info({
          message: `Productos ordenados con éxito ${new Date().toLocaleString()}`,
        });
        res.json({
          message: "Productos ordenados con éxito",
          products: products,
        });
      }
    } else if (page) {
      products = await productsService.paginatedAllProducts(page);
      if (products.length === 0) {
        req.logger.error(
          `Error de base de datos: Error al obtener los productos paginados ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(products, EErrors.DATABASE_ERROR),
          message,
          code: EErrors.DATABASE_ERROR,
        });
        res
          .status(500)
          .json({ message: "Error al obtener los productos paginados" });
      } else {
        req.logger.info({
          message: `Productos paginados con éxito ${new Date().toLocaleString()}`,
        });
        res.json({
          message: "Productos paginados con éxito",
          products: products.docs,
        });
      }
    } else {
      products = await productsService.getAllProducts();
      if (products.length === 0) {
        req.logger.error(
          `Error de base de datos: Error al obtener los productos ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(products, EErrors.DATABASE_ERROR),
          message,
          code: EErrors.DATABASE_ERROR,
        });
        res.status(500).json({ message: "Error al obtener los productos" });
      } else {
        req.logger.info({
          message: `Productos obtenidos con éxito ${new Date().toLocaleString()}`,
        });
        res.json({
          message: "Productos obtenidos con éxito",
          products: products,
        });
      }
    }
  } catch (err) {
    next(err);
  }
}

// Funcion para obtener un producto por id
async function getOne(req, res, next) {
  const { pid } = req.params;
  try {
    const product = await productsService.getOneProduct(pid);
    if (product.length === 0) {
      req.logger.error(
        `Error de base de datos: Error al obtener el producto ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(product, EErrors.DATABASE_ERROR),
        message,
        code: EErrors.DATABASE_ERROR,
      });
      res.status(500).json({ message: "Error al obtener el producto" });
    } else {
      req.logger.info({
        message: `Producto obtenido con éxito ${new Date().toLocaleString()}`,
      });
      res.json({ message: "Producto obtenido con éxito", product });
    }
  } catch (err) {
    next(err);
  }
}

export { getAll, getOne };
