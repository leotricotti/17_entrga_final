import mongoose from "mongoose";
import Session from "../../src/dao/classes/sessions.dao.js";
import User from "../../src/dao/classes/users.dao.js";
import Carts from "../../src/dao/classes/carts.dao.js";
import Products from "../../src/dao/classes/products.dao.js";
import Assert from "assert";
import config from "../../src/config/config.js";

//Configuración de Assert
const assert = Assert.strict;

// Variables globales
const MONGO_URL = config.mongo.URL;
const TEST_TIMEOUT = 15000;
const randomPassword = Math.floor(Math.random() * 1000000).toString();
const randomEmail = `tricottileo${randomPassword}@gmail.com`;
let TEST_USER_ID = "";
let TEST_USERNAME = "";
let cartId = "";
const role = "admin";

// Conexión a la base de datos
mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
});

// Función para obtener el usuario actualizado
async function getUpdatedUser(usersDao, username) {
  const updatedUser = await usersDao.getOne(username);
  return updatedUser[0];
}

// Tests
describe("Testing Users Dao With Assert", () => {
  beforeEach(function () {
    this.usersDao = new User();
    this.cartsDao = new Carts();
    this.sessionDao = new Session();
    this.productsDao = new Products();
  });

  beforeEach(async function () {
    this.timeout(TEST_TIMEOUT);
    const cart = await this.cartsDao.getAll();
    cartId = cart[0]._id;
  });

  it("Should create user", async function () {
    const user = {
      first_name: "Leonardo",
      last_name: "Tricotti",
      email: randomEmail,
      password: "123456",
    };
    const result = await this.sessionDao.signup(user);
    TEST_USER_ID = result._id;
    TEST_USERNAME = result.email;
    assert.equal(result.first_name, user.first_name, "Names should be equal");
  });

  it("Should get one user", async function () {
    const result = await this.usersDao.getOne(TEST_USERNAME);
    const user = await getUpdatedUser(this.usersDao, TEST_USERNAME);
    assert.equal(
      result[0].first_name,
      user.first_name,
      "Names should be equal"
    );
  });

  it("Should update password", async function () {
    const newPassword = randomPassword;
    await this.usersDao.updatePassword(TEST_USER_ID, newPassword);
    const updatedUser = await getUpdatedUser(this.usersDao, TEST_USERNAME);
    assert.equal(
      updatedUser.password,
      newPassword,
      "Passwords should be equal"
    );
  });

  it("Should update cart", async function () {
    await this.usersDao.updateCart(TEST_USER_ID, cartId);
    const updatedUser = await getUpdatedUser(this.usersDao, TEST_USERNAME);
    assert.ok(updatedUser.carts.includes(cartId), "Cart should be updated");
  });

  it("Should update role", async function () {
    await this.usersDao.updateRole(TEST_USER_ID, role);
    const updatedUser = await getUpdatedUser(this.usersDao, TEST_USERNAME);
    assert.equal(updatedUser.role, role, "Role should be updated");
  });
});
