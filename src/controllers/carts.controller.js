// Importa los servicios de carrito y productos desde el repositorio
import { cartService, productsService } from "../repository/index.js";

// Importa la clase CustomError para manejar errores personalizados
import CustomError from "../services/errors/CustomError.js";

// Importa el enumerado EErrors que define los tipos de errores
import EErrors from "../services/errors/enum.js";

// Importa las funciones para generar información de errores para el carrito y la autenticación
import {
  generateCartErrorInfo,
  generateAuthErrorInfo,
} from "../services/errors/info.js";

// Método asíncrono para obtener todos los carritos
async function getAll(req, res, next) {
  try {
    // Solicita todos los carritos al servicio de carritos
    const carts = await cartService.getAllCarts();

    // Si no hay carritos, registra un error y envía una respuesta con estado 500
    if (carts.length === 0) {
      req.logger.error(
        `Error de base de datos: Error al cargar los carritos. Aún no se han creado carritos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(carts, EErrors.DATABASE_ERROR),
        message: "Error al cargar los carritos. Aún no se han creado carritos.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({
        message: "Error al cargar los carritos. Aún no se han creado carritos.",
      });
    }

    // Si hay carritos, registra la información y envía una respuesta con los carritos
    req.logger.info(
      `Carritos cargados con éxito ${new Date().toLocaleString()}`
    );
    return res.json({ message: "Carritos cargados con éxito.", data: carts });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para obtener un carrito específico
async function getOne(req, res, next) {
  // Extrae el ID del carrito de los parámetros de la solicitud
  const { cid } = req.params;

  try {
    // Si no se proporciona un ID de carrito, registra un error y envía una respuesta con estado 500
    if (!cid) {
      req.logger.error(
        `Error de tipo de dato: Error al obtener el carrito. Faltan datos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato.",
        cause: generateCartErrorInfo(cid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al obtener el carrito. Faltan datos.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al obtener el carrito. Faltan datos." });
    }

    // Solicita el carrito al servicio de carritos
    const cart = await cartService.getOneCart(cid);

    // Si el carrito no existe, registra un error y envía una respuesta con estado 500
    if (cart.length === 0) {
      req.logger.error(
        `Error de base de datos: Error al obtener el carrito. El carrito no éxiste. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al obtener el carrito. El carrito no éxiste.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({
        message: "Error al obtener el carrito. El carrito no éxiste.",
      });
    }

    // Si el carrito existe, registra la información y envía una respuesta con el carrito
    req.logger.info(
      `Carrito obtenido con éxito ${new Date().toLocaleString()}`
    );
    return res.json({ message: "Carrito obtenido con éxito.", data: cart });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para popular un carrito específico
async function populatedCart(req, res, next) {
  // Extrae el ID del carrito de los parámetros de la solicitud
  const { cid } = req.params;

  try {
    // Si no se proporciona un ID de carrito, registra un error y envía una respuesta con estado 500
    if (!cid) {
      req.logger.error(
        `Error de tipo de dato: Error al popular el carrito. Faltan datos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato.",
        cause: generateCartErrorInfo(cid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al popular el carrito. Faltan datos.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al popular el carrito. Faltan datos." });
    }

    // Solicita el carrito al servicio de carritos y lo llena con los productos correspondientes
    const cart = await cartService.populatedOneCart(cid);

    // Si el carrito no existe, registra un error y envía una respuesta con estado 500
    if (!cart) {
      req.logger.error(
        `Error de base de datos: Error al popular el carrito. El carrito no existe. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al popular el carrito. El que carrito no existe.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({
        message: "Error al popular el carrito. El carrito no existe.",
      });
    }

    // Si el carrito existe, registra la información y envía una respuesta con el carrito lleno
    req.logger.info(
      `Carrito populado con éxito ${new Date().toLocaleString()}`
    );
    return res.json({ message: "Carrito populado con éxito.", data: cart });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para crear un carrito
async function createCart(req, res, next) {
  console.log("estoy");
  // Extrae el nuevo carrito del cuerpo de la solicitud
  const newCart = req.body;

  try {
    // Si no se proporciona un carrito, registra un error y envía una respuesta con estado 500
    if (!newCart) {
      req.logger.error(
        `Error de tipo de dato: Error al crear el carrito. Faltan datos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato.",
        cause: generateCartErrorInfo(newCart, EErrors.INVALID_TYPES_ERROR),
        message: "Error al crear el carrito. Faltan datos.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res.status(500).json({ message: "Error al crear el carrito" });
    }

    // Solicita al servicio de carritos que guarde el nuevo carrito
    const result = await cartService.saveOneCart(newCart);

    console.log(result);

    // Si el carrito no se guarda correctamente, registra un error y envía una respuesta con estado 500
    if (!result.products) {
      req.logger.error(
        `Error de base de datos: Error al crear el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(newCart, EErrors.DATABASE_ERROR),
        message: "Error al crear el carrito.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({ message: "Error al crear el carrito." });
    }

    // Si el carrito se guarda correctamente, registra la información y envía una respuesta con el carrito
    req.logger.info(`Carrito creado con éxito ${new Date().toLocaleString()}`);
    return res.json({ message: "Carrito creado con éxito", data: result });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para gestionar los productos de un carrito
async function manageCartProducts(req, res, next) {
  // Extrae el ID del carrito y del producto de los parámetros de la solicitud, y la operación del cuerpo de la solicitud
  const { cid, pid } = req.params;
  const { op } = req.body;

  try {
    // Si no se proporcionan los IDs o la operación, registra un error y envía una respuesta con estado 500
    if (!cid || !pid || !op) {
      req.logger.error(
        `Error de tipo de dato: Error al agregar productos al carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateCartErrorInfo(cid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al agregar productos al carrito",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al agregar productos al carrito" });
    }

    // Solicita el carrito al servicio de carritos
    const cart = await cartService.getOneCart(cid);

    // Si el carrito no existe, registra un error y envía una respuesta con estado 500
    if (!cart.products) {
      req.logger.error(
        `Error de base de datos: Error al obtener el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al obtener el carrito",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({ message: "Error al obtener el carrito" });
    }

    // Solicita el producto al servicio de productos
    const product = await productsService.getOneProduct(pid);

    // Si el propietario del producto es el usuario actual, registra un error y envía una respuesta con estado 500
    if (product.owner === req.user.user.username) {
      req.logger.error(
        `Error de autenticación: El propietario no puede agregar su producto al carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de autenticación",
        cause: generateAuthErrorInfo(cart, EErrors.AUTH_ERROR),
        message: "El propietario no puede agregar su producto al carrito",
        code: EErrors.AUTH_ERROR,
      });
      return res.status(500).json({
        status: "error",
        message: "El propietario no puede agregar su producto al carrito",
      });
    }

    // Busca el producto en el carrito
    const productExist = cart.products.findIndex(
      (product) => product.product == pid
    );

    // Si el producto no está en el carrito, lo añade; si está, incrementa o decrementa su cantidad según la operación
    if (productExist === -1) {
      cart.products.push({ product: pid, quantity: 1 });
    } else {
      if (op === "add") {
        cart.products[productExist].quantity += 1;
      } else if (op === "substract") {
        cart.products[productExist].quantity -= 1;
      }
    }

    // Solicita al servicio de carritos que actualice el carrito
    const result = await cartService.updateOneCart(cid, cart);

    // Si el carrito no se actualiza correctamente, registra un error y envía una respuesta con estado 500
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al actualizar el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al actualizar el carrito.",
        code: EErrors.DATABASE_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al actualizar el carrito." });
    }

    // Si el carrito se actualiza correctamente, registra la información y envía una respuesta con el carrito
    req.logger.info(
      `Carrito populado con éxito ${new Date().toLocaleString()}`
    );
    return res.json({ message: "Carrito actualizado con éxito.", data: cart });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para eliminar un producto de un carrito
async function deleteProduct(req, res, next) {
  // Extrae el ID del carrito y del producto de los parámetros de la solicitud
  const { cid, pid } = req.params;

  try {
    // Si no se proporcionan los IDs, registra un error y envía una respuesta con estado 500
    if (!cid || !pid) {
      req.logger.error(
        `Error de tipo de dato: Error al eliminar el producto. Faltan datos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato.",
        cause: generateCartErrorInfo(cid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al eliminar el producto. Faltan datos.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al eliminar el producto. Faltan datos." });
    }

    // Solicita el carrito al servicio de carritos
    const cart = await cartService.getOneCart(cid);

    // Si el carrito no existe, registra un error y envía una respuesta con estado 500
    if (!cart) {
      req.logger.error(
        `Error de base de datos: Error al eliminar el producto. No existe el carrito. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al eliminar el producto. No existe el carrito.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({
        message: "Error al eliminar el producto. No existe el carrito.",
      });
    }

    // Busca el producto en el carrito
    let productExistsInCart = cart.products.find(
      (dato) => dato.product === pid
    );

    // Si el producto está en el carrito, lo elimina
    if (productExistsInCart) {
      cart.products.splice(productExistsInCart, 1);
    }

    // Solicita al servicio de carritos que actualice el carrito
    const result = await cartService.updateOneCart(cid, cart);

    // Si el carrito no se actualiza correctamente, registra un error y envía una respuesta con estado 500
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al actualizar el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al actualizar el carrito.",
        code: EErrors.DATABASE_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al actualizar el carrito." });
    }

    // Si el carrito se actualiza correctamente, registra la información y envía una respuesta con el carrito
    req.logger.info(
      `Carrito actualizado con éxito ${new Date().toLocaleString()}`
    );
    return res.json({ message: "Producto eliminado con éxito", data: cart });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

// Método asíncrono para vaciar el carrito
async function emptyCart(req, res, next) {
  // Extrae el ID del carrito de los parámetros de la solicitud
  const { cid } = req.params;

  try {
    // Si no se proporciona el ID, registra un error y envía una respuesta con estado 500
    if (!cid) {
      req.logger.error(
        `Error de tipo de dato: Error al vaciar el carrito. Faltan datos. ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato.",
        cause: generateCartErrorInfo(cid, EErrors.INVALID_TYPES_ERROR),
        message: "Error al vaciar el carrito. Faltan datos.",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(500)
        .json({ message: "Error al vaciar el carrito. Faltan datos." });
    }

    // Solicita el carrito al servicio de carritos
    const cart = await cartService.getOneCart(cid);

    // Si el carrito no existe, registra un error y envía una respuesta con estado 500
    if (!cart) {
      req.logger.error(
        `Error de base de datos: Carrito no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Carrito no encontrado.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({ message: "Carrito no encontrado." });
    }

    // Vacía el carrito
    cart.products = [];

    // Solicita al servicio de carritos que actualice el carrito
    const result = await cartService.updateOneCart(cid, cart);

    // Si el carrito no se actualiza correctamente, registra un error y envía una respuesta con estado 500
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al vaciar el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos.",
        cause: generateCartErrorInfo(cart, EErrors.DATABASE_ERROR),
        message: "Error al vaciar el carrito.",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(500).json({ message: "Error al vaciar el carrito." });
    }

    // Si el carrito se actualiza correctamente, registra la información y envía una respuesta con el carrito
    req.logger.info(`Carrito vaciado con éxito ${new Date().toLocaleString()}`);
    return res.json({ message: "Carrito vaciado con éxito.", data: cart });
  } catch (err) {
    // Si hay un error, pasa el error al siguiente middleware
    next(err);
  }
}

export {
  getAll,
  getOne,
  createCart,
  manageCartProducts,
  deleteProduct,
  emptyCart,
  populatedCart,
};
