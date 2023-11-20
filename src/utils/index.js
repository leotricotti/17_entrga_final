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

// Verificar si token es valido para actualizar contraseña
export const verifyToken = (req, res, next) => {
  const token = req.params.token;

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.logger.error(
        `Error de autenticación. El token no pudo ser verificado ${new Date().toLocaleString()}`
      );
    } else {
      req.user = user;
      next();
    }
  });
};

// Verificar JWT token
export const authToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.logger.error(
      `Error de autenticación. No es prosible autenticar el usuario ${new Date().toLocaleString()}`
    );
    res.status(401).send("No es prosible autenticar el usuario");
  } else {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        req.logger.error(
          `Error de autenticación. No fue posible verificar el token ${new Date().toLocaleString()}`
        );
        res.status(403).send("No fue posible verificar el token");
      } else {
        req.user = user;
        next();
      }
    });
  }
};

// Esta función para autenticar a los usuarios.
export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (error, user, info) {
      if (error) return next(error);
      if (!user)
        return res.status(401).json({
          error: info.messages ? info.messages : info.toString(),
        });
      req.logger.info(
        `Usuario autenticado con éxito ${new Date().toLocaleString()}`
      );
      req.user = user;
      next();
    })(req, res, next);
  };
};

// Controlar autorizacion de usuario
export const authorization = (...roles) => {
  return async (req, res, next) => {
    const user = await usersService.getOneUser(req.user.user.username);
    const userRole = user[0].role;
    try {
      if (!userRole) {
        req.logger.error(
          `Error de autenticación: Usuario no autorizado. ${new Date().toLocaleString()}`
        );
        return res.status(401).send({ error: "Usuario no autorizado" });
      }
      if (!roles.includes(userRole)) {
        req.logger.error(
          `Error de autenticación. Usuario sin permisos ${new Date().toLocaleString()}`
        );
        return res.status(403).send({ error: "Usuario sin permisos" });
      }
      next();
    } catch (error) {
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
    last_conection: [
      {
        action: `Login realizado con éxito ${new Date().toLocaleString()}`,
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
    } else if (file.fieldname.includes("Product")) {
      path += "/products";
    } else {
      path += "/documents";
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
