import { Router } from "express";
import { verifyToken, authToken, uploader } from "../utils/index.js";
import {
  addDocumentsToUser,
  updateUser,
  forgotPassword,
  updatePassword,
  updateUserRole,
  currentUser,
  userCart,
} from "../controllers/users.controler.js";
import { passportCall } from "../utils/index.js";

const router = Router();

// Ruta que agregaa un documento al usuario
router.post(
  "/:uid/documents",
  authToken,
  uploader.fields([
    { name: "userIdDocument", maxCount: 3 },
    { name: "userAddressDocument", maxCount: 3 },
    { name: "userCountDocument", maxCount: 3 },
    { name: "userProfileImage", maxCount: 1 },
  ]),
  addDocumentsToUser
);

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

// Ruta que envia el usuario logueado
router.get("/current", passportCall("jwt"), currentUser);

export default router;
