import chai from "chai";
import config from "../../src/config/config.js";
import supertest from "supertest";

// Puerto del servidor
const PORT = config.app.PORT;

// Configuración de Chai y Supertest
const expect = chai.expect;
const request = supertest(`http://localhost:${PORT}`);

// Variables globales
let pid = "";
let adminToken = "";
let userToken = "";
const randomCode = Math.floor(Math.random() * 100000);
const adminUsername = config.admin.EMAIL;
const adminPassword = config.admin.PASSWORD;
const username = "tricottileo@gmail.com";
const userPassword = "123456";

// Objetos de prueba
const testProduct = {
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

const updatedProduct = {
  title: "Test product modified",
  description: "Test description modified",
  price: 100,
  code: randomCode.toString(),
  stock: 10,
  category: "Test category modified",
  thumbnail: [
    {
      img1: "https://freezedepot.com/wp-content/uploads/2023/05/producto-sin-imagen.png",
    },
  ],
};

// Inicio de los tests
describe("Testing Ecommerse Store", () => {
  //Test Products endpoints
  describe("Testing Products Endpoints", () => {
    before(async function () {
      const response = await request.post("/api/sessions/login").send({
        username: username,
        password: userPassword,
      });
      userToken = response.body.token;
    });

    it("Should get all products", async () => {
      const response = await request
        .get("/api/products")
        .set("Authorization", `Bearer ${userToken}`);
      pid = response.body.products[0]._id;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Productos obtenidos con éxito");
      expect(response.body.products[0]).to.have.property("_id");
      expect(response.body.products[0]).to.have.property("title");
      expect(response.body.products[0]).to.have.property("price");
      expect(response.body.products[0]).to.have.property("description");
      expect(response.body.products[0]).to.not.have.property("image");
    });

    it("Should get one product", async () => {
      const response = await request
        .get(`/api/products/${pid}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Producto obtenido con éxito");
      expect(response.body.product).to.have.property("_id");
      expect(response.body.product).to.have.property("title");
      expect(response.body.product).to.have.property("price");
      expect(response.body.product).to.have.property("description");
      expect(response.body.product).to.not.have.property("image");
    });
  });

  // Test Real Time Products endpoints
  describe("Testing Real Time Products Endpoints", () => {
    before(async function () {
      const response = await request.post("/api/sessions/login").send({
        username: adminUsername,
        password: adminPassword,
      });
      adminToken = response.body.token;
    });
    it("Should create a product", async () => {
      const response = await request
        .post("/api/realtimeproducts")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(testProduct);
      pid = response.body.data._id;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Producto creado con éxito");
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data).to.have.property("title");
      expect(response.body.data).to.have.property("price");
      expect(response.body.data).to.have.property("description");
      expect(response.body.data).to.not.have.property("image");
    });

    it("Should update a product", async () => {
      const response = await request
        .put(`/api/realtimeproducts/${pid}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updatedProduct);
      expect(response.status).to.eql(200);
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data.title).to.equal("Test product modified");
      expect(response.body.data).to.have.property("price");
      expect(response.body.data.description).to.equal(
        "Test description modified"
      );
      expect(response.body.data).to.not.have.property("image");
    });

    it("Should delete a product", async () => {
      const response = await request
        .delete(`/api/realtimeproducts/${pid}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Producto eliminado con éxito");
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data.title).to.equal("Test product modified");
      expect(response.body.data).to.have.property("price");
      expect(response.body.data.description).to.equal(
        "Test description modified"
      );
      expect(response.body.data).to.not.have.property("image");
    });
  });
});
