import { usersService } from "../repository/index.js";
import UsersDto from "../dao/DTOs/users.dto.js";
import allUsersDto from "../dao/DTOs/allUsers.dto.js";
import { generateToken, createHash, isValidPassword } from "../utils/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import {
  generateSessionErrorInfo,
  generateUserCartErrorInfo,
} from "../services/errors/info.js";
import MailingService from "../services/mailing.js";

// Ruta que obtiene todos los usuarios
async function getAllUsers(req, res, next) {
  try {
    const users = await usersService.getAllUsers();
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
      res.status(404).json({ message: "No hay usuarios registrados" });
    }
    const usersDto = users.map((user) => new allUsersDto(user));
    req.logger.info(
      `Usuarios enviados al cliente con éxito ${new Date().toLocaleString()}`
    );
    res.json({
      message: "Usuarios enviados al cliente con éxito",
      data: usersDto,
    });
  } catch (error) {
    next(error);
  }
}

// Ruta que realiza el envío de correo de recuperación de contraseña
async function forgotPassword(req, res, next) {
  const { username } = req.body;
  try {
    if (!username) {
      const result = [username];
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
      const passwordToken = generateToken({ username });
      const mailer = new MailingService();
      const sendEmail = await mailer.sendSimpleMail({
        from: "E-Store",
        to: username,
        subject: "Recuperación de contraseña",
        html: ` 
          <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
              <h2 style="text-align: center; color: #333;">Recuperación de Contraseña</h2>
              <p>Estimado/a ${user[0].first_name},</p>
              <p>Te enviamos este correo electrónico porque solicitaste restablecer tu contraseña. Para completar el proceso por favor sigue las instrucciones:</p>
              <p><strong>Paso 1:</strong> Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
              <p><a href="http://127.0.0.1:5500/html/newPassword.html?token=${passwordToken}" style="text-decoration: none; background-color: #4caf50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 10px;">Restablecer Contraseña</a></p>
              <p><strong>Paso 2:</strong> Una vez que hagas clic en el enlace, serás redirigido/a a una página donde podrás crear una nueva contraseña segura para tu cuenta.</p>
              <p>Si no solicitaste restablecer tu contraseña, por favor ignora este mensaje. Tu información de cuenta sigue siendo segura y no se ha visto comprometida.</p>
              <p>Atentamente,</p>
              <p><strong>E-Store</strong><br>
          </div>
            `,
      });
      req.logger.info(
        `Correo de recuperación enviado al usuario ${new Date().toLocaleString()}`
      );
      res.status.json({
        response: "Correo de recuperación enviado al usuario",
        data: passwordToken,
      });
    }
  } catch (error) {
    next(error);
  }
}

// Funcion que actualiza el perfil del usuario
async function updateUser(req, res, next) {
  const { data, uid } = req.body;
  try {
    if (!uid || !data) {
      const result = [uid, data];
      req.logger.error(
        `Error de tipo de dato: Error al actualizar el perfil ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error al actualizar el perfil",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error al actualizar el perfil" });
    } else {
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
        const result = await usersService.updateOneUser(id, data);
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
          res.status(404).json({ message: "Usuario no encontrado" });
        } else {
          const updatedUser = await usersService.getOneUser(id);
          const userDto = new UsersDto(updatedUser);
          req.logger.info(
            `Perfil actualizado con éxito ${new Date().toLocaleString()}`
          );
          res.status(200).json({
            message: "Perfil actualizado con éxito",
            data: userDto,
          });
        }
      }
    }
  } catch (error) {
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
async function deleteUnconnectedUsers(req, res, next) {
  try {
    const result = await usersService.deleteDisconnectedUsers();
    if (!result) {
      req.logger.error(
        `Error de base de datos: Error al eliminar los usuarios sin conexión ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Error al eliminar los usuarios sin conexión",
        code: EErrors.DATABASE_ERROR,
      });
      res
        .status(404)
        .json({ message: "Error al eliminar los usuarios sin conexión" });
    } else {
      req.logger.info(
        `Usuarios sin conexión eliminados con éxito ${new Date().toLocaleString()}`
      );
      res.json({
        message: "Usuarios sin conexión eliminados con éxito",
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
}

export {
  deleteUnconnectedUsers,
  getAllUsers,
  addDocumentsToUser,
  updateUser,
  userCart,
  updateUserRole,
  updatePassword,
  currentUser,
  forgotPassword,
};
