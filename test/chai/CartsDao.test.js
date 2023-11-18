import mongoose from "mongoose";
import Carts from "../../src/dao/classes/carts.dao.js";
import Products from "../../src/dao/classes/products.dao.js";
import chai from "chai";
import config from "../../src/config/config.js";

// Configuración de Chai
const expect = chai.expect;

// Variables globales
const MONGO_URL = config.mongo.URL;
const TEST_TIMEOUT = 15000;
let cid = "";
let pid = "";
const emptyCart = {
  products: [],
};

// Conexión a la base de datos
mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
});

// Funciones auxiliares
async function getUpdatedCart(cartsDao, cid) {
  const updatedCart = await cartsDao.getOne(cid);
  return updatedCart;
}

// Tests
describe("Testing Carts Dao With Assert", () => {
  before(function () {
    this.cartsDao = new Carts();
    this.productsDao = new Products();
  });

  beforeEach(async function () {
    this.timeout(TEST_TIMEOUT);
    const products = await this.productsDao.getAll();
    pid = products[0]._id.toString();
  });

  it("Should get all carts", async function () {
    const result = await this.cartsDao.getAll();
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });

  it("Should create a cart", async function () {
    const result = await this.cartsDao.saveCart(emptyCart);
    cid = result._id;
    expect(result.products).to.be.an("array");
  });

  it("Should get one cart", async function () {
    const result = await this.cartsDao.getOne(cid);
    expect(result).to.be.an("object");
  });

  it("Should add a product to a cart", async function () {
    const cart = {
      products: [
        {
          product: pid,
          quantity: 1,
        },
      ],
    };
    const result = await this.cartsDao.updateCart(cid, cart);
    const updatedCart = await getUpdatedCart(this.cartsDao, cid);
    expect(updatedCart.products).to.be.an("array");
  });

  it("Should empty cart", async function () {
    const result = await this.cartsDao.emptyCart(cid, emptyCart);
    const updatedCart = await getUpdatedCart(this.cartsDao, cid);
    expect(updatedCart.products).to.be.an("array");
  });
});
