// Importar módulos necesarios
import express from "express"; // Framework web para Node.js
import cors from "cors"; // Middleware para habilitar CORS
import mongoose from "mongoose"; // ODM para MongoDB
import passport from "passport"; // Middleware para autenticación
import config from "./config/config.js"; // Configuración de la aplicación
import CartsRouter from "./routes/carts.routes.js"; // Rutas para carritos
import UsersRouter from "./routes/users.routes.js"; // Rutas para usuarios
import SessionsRouter from "./routes/sessions.routes.js"; // Rutas para sesiones
import ProductsRouter from "./routes/products.routes.js"; // Rutas para productos
import RealTimeProducts from "./routes/realTimeProducts.routes.js"; // Rutas para productos en tiempo real
import FakerRouter from "./routes/faker.routes.js"; // Rutas para datos falsos
import {
  initializeRegisterStrategy,
  initializeGithubStrategy,
  initializeJwtStrategy,
} from "./config/passport.config.js"; // Estrategias de autenticación de Passport
import cookieParser from "cookie-parser"; // Middleware para parsear cookies
import { authToken, authorization } from "./utils/index.js"; // Funciones de autenticación y autorización
import __dirname from "../utils.js"; // Ruta del directorio actual
import { Server } from "socket.io"; // Servidor de Socket.io
import errorHandler from "./middlewares/errors/index.js"; // Middleware para manejo de errores
import { addLogger } from "./utils/logger.js"; // Función para añadir un logger
import swaggerJSDoc from "swagger-jsdoc"; // Generador de documentación Swagger
import swaggerUIExpress from "swagger-ui-express"; // Middleware para servir la UI de Swagger

// Crear una nueva aplicación Express
const app = express();
// Configurar el puerto y la URL de MongoDB
const PORT = config.app.PORT;
const MONGO_URL = config.mongo.URL;

// Crear un array para almacenar los mensajes
const messages = [];

// Configurar las opciones de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "E-commerce API",
      description: "API desarrollado en el curso Backend de Coderhouse",
    },
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  apis: [`${__dirname}/docs/**/*.yaml`],
};

// Generar la documentación de Swagger
const specs = swaggerJSDoc(swaggerOptions);

// Configurar los middlewares
app.use(cors());
app.use(addLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Inicializar las estrategias de Passport y configurar los middlewares de Passport y cookie-parser
initializeRegisterStrategy();
initializeJwtStrategy();
initializeGithubStrategy();
app.use(cookieParser());
app.use(passport.initialize());

// Función para conectar a MongoDB
async function enviroment() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Base de datos conectada");
  } catch (error) {
    console.log(error);
  }
}

// Conectar a MongoDB
enviroment();

// Configurar las rutas
app.use(
  "/api/docs",
  swaggerUIExpress.serve,
  swaggerUIExpress.setup(specs, { explorer: true })
);
app.use("/api/users", UsersRouter);
app.use("/api/carts", authToken, authorization("user", "premium"), CartsRouter);
app.use("/api/sessions", SessionsRouter);
app.use(
  "/api/products",
  authToken,
  authorization("user", "premium"),
  ProductsRouter
);
app.use(
  "/api/realTimeProducts",
  authToken,
  authorization("admin", "premium"),
  RealTimeProducts
);
app.use("/api/faker", FakerRouter);
app.use(errorHandler);

// Configurar la ruta del home
app.get("/", (req, res) => {
  res.send({ port: PORT });
});

// Iniciar el servidor HTTP
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Configurar el evento de conexión de Socket.io
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado!");
  socket.on("message", (data) => {
    // Enviar una respuesta automática junto con el mensaje recibido
    const mensaje = data.message;
    const respuesta =
      "Gracias por contactarnos! En breve uno de nuestros representantes se comunicará contigo.";
    const mensajeConRespuesta = {
      mensaje: mensaje,
      respuesta: respuesta,
    };
    messages.push(mensajeConRespuesta);
    io.emit("messageLogs", messages);
  });
});
