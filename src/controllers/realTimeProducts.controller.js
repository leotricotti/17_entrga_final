import { productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import {
  generateProductErrorInfo,
  generateAuthErrorInfo,
} from "../services/errors/info.js";

// Método asíncrono para guardar un producto
async function saveProduct(req, res, next) {
  // Parsear el producto del cuerpo de la solicitud
  const productData = JSON.parse(req.body.newProduct);
  const file = req.files;
  const { title, description, code, price, stock, category, owner } =
    productData;
  const thumbnail = file.userProductImage[0].path;

  try {
    // Verificar que todos los campos requeridos estén presentes
    if (!title || !description || !price || !code || !stock || !category) {
      const data = { title, description, code, price, stock, category };
      req.logger.error(
        `Error de tipo de dato: Error al crear el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de tipo de datos",
        cause: generateProductErrorInfo(data, EErrors.INVALID_TYPES_ERROR),
        message: "Error al crear el producto",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    // Crear el objeto del producto
    const product = {
      title,
      description,
      code,
      price,
      stock,
      owner,
      category,
      thumbnail: [{ img1: thumbnail }],
    };

    // Intentar guardar el producto en la base de datos
    const result = await productsService.saveOneProduct(product);

    // Si el producto no se guarda correctamente, lanzar un error
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al crear el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Error al crear el producto",
        code: EErrors.DATABASE_ERROR,
      });
    }

    // Si el producto se guarda correctamente, enviar una respuesta exitosa
    req.logger.info(`Producto creado con éxito ${new Date().toLocaleString()}`);
    res.json({ message: "Producto creado con éxito", data: result });
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

// Método asíncrono para eliminar un producto
async function deleteProduct(req, res, next) {
  // Extraer el id del producto y el rol del usuario de la solicitud
  const { pid } = req.params;
  const userRole = req.user.role;

  try {
    // Si no se proporciona un id de producto, lanzar un error
    if (!pid) {
      req.logger.error(
        `Error de tipo de dato: Error al eliminar el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de tipo de dato",
        cause: generateProductErrorInfo(pid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al eliminar el producto",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    // Obtener el producto de la base de datos
    const product = await productsService.getOneProduct(pid);

    // Si el usuario es premium y no es el propietario del producto, lanzar un error
    if (userRole === "premium" && product.owner !== req.user.user.username) {
      req.logger.error(
        `Error de permisos: Error al eliminar el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de permisos",
        cause: generateAuthErrorInfo(userRole, EErrors.AUTH_ERROR),
        message: "Error al eliminar el producto",
        code: EErrors.AUTH_ERROR,
      });
    }
    // Si el usuario es el propietario del producto o no es premium, intentar eliminar el producto
    else {
      const result = await productsService.deleteOneProduct(pid);

      // Si el producto no se elimina correctamente, lanzar un error
      if (!result) {
        req.logger.error(
          `Error de base de datos: Error al eliminar el producto ${new Date().toLocaleString()}`
        );
        throw new CustomError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(result, EErrors.DATABASE_ERROR),
          message: "Error al eliminar el producto",
          code: EErrors.DATABASE_ERROR,
        });
      }

      // Si el producto se elimina correctamente, enviar una respuesta exitosa
      req.logger.info(
        `Producto eliminado con éxito ${new Date().toLocaleString()}`
      );
      res.json({ message: "Producto eliminado con éxito", data: result });
    }
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

// Método asíncrono para actualizar un producto
async function updateProduct(req, res, next) {
  console.log("Llego aqui");
  // Extraer el id del producto y los datos del producto de la solicitud
  const { pid } = req.params;
  const { title, description, code, price, stock, category, thumbnail } =
    req.files;

  console.log(req.files);

  try {
    // Si no se proporcionan todos los campos requeridos, lanzar un error
    if (!title || !description || !price || !code || !stock) {
      const data = { title, description, code, price, stock, category };
      req.logger.error(
        `Error de tipo de dato: Error al actualizar el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de tipo de datos",
        cause: generateProductErrorInfo(data, EErrors.INVALID_TYPES_ERROR),
        message: "Error al actualizar el producto",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    // Crear el objeto del producto
    const product = {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnail
        ? thumbnail.map((file) => file.filename)
        : undefined,
    };

    // Intentar actualizar el producto en la base de datos
    const result = await productsService.updateOneProduct(pid, product);

    // Si el producto no se actualiza correctamente, lanzar un error
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al actualizar el producto ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Error al actualizar el producto",
        code: EErrors.DATABASE_ERROR,
      });
    }

    // Si el producto se actualiza correctamente, enviar una respuesta exitosa
    req.logger.info(
      `Producto actualizado con éxito ${new Date().toLocaleString()}`
    );
    const productUpdated = await productsService.getOneProduct(pid);
    res.json({
      message: "Producto actualizado con éxito",
      data: productUpdated,
    });
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

export { saveProduct, deleteProduct, updateProduct };
