import { Router } from "express";
import { getAll } from "../controllers/products.controller.js";
import { getOne } from "../controllers/products.controller.js";

//Inicializar servicios
const router = Router();

// Método asyncrono para obtener todos los productos
router.get("/", getAll);

// Metodo asyncrono para obtener un producto por id
router.get("/:pid", getOne);

export default router;
