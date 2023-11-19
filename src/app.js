import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import config from "./config/config.js";
import CartsRouter from "./routes/carts.routes.js";
import UsersRouter from "./routes/users.routes.js";
import SessionsRouter from "./routes/sessions.routes.js";
import ProductsRouter from "./routes/products.routes.js";
import RealTimeProducts from "./routes/realTimeProducts.routes.js";
import FakerRouter from "./routes/faker.routes.js";
import {
  initializeRegisterStrategy,
  initializeGithubStrategy,
  initializeJwtStrategy,
} from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import { authToken, authorization } from "./utils/index.js";
import __dirname from "../utils.js";
import { Server } from "socket.io";
import errorHandler from "./middlewares/errors/index.js";
import { addLogger } from "./utils/logger.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUIExpress from "swagger-ui-express";

//Variables
const app = express();
const PORT = config.app.PORT;
const MONGO_URL = config.mongo.URL;

const messages = [];

// Swagger
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

const specs = swaggerJSDoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(addLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Passport
initializeRegisterStrategy();
initializeJwtStrategy();
initializeGithubStrategy();
app.use(cookieParser());
app.use(passport.initialize());

//Función asincrónica para conectar a la base de datos  y chequear si está conectada
async function enviroment() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Base de datos conectada");
  } catch (error) {
    console.log(error);
  }
}

enviroment();

// Routes
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

// Ruta para el home
app.get("/", (req, res) => {
  res.send({ port: PORT });
});

// Server
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

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
