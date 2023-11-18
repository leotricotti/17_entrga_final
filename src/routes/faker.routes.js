import { Router } from "express";
import {
  generateProductsAndSave,
  generateUsersAndSave,
} from "../controllers/faker.controller.js";

const router = Router();

// Ruta que genera productos
router.get("/products", generateProductsAndSave);

// Ruta que genera usuarios
router.get("/users", generateUsersAndSave);

export default router;
