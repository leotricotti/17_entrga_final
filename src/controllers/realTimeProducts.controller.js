import { productsService } from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import {
  generateProductErrorInfo,
  generateAuthErrorInfo,
} from "../services/errors/info.js";
import MailingService from "../services/mailing.js";

// Método asíncrono para guardar un producto
async function saveProduct(req, res, next) {
  // Parsear el producto del cuerpo de la solicitud
  const { title, description, code, price, stock, category, owner } = req.body;

  try {
    // Verificar que todos los campos requeridos estén presentes
    if (!title || !description || !price || !code || !stock || !category) {
      const data = { title, description, code, price, stock, category };
      req.logger.error(
        `Error de tipo de dato: Error al crear el producto ${new Date().toLocaleString()}`
      );
      CustomError.createError({
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
      thumbnail: [
        {
          img1: "https://www.hapuricellisa.com.ar/plugins/productos/producto-sin-imagen.png",
        },
      ],
    };

    // Intentar guardar el producto en la base de datos
    const result = await productsService.saveOneProduct(product);

    console.log(result);

    // Si el producto no se guarda correctamente, lanzar un error
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al crear el producto ${new Date().toLocaleString()}`
      );
      CustomError.createError({
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
  console.log("Deleted");
  // Extraer el id del producto y el rol del usuario de la solicitud
  const { pid } = req.params;
  const userRole = req.user.role;

  try {
    // Si no se proporciona un id de producto, lanzar un error
    if (!pid) {
      req.logger.error(
        `Error de tipo de dato: Error al eliminar el producto ${new Date().toLocaleString()}`
      );
      CustomError({
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
      CustomError.createError({
        name: "Error de permisos",
        cause: generateAuthErrorInfo(userRole, EErrors.AUTH_ERROR),
        message: "Error al eliminar el producto",
        code: EErrors.AUTH_ERROR,
      });
    } else {
      const result = await productsService.deleteOneProduct(pid);

      // Si el producto no se elimina correctamente, lanzar un error
      if (result.length === 0 || !result) {
        req.logger.error(
          `Error de base de datos: Error al eliminar el producto ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateProductErrorInfo(result, EErrors.DATABASE_ERROR),
          message: "Error al eliminar el producto",
          code: EErrors.DATABASE_ERROR,
        });
      } else {
        if (
          userRole === "premium" &&
          product.owner === req.user.user.username
        ) {
          // Crea una nueva instancia del servicio de correo
          const mailer = new MailingService();
          // Envía un correo electrónico al propietario del producto eliminado
          const sendEmail = await mailer.sendSimpleMail({
            from: "E-Store",
            to: product.owner,
            subject: "Eliminación de Producto",
            html: `
          <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
              <h2 style="text-align: center; color: #333;">Eliminación de Producto</h2>
              <p>Estimado/a ${req.user.user.first_name},</p>
              <p>Esperamos que este mensaje te encuentre bien. Nos dirigimos a ti para informarte que el producto que creaste en nuestro E-commerce ha sido eliminado de acuerdo con nuestras políticas internas.</p>
              <p>En caso de que esto haya sido un error o si deseas obtener más detalles sobre la eliminación de tu producto, por favor ponte en contacto con nuestro equipo de soporte a través de <a href="#" style="color: #4caf50; text-decoration: none;">Ayuda en línea</a> o llamando al <strong>+54 11 4567-8890</strong> lo antes posible. Estaremos encantados de asistirte en cualquier consulta que puedas tener.</p>
              <p>Agradecemos tu comprensión y lamentamos cualquier inconveniente que esta situación pueda haber causado. Valoramos tu participación en nuestra plataforma y esperamos seguir colaborando contigo en el futuro.</p>
              <p><strong>E-Store</strong><br>
          </div>
          `,
          });
          // Si el producto se elimina correctamente, enviar una respuesta exitosa
          req.logger.info(
            `Producto eliminado con éxito ${new Date().toLocaleString()}`
          );
          res.json({ message: "Producto eliminado con éxito", data: result });
        } else {
          // Si el producto se elimina correctamente, enviar una respuesta exitosa
          req.logger.info(
            `Producto eliminado con éxito ${new Date().toLocaleString()}`
          );
          res.json({ message: "Producto eliminado con éxito", data: result });
        }
      }
    }
  } catch (err) {
    // Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

// Método asíncrono para actualizar un producto
async function updateProduct(req, res, next) {
  // Extraer el id del producto y los datos del producto de la solicitud
  const { pid } = req.params;
  const { title, description, code, price, stock, category } = req.body;

  try {
    //Si no se proporcionan todos los campos requeridos, lanzar un error
    if (!title || !description || !price || !code || !stock) {
      const data = { title, description, code, price, stock, category };
      req.logger.error(
        `Error de tipo de dato: Error al actualizar el producto ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de datos",
        cause: generateProductErrorInfo(data, EErrors.INVALID_TYPES_ERROR),
        message: "Error al actualizar el producto",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }

    //Crear el objeto del producto
    const product = {
      title,
      description,
      code,
      price,
      stock,
      category,
    };

    //Intentar actualizar el producto en la base de datos
    const result = await productsService.updateOneProduct(pid, product);

    //   Si el producto no se actualiza correctamente, lanzar un error
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al actualizar el producto ${new Date().toLocaleString()}`
      );
      CustomError({
        name: "Error de base de datos",
        cause: generateProductErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Error al actualizar el producto",
        code: EErrors.DATABASE_ERROR,
      });
    }

    //Si el producto se actualiza correctamente, enviar una respuesta exitosa
    req.logger.info(
      `Producto actualizado con éxito ${new Date().toLocaleString()}`
    );
    const productUpdated = await productsService.getOneProduct(pid);
    res.json({
      message: "Producto actualizado con éxito",
      data: productUpdated,
    });
  } catch (err) {
    //Si ocurre un error, pasar al siguiente middleware
    next(err);
  }
}

export { saveProduct, deleteProduct, updateProduct };
