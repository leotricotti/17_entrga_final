import passport from "passport";
import bcrypt from "bcrypt";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { faker } from "@faker-js/faker/locale/es";
import { usersService } from "../repository/index.js";
import multer from "multer";
import __dirname from "../../utils.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

//Cargar variables de entorno
const JWT_SECRET = config.jwt.SECRET;

// Encriptar contraseña
export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Validar contraseña
export const isValidPassword = (savedPassword, password) => {
  return bcrypt.compareSync(password, savedPassword);
};

// Generar JWT token
export const generateToken = (user) => {
  const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "1h" });
  return token;
};

// Middleware para verificar si el token es válido para actualizar la contraseña
export const verifyToken = (req, res, next) => {
  // Extraer el token de los parámetros de la solicitud
  const token = req.params.token;

  // Verificar el token usando jsonwebtoken
  jwt.verify(token, JWT_SECRET, (err, user) => {
    // Si hay un error (el token no es válido o ha expirado), registrar el error
    if (err) {
      req.logger.error(
        `Error de autenticación. El token no pudo ser verificado ${new Date().toLocaleString()}`
      );
    }
    // Si el token es válido, añadir el usuario al objeto de solicitud y pasar al siguiente middleware
    else {
      req.user = user;
      next();
    }
  });
};

// Middleware para verificar el token JWT
export const authToken = (req, res, next) => {
  // Extraer el encabezado de autorización de la solicitud
  const authHeader = req.headers.authorization;

  // Si no hay encabezado de autorización, enviar una respuesta de error
  if (!authHeader) {
    req.logger.error(
      `Error de autenticación. No es posible autenticar al usuario ${new Date().toLocaleString()}`
    );
    res.status(401).send("No es posible autenticar al usuario");
  }
  // Si hay un encabezado de autorización, verificar el token
  else {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      // Si hay un error (el token no es válido o ha expirado), enviar una respuesta de error
      if (err) {
        req.logger.error(
          `Error de autenticación. No fue posible verificar el token ${new Date().toLocaleString()}`
        );
        res.status(403).send("No fue posible verificar el token");
      }
      // Si el token es válido, añadir el usuario al objeto de solicitud y pasar al siguiente middleware
      else {
        req.user = user;
        next();
      }
    });
  }
};
// Esta función para autenticar a los usuarios.
export const passportCall = (strategy) => {
  return async (req, res, next) => {
    // Autenticar al usuario utilizando la estrategia proporcionada
    passport.authenticate(strategy, function (error, user, info) {
      // Si hay un error, pasar al siguiente middleware
      if (error) return next(error);
      // Si el usuario no existe, enviar una respuesta de error
      if (!user)
        return res.status(401).json({
          error: info.messages ? info.messages : info.toString(),
        });
      // Si el usuario existe, registrar la autenticación exitosa, añadir el usuario al objeto de solicitud y pasar al siguiente middleware
      req.logger.info(
        `Usuario autenticado con éxito ${new Date().toLocaleString()}`
      );
      req.user = user;
      next();
    })(req, res, next);
  };
};

// Middleware para controlar la autorización de los usuarios
export const authorization = (...roles) => {
  return async (req, res, next) => {
    // Obtener el usuario de la base de datos
    const user = await usersService.getOneUser(req.user.user.username);
    const userRole = user[0].role;

    try {
      // Si el usuario no tiene un rol, enviar una respuesta de error
      if (!userRole) {
        req.logger.error(
          `Error de autenticación: Usuario no autorizado. ${new Date().toLocaleString()}`
        );
        return res.status(401).send({ error: "Usuario no autorizado" });
      }
      // Si el rol del usuario no está incluido en los roles permitidos, enviar una respuesta de error
      if (!roles.includes(userRole)) {
        req.logger.error(
          `Error de autenticación. Usuario sin permisos ${new Date().toLocaleString()}`
        );
        return res.status(403).send({ error: "Usuario sin permisos" });
      }
      // Si el rol del usuario está incluido en los roles permitidos, pasar al siguiente middleware
      next();
    } catch (error) {
      // Si ocurre un error, pasar al siguiente middleware
      next(error);
    }
  };
};

// Generar usuarios falsos
export function generateUsers() {
  // Generar datos falsos
  const lastName = faker.person.lastName();
  const removeSpaces = lastName.replace(/\s/g, "");
  const email = `${removeSpaces}@gmail.com`.toLowerCase();
  return {
    first_name: faker.person.firstName(),
    last_name: lastName,
    email: email,
    password: createHash(faker.internet.password()),
    last_connection: [
      {
        action: `Login realizado con éxito ${faker.date.recent({ days: 4 })}`,
      },
      {
        action: `Logout realizado con éxito ${faker.date.recent({ days: 4 })}`,
      },
    ],
  };
}

// Generar productos falsos
export function generateProducts() {
  return {
    title: faker.lorem.sentence({ min: 1, max: 3 }),
    description: faker.lorem.paragraph({ min: 2, max: 4 }),
    code: faker.number.int({ min: 100000, max: 1000000 }),
    price: faker.commerce.price(),
    stock: faker.number.int(20),
    category: faker.helpers.arrayElement(["Audio", "Hogar", "Electronics"]),
    thumbnail: [
      {
        img1: "https://www.hapuricellisa.com.ar/plugins/productos/producto-sin-imagen.png",
      },
    ],
  };
}

// Configurar multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = __dirname + "/public";
    if (file.fieldname.includes("Profile")) {
      path += "/profiles";
    }
    cb(null, path);
  },
  filename: function (req, file, cb) {
    // Generar un identificador único y agregar la extensión del archivo original
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const uploader = multer({ storage: storage });
