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
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      const result = [username, password];
      req.logger.error(
        `Error de tipo de dato: Error de inicio de sesión ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de tipo de dato",
        cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
        message: "Error de inicio de sesión",
        code: EErrors.INVALID_TYPES_ERROR,
      });
      res.status(400).json({ message: "Error de inicio de sesión" });
    } else {
      const result = await usersService.getOneUser(username);
      if (
        result.length === 0 ||
        !isValidPassword(result[0].password, password)
      ) {
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
    next(error);
  }
}

// Ruta que informa la última conexión del usuario
async function lastConnection(req, res, next) {
  const { username, action } = req.body;
  if (!username || !action) {
    const result = [username, action];
    req.logger.error(
      `Error de tipo de dato: Error al informar la última conexión ${new Date().toLocaleString()}`
    );
    CustomError.createError({
      name: "Error de tipo de dato",
      cause: generateSessionErrorInfo(result, EErrors.INVALID_TYPES_ERROR),
      message: "Error al informar la última conexión",
      code: EErrors.INVALID_TYPES_ERROR,
    });
    res.status(400).json({ message: "Error al informar la última conexión" });
    return;
  }
  try {
    const userResult = await usersService.getOneUser(username);
    const id = userResult[0]._id;
    const newAction = `${
      action === "login" ? "Login" : "Logout"
    } realizado con éxito ${new Date()}`;
    const result = await sessionsService.lastConnection(id, newAction);
    if (result.length === 0) {
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
      return;
    }
    req.logger.info(
      `Última acción informada con éxito ${new Date().toLocaleString()}`
    );
    res.json({
      message: "Última acción informada con éxito",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Github callback
async function githubCallback(req, res, next) {
  try {
    if (req.user.length === 0) {
      req.logger.error(
        `Error de base de datos: Usuario no encontrado ${new Date().toLocaleString()}`
      );
      CustomError.createError({
        name: "Error de base de datos",
        cause: generateSessionErrorInfo(req.user, EErrors.DATABASE_ERROR),
        message: "Usuario no encontrado",
        code: EErrors.DATABASE_ERROR,
      });

      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    } else {
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
    next(error);
  }
}

export { signupUser, loginUser, githubCallback, lastConnection };
