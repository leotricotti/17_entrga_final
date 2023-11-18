import mongoose from "mongoose";
import chai from "chai";
import Products from "../../src/dao/classes/products.dao.js";
import config from "../../src/config/config.js";
import e from "express";

// Configuración de Chai
const expect = chai.expect;

// Variables
const MONGO_URL = config.mongo.URL;
const TEST_TIMEOUT = 15000;
const randomCode = Math.floor(Math.random() * 1000);
let pid = "";
let title = "";

// Conexión a la base de datos
mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
});

// Funciones auxiliares
async function getUpdatedProduct(productsDao, pid) {
  const updatedProduct = await productsDao.getOne(pid);
  return updatedProduct;
}

// Tests
describe("Testing Products Dao With Chai", () => {
  before(function () {
    this.productsDao = new Products();
  });
  beforeEach(function () {
    this.timeout(TEST_TIMEOUT);
  });

  it("Should get all products", async function () {
    this.timeout(TEST_TIMEOUT);
    const result = await this.productsDao.getAll();
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });

  it("Should create a new product", async function () {
    const product = {
      title: "Test product",
      description: "Test description",
      code: randomCode.toString(),
      price: 100,
      stock: 10,
      category: "Test category",
      thumbnail: [
        {
          img1: "https://freezedepot.com/wp-content/uploads/2023/05/producto-sin-imagen.png",
        },
      ],
    };
    const result = await this.productsDao.saveProduct(product);
    pid = result._id;
    title = result.title;
    expect(result.title).to.be.equal(product.title);
  });

  it("Should get one product", async function () {
    const result = await this.productsDao.getOne(pid);
    expect(result.title).to.be.equal(title);
  });

  it("Should update a product", async function () {
    const product = {
      title: "Test product modified",
      description: "Test description modified",
      price: 100,
      stock: 10,
      category: "Test category modified",
      thumbnail: [
        {
          img1: "https://freezedepot.com/wp-content/uploads/2023/05/producto-sin-imagen.png",
        },
      ],
    };
    const result = await this.productsDao.updateProduct(pid, product);
    const updatedProduct = await getUpdatedProduct(this.productsDao, pid);
    expect(updatedProduct.title).to.be.equal(product.title);
  });

  it("Should delete a product", async function () {
    this.timeout(TEST_TIMEOUT);
    const result = await this.productsDao.deleteProduct(pid);
    const deletedProduct = await this.productsDao.getOne(pid);
    expect(deletedProduct).to.be.equal(null);
  });

  it("Should get filtered products", async function () {
    this.timeout(TEST_TIMEOUT);
    const result = await this.productsDao.filteredProducts("Audio");
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });

  it("Should get ordered products", async function () {
    this.timeout(TEST_TIMEOUT);
    const result = await this.productsDao.orderedProducts("-1");
    expect(result).to.be.an("array");
    expect(result.length).to.be.greaterThan(0);
  });

  it("Should get paginated products", async function () {
    this.timeout(TEST_TIMEOUT);
    const result = await this.productsDao.paginatedProducts("1");
    expect(result.docs).to.be.an("array");
    expect(result.docs.length).to.be.greaterThan(0);
  });
});
