// Importaciones de servicios
import MailingService from "../services/mailing.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import {
  generateSessionErrorInfo,
  generateUserCartErrorInfo,
} from "../services/errors/info.js";

// Importaciones de repositorio
import { usersService } from "../repository/index.js";

// Importaciones de DTOs
import allUsersDto from "../dao/DTOs/allUsers.dto.js";
import UsersDto from "../dao/DTOs/users.dto.js";

// Importaciones de utilidades
import { generateToken, createHash, isValidPassword } from "../utils/index.js";

// Ruta que obtiene todos los usuarios
async function getAllUsers(req, res, next) {
  try {
    // Obtener todos los usuarios
    const users = await usersService.getAllUsers();

    // Si no hay usuarios, registrar un error y devolver un mensaje
    if (users.length === 0) {
      req.logger.error(
        `Error de base de datos: No hay usuarios registrados ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(users, EErrors.DATABASE_ERROR),
        message: "No hay usuarios registrados",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(404).json({ message: "No hay usuarios registrados" });
    }

    // Convertir los usuarios a DTOs
    const usersDto = users.map((user) => new allUsersDto(user));

    // Registrar el éxito y devolver los usuarios
    req.logger.info(
      `Usuarios enviados al cliente con éxito ${new Date().toLocaleString()}`
    );
    return res.json({
      message: "Usuarios enviados al cliente con éxito",
      data: usersDto,
    });
  } catch (error) {
    // Pasar el error al manejador de errores
    next(error);
  }
}

// Ruta que realiza el envío de correo de recuperación de contraseña
async function forgotPassword(req, res, next) {
  const { username } = req.body;

  try {
    // Si no se proporciona un nombre de usuario, registra un error y devuelve un mensaje
    if (!username) {
      req.logger.error(
        `Error de tipo de dato: Error al actualizar la contraseña ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(
          [username],
          EErrors.INVALID_TYPES_ERROR
        ),
        message: "Error al actualizar la contraseña",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res
        .status(400)
        .json({ message: "Error al actualizar la contraseña" });
    }

    // Busca al usuario en la base de datos
    const user = await usersService.getOneUser(username);

    // Si el usuario no existe, registra un error y devuelve un mensaje
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Genera un token para la recuperación de la contraseña
    const passwordToken = generateToken({ username });

    // Crea una nueva instancia del servicio de correo
    const mailer = new MailingService();

    // Envía el correo de recuperación de contraseña
    await mailer.sendSimpleMail({
      from: "E-Store",
      to: username,
      subject: "Recuperación de contraseña",
      html: `...`, // Aquí va el contenido del correo
    });

    // Registra el éxito del envío del correo y devuelve una respuesta
    req.logger.info(
      `Correo de recuperación enviado al usuario ${new Date().toLocaleString()}`
    );
    return res.status(200).json({
      response: "Correo de recuperación enviado al usuario",
      data: passwordToken,
    });
  } catch (error) {
    // Si ocurre un error, pasa el error al manejador de errores
    next(error);
  }
}
// Función que actualiza el perfil del usuario
async function updateUser(req, res, next) {
  const { data, uid } = req.body;

  try {
    // Si no se proporcionan uid o data, registra un error y devuelve un mensaje
    if (!uid || !data) {
      req.logger.error(
        `Error de tipo de dato: Error al actualizar el perfil ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(
          [uid, data],
          EErrors.INVALID_TYPES_ERROR
        ),
        message: "Error al actualizar el perfil",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      return res.status(400).json({ message: "Error al actualizar el perfil" });
    }

    // Busca al usuario en la base de datos
    const user = await usersService.getOneUser(uid);

    // Si el usuario no existe, registra un error y devuelve un mensaje
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Actualiza el usuario en la base de datos
    const id = user[0]._id;
    const result = await usersService.updateOneUser(id, data);

    // Si la actualización falla, registra un error y devuelve un mensaje
    if (!result) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Obtiene el usuario actualizado y lo convierte a DTO
    const updatedUser = await usersService.getOneUser(id);
    const userDto = new UsersDto(updatedUser);

    // Registra el éxito de la actualización y devuelve una respuesta
    req.logger.info(
      `Perfil actualizado con éxito ${new Date().toLocaleString()}`
    );
    return res.status(200).json({
      message: "Perfil actualizado con éxito",
      data: userDto,
    });
  } catch (error) {
    // Si ocurre un error, pasa el error al manejador de errores
    next(error);
  }
}

// Ruta que actualiza el carrito del usuario
async function userCart(req, res, next) {
  const { cartId, email } = req.body;
  try {
    if (!cartId || !email) {
      req.logger.error(
        `Error de tipo de dato: Error al crear el carrito ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(cartId, EErrors.INVALID_TYPES_ERROR),
        message: "Error al crear el carrito",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error al crear el carrito" });
    }
    const user = await usersService.getOneUser(email);
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateUserCartErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Error al cargar el carrito",
        code: EErrors.DATABASE_ERROR,
      });
      res.status(404).json({ message: "Usuario no encontrado" });
    }
    const userId = user[0]._id;
    const cartExist = user[0].carts.find((cart) => cart == cartId);
    if (!cartExist) {
      const response = await usersService.updateUserCart(userId, cartId);
      if (!response) {
        req.logger.error(
          `Error de base de datos: Error al actualizar el carrito ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateUserCartErrorInfo(user, EErrors.DATABASE_ERROR),
          message: "Error al actualizar el carrito",
          code: EErrors.DATABASE_ERROR,
        });
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } else {
      req.logger.info(
        `Carrito actualizado con éxito ${new Date().toLocaleString()}`
      );
      res.json({
        message: "Carrito actualizado con éxito",
      });
    }
  } catch (err) {
    next(err);
  }
}

// Ruta que actualiza la contraseña del usuario
async function updatePassword(req, res, next) {
  const { newPasswordData } = req.body;
  const password = newPasswordData;
  const username = req.user.user.username;
  try {
    if (!password || !username) {
      const result = [password, username];
      req.logger.error(
        `Error de tipo de dato: Error al actualizar la contraseña ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error al actualizar la contraseña",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error al actualizar la contraseña" });
    }
    const user = await usersService.getOneUser(username);
    const passwordExist = isValidPassword(user[0].password, password);
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      res.status(404).json({ message: "Usuario no encontrado" });
    } else if (passwordExist) {
      req.logger.error(
        `Error de base de autenticación: La contraseña no puede ser igual a la anterior ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de autenticación",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "La contraseña no puede ser igual a la anterior",
        code: EErrors.DATABASE_ERROR,
      });
      res
        .status(400)
        .json({ messsage: "La contraseña no puede ser igual a la anterior" });
    } else {
      const uid = user[0]._id;
      const newPassword = createHash(password);
      const result = await usersService.updateUserPassword(uid, newPassword);
      req.logger.info(
        `Contraseña actualizada con éxito ${new Date().toLocaleString()}`
      );
      res.status(200).json({
        message: "Contraseña actualizada con éxito",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
}

// Ruta que actualiza el rol de usuario
async function updateUserRole(req, res, next) {
  const { role } = req.body;
  const { id } = req.params;
  const username = id;
  try {
    if (!role || !username) {
      const result = [role, username];
      req.logger.error(
        `Error de tipo de dato: Error al actualizar el rol ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error al actualizar el rol",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error al actualizar el rol" });
    }
    const user = await usersService.getOneUser(username);
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      const uid = user[0]._id;
      const result = await usersService.updateUserRole(uid, role);
      const updatedUser = await usersService.getOneUser(username);
      const userDto = new UsersDto(updatedUser[0]);
      req.logger.info(
        `Rol actualizado con éxito ${new Date().toLocaleString()}`
      );
      res.status(200).json({
        message: "Rol actualizado con éxito",
        data: userDto,
      });
    }
  } catch (error) {
    next(error);
  }
}

// Ruta que devuelve el usuario actual
async function currentUser(req, res) {
  const getUser = await usersService.getOneUser(req.user.user.username);
  const user = new UsersDto(getUser[0]);
  res.json({
    message: "Usuario enviado al cliente con éxito",
    data: user,
  });
}

// Ruta que agrega un documento al usuario
async function addDocumentsToUser(req, res, next) {
  const files = req.files;
  const { uid } = req.params;
  try {
    if (!uid) {
      const result = [uid];
      req.logger.error(
        `Error de tipo de dato: Error al agregar un documento ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error al agregar un documento",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error al agregar un documento" });
    }
    const user = await usersService.getOneUser(uid);
    if (user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
      res.status(404).json({ message: "Usuario no encontrado" });
    } else {
      const id = user[0]._id;
      let result;
      if (files.userProfileImage) {
        result = await usersService.updateOneProfileImage(
          id,
          files.userProfileImage[0]
        );
      } else {
        result = await usersService.addUserDocuments(id, files);
      }
      if (result.length === 0 || !result) {
        req.logger.error(
          `Error de base de datos: Error al agregar el documento. ${new Date().toLocaleString()}`
        );
        CustomError.createError({
          name: "Error de base de datos",
          cause: generateSessionErrorInfo(result, EErrors.DATABASE_ERROR),
          message: "Error al agregar el documento",
          code: EErrors.DATABASE_ERROR,
        });
        res.status(404).json({ message: "Error al agregar el documento" });
      } else {
        const updatedUser = await usersService.getOneUser(uid);
        const userDto = new UsersDto(updatedUser[0]);
        req.logger.info(
          `Documento agregado con éxito ${new Date().toLocaleString()}`
        );
        res.json({
          message: "Documento agregado con éxito",
          data: userDto,
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

// Ruta que elimina los usuarios sin conexión
async function deleteUsers(req, res, next) {
  console.log("entro");
  try {
    const usersToDelete = [];
    const allUsers = await usersService.getAllUsers();
    console.log(allUsers);
    if (allUsers.length === 0) {
      req.logger.error(
        `Error de base de datos: No hay usuarios registrados ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(allUsers, EErrors.DATABASE_ERROR),
        message: "No hay usuarios registrados",
        code: EErrors.DATABASE_ERROR,
      });
      res.status(404).json({ message: "No hay usuarios registrados" });
    } else {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const filteredUsers = allUsers.filter((user) => {
        const lastConnection = user.last_connection;
        let action;
        if (lastConnection.length >= 3) {
          action = lastConnection[lastConnection.length - 2];
        } else {
          action = lastConnection[0];
        }
        // Extrae la fecha y hora del string action
        const dateTimeString = action.action.replace(
          "Login realizado con éxito ",
          ""
        );
        const finalDate = dateTimeString.replace(
          "(hora estándar de Argentina)",
          ""
        );
        const date = new Date(finalDate);

        // Compara la fecha y hora de la última conexión con twoDaysAgo
        return date < twoDaysAgo;
      });
      usersToDelete.push(...filteredUsers);
    }
    const userIdsToDelete = usersToDelete.map((user) => user._id);
    if (userIdsToDelete.length === 0) {
      req.logger.info(
        `No hay usuarios para eliminar ${new Date().toLocaleString()}`
      );
      res.json({ message: "No hay usuarios para eliminar" });
    } else {
      for (const user of usersToDelete) {
        const mailer = new MailingService();
        const sendEmail = await mailer.sendSimpleMail({
          from: "E-Store",
          to: user.email,
          subject: "Usuario eliminado",
          html: `
          <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333;">Eliminación de Cuenta debido a Inactividad</h2>
            <p>Estimado/a ${user.first_name},</p>
            <p>Esperamos que este mensaje te encuentre bien. Nos ponemos en contacto contigo para informarte que tu cuenta en nuestro E-commerce ha sido eliminada debido a su falta de actividad.</p>
            <p>Hemos notado que no te has conectado a tu cuenta en las últimas 48 horas, y lamentablemente, esto ha llevado a la eliminación de tu cuenta de acuerdo con nuestras políticas de inactividad. Queremos recordarte la importancia de mantener tu cuenta activa para garantizar la seguridad y el acceso continuo a nuestros servicios.</p>
            <p>Si crees que esto ha sido un error o si deseas recuperar tu cuenta, por favor ponte en contacto con nuestro equipo de soporte a través de <a href="#" style="color: #4caf50; text-decoration: none;">Ayuda en linea</a> o llamando al <strong>+54 11 4567-8890</strong> lo antes posible. Estaremos encantados de ayudarte en el proceso de recuperación.</p>
            <p>Agradecemos tu comprensión y lamentamos cualquier inconveniente que esto pueda haber causado. Valoramos tu participación en nuestra plataforma y esperamos tenerte de vuelta pronto.</p>
            <p><strong>E-Store</strong><br>
          </div>
              `,
        });
        const result = await usersService.deleteManyUsers(userIdsToDelete);
        req.logger.info(
          `Usuarios eliminados con éxito ${new Date().toLocaleString()}`
        );
        res.json({
          message: "Usuarios eliminados con éxito",
          data: userIdsToDelete,
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

export {
  getAllUsers,
  addDocumentsToUser,
  updateUser,
  deleteUsers,
  userCart,
  updateUserRole,
  updatePassword,
  currentUser,
  forgotPassword,
};
