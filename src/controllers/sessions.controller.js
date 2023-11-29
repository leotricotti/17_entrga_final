import { sessionsService, usersService } from "../repository/index.js";
import { generateToken, isValidPassword } from "../utils/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateSessionErrorInfo } from "../services/errors/info.js";

// Ruta que realiza el registro de usuario
async function signupUser(req, res) {
  req.logger.info(`Usuario creado con éxito ${new Date().toLocaleString()}`);
  res.json({ message: "Usuario creado con éxito", data: req.user });
}

// Ruta que realiza el inicio de sesión de usuario
async function loginUser(req, res, next) {
  // Extraer el nombre de usuario y la contraseña de la solicitud
  const { username, password } = req.body;

  try {
    // Si no se proporcionan el nombre de usuario o la contraseña, lanzar un error
    if (!username || !password) {
      const result = [username, password];
      req.logger.error(
        `Error de tipo de dato: Error de inicio de sesión ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error de inicio de sesión",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    // Si se proporcionan el nombre de usuario y la contraseña, intentar iniciar sesión
    else {
      const result = await usersService.getOneUser(username);

      // Si el usuario no existe o la contraseña no es válida, lanzar un error
      if (
        result.length === 0 ||
        !isValidPassword(result[0].password, password)
      ) {
        req.logger.error(
          `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
        );
        throw new CustomError({
          name: "Error de base de datos",
          cause: generateSessionErrorInfo(result, EErrors.DATABASE_ERROR),
          message: "Usuario no encontrado",
          code: EErrors.DATABASE_ERROR,
        });
      }
      // Si el usuario existe y la contraseña es válida, generar un token y enviar una respuesta exitosa
      else {
        const myToken = generateToken({
          first_name: result[0].first_name,
          username,
          role: result[0].role,
        });
        req.logger.info(
          `Login realizado con éxito ${new Date().toLocaleString()}`
        );
        res.json({ message: "Login realizado con éxito", token: myToken });
      }
    }
  } catch (error) {
    // Si ocurre un error, pasar al siguiente middleware
    next(error);
  }
}

// Ruta que informa la última conexión del usuario
async function lastConnection(req, res, next) {
  // Extraer el nombre de usuario y la acción de la solicitud
  const { username, action } = req.body;

  // Si no se proporcionan el nombre de usuario o la acción, lanzar un error
  if (!username || !action) {
    const result = [username, action];
    req.logger.error(
      `Error de tipo de dato: Error al informar la última conexión ${new Date().toLocaleString()}`
    );
    throw new CustomError({
      name: "Error de tipo de dato",
      cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
      message: "Error al informar la última conexión",
      code: EErrors.INVALID_TYPES_ERROR,
    });
  }

  try {
    // Obtener el usuario por su nombre de usuario
    const userResult = await usersService.getOneUser(username);
    const id = userResult[0]._id;

    // Crear la acción de conexión
    const newAction = `${
      action === "login" ? "Login" : "Logout"
    } realizado con éxito ${new Date()}`;

    // Intentar registrar la última conexión del usuario
    const result = await sessionsService.lastConnection(id, newAction);

    // Si el usuario no existe, lanzar un error
    if (result.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(result, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
    }

    // Si la última conexión se registra correctamente, enviar una respuesta exitosa
    req.logger.info(
      `Última acción informada con éxito ${new Date().toLocaleString()}`
    );
    res.json({ message: "Última acción informada con éxito", data: result });
  } catch (error) {
    // Si ocurre un error, pasar al siguiente middleware
    next(error);
  }
}

// Github callback
async function githubCallback(req, res, next) {
  try {
    // Si el usuario no existe, lanzar un error
    if (req.user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      throw new CustomError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(req.user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });
    }
    // Si el usuario existe, generar un token y redirigir al usuario a la página de inicio de sesión de GitHub
    else {
      req.logger.info(
        `Token generado con éxito ${new Date().toLocaleString()}`
      );
      const token = generateToken({
        first_name: req.user[0].first_name,
        username: req.user[0].email,
        role: req.user[0].role,
      });

      res.redirect(
        `http://127.0.0.1:5500/html/githubLogin.html?token=${token}`
      );
    }
  } catch (error) {
    // Si ocurre un error, pasar al siguiente middleware
    next(error);
  }
}

export { signupUser, loginUser, githubCallback, lastConnection };
