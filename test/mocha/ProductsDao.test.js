import mongoose from "mongoose";
import Products from "../../src/dao/classes/products.dao.js";
import Assert from "assert";
import config from "../../src/config/config.js";

// Configuración de Assert
const assert = Assert.strict;

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
describe("Testing Products Dao With Assert", () => {
  before(function () {
    this.productsDao = new Products();
  });
  beforeEach(function () {
    this.timeout(TEST_TIMEOUT);
  });

  it("Should get all products", async function () {
    const result = await this.productsDao.getAll();
    assert(Array.isArray(result), "Result should be an array");
    assert(result.length > 0, "Result array should not be empty");
  });

  it("Should create a new product", async function () {
    const product = {
      title: "Test product",
      description: "Test description",
      code: randomCode.toString(),
      price: 100,
      stock: 10,
      category: "Test category",
    };
    const result = await this.productsDao.saveProduct(product);
    pid = result._id;
    title = result.title;
    assert.equal(title, product.title, "Title should be equal");
  });

  it("Should get one product", async function () {
    const result = await this.productsDao.getOne(pid);
    assert.equal(result.title, title, "Title should be equal");
  });

  it("Should update a product", async function () {
    const product = {
      title: "Test product modified",
      description: "Test description modified",
      price: 100,
      stock: 10,
      category: "Test category modified",
    };
    const result = await this.productsDao.updateProduct(pid, product);
    const updatedProduct = await getUpdatedProduct(this.productsDao, pid);
    assert.equal(updatedProduct.title, product.title, "Title should be equal");
  });

  it("Should delete a product", async function () {
    const result = await this.productsDao.deleteProduct(pid);
    const deletedProduct = await this.productsDao.getOne(pid);
    assert.equal(deletedProduct === null, true, "Product should be null");
  });

  it("Should get filtered products", async function () {
    const result = await this.productsDao.filteredProducts("Audio");
    assert.equal(Array.isArray(result), true, "Result should be an array");
    assert.equal(result.length > 0, true, "Result array should not be empty");
  });

  it("Should get ordered products", async function () {
    const result = await this.productsDao.orderedProducts("-1");
    assert.equal(Array.isArray(result), true, "Result should be an array");
    assert.equal(result.length > 0, true, "Result array should not be empty");
  });

  it("Should get paginated products", async function () {
    const result = await this.productsDao.paginatedProducts("1");
    assert.equal(Array.isArray(result.docs), true, "Result should be an array");
    assert.equal(
      result.docs.length > 0,
      true,
      "Result array should not be empty"
    );
  });
});
