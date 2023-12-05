import { Router } from "express";
import { verifyToken, authToken, authorization } from "../utils/index.js";
import {
  deleteUsers,
  deleteUser,
  updateUser,
  forgotPassword,
  updatePassword,
  updateUserRole,
  currentUser,
  userCart,
  getAllUsers,
} from "../controllers/users.controler.js";
import { passportCall } from "../utils/index.js";

const router = Router();

// Ruta que envia todos los usuarios
router.get("/", authToken, authorization("admin"), getAllUsers);

// Ruta que envia el usuario logueado
router.get("/current", passportCall("jwt"), currentUser);

//Ruta que recupera la contraseña
router.post("/forgotPassword", forgotPassword);

// Ruta que actualiza los datos del usuario
router.put("/userProfile", authToken, updateUser);

// Ruta que actualiza la contraseña
router.put("/updatePassword/:token", verifyToken, updatePassword);

//Ruta que actualiza el role del usuario
router.put("/premium/:id", authToken, updateUserRole);

// Ruta que actualiza el carrito del usuario
router.put("/cart", authToken, userCart);

// Ruta que elimina un usuario
router.delete(
  "/userDelete/:uid",
  authToken,
  authorization("admin"),
  deleteUser
);

// Ruta que elimina los usuarios sin conección
router.delete("/deleteUnconnectedUsers", deleteUsers);

export default router;
