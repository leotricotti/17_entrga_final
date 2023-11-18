import { generateProducts, generateUsers } from "../utils/index.js";
import { productsService } from "../repository/index.js";
import { usersService } from "../repository/index.js";

// Funcion que genera productos y los guarda en momngoDB
export const generateProductsAndSave = async (req, res) => {
  const products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateProducts());
  }
  await productsService.createManyProducts(products);
  req.logger.info("Productos generados con éxito");
  res.json(products);
};

// Funcion que genera usuarios y los guarda en momngoDB
export const generateUsersAndSave = async (req, res) => {
  const users = [];
  for (let i = 0; i < 100; i++) {
    users.push(generateUsers());
  }
  await usersService.insertManyUsers(users);
  res.json(users);
};
