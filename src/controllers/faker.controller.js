import { generateProducts, generateUsers } from "../utils/index.js";
import { productsService, usersService } from "../repository/index.js";

// Función que genera productos y los guarda en MongoDB
export const generateProductsAndSave = async (req, res) => {
  // Genera un array de 100 productos
  const products = Array.from({ length: 100 }, generateProducts);

  // Guarda los productos en la base de datos
  await productsService.createManyProducts(products);

  // Registra la información de éxito
  req.logger.info("Productos generados con éxito");

  // Envía la respuesta con los productos
  res.json(products);
};

// Función que genera usuarios y los guarda en MongoDB
export const generateUsersAndSave = async (req, res) => {
  // Genera un array de 100 usuarios
  const users = Array.from({ length: 100 }, generateUsers);

  // Guarda los usuarios en la base de datos
  await usersService.insertManyUsers(users);

  // Envía la respuesta con los usuarios
  res.json(users);
};
