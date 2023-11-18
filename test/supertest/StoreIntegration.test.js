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
let cid = "";
let uid = "";
const products = [];
let price = 0;
let quantity = 0;
let userToken = "";
const randomCode = Math.floor(Math.random() * 100000);
const randomPassword = Math.floor(Math.random() * 100000);
const randomEmail = `testuser${randomCode}@gmail.com`;

// Inicio de los tests
describe("Testing Ecommerse Store", () => {
  // Test Products endpoints
  describe("User Integration Test", () => {
    it("Should create a user", async () => {
      const response = await request.post("/api/sessions/signup").send({
        first_name: "Test",
        last_name: "User",
        email: randomEmail,
        password: randomPassword.toString(),
      });
      uid = response.body.data.email;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Usuario creado con éxito");
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data.first_name).equal("Test");
      expect(response.body.data.last_name).equal("User");
      expect(response.body.data.email).equal(randomEmail);
      expect(response.body.data).to.not.have.property("image");
    });

    it("Should login a user", async () => {
      const response = await request.post("/api/sessions/login").send({
        username: randomEmail,
        password: randomPassword.toString(),
      });
      userToken = response.body.token;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Login realizado con éxito");
      expect(response.body).to.have.property("token");
      expect(response.body.token).to.not.be.empty;
      expect(response.body.token).to.be.a("string");
      expect(response.body).to.not.have.property("user");
    });

    it("Should get all products", async () => {
      const response = await request
        .get("/api/products")
        .set("Authorization", `Bearer ${userToken}`);
      const product = [response.body.products[0]];
      products.push({ product });
      price = response.body.products[0].price;
      pid = response.body.products[0]._id;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Productos obtenidos con éxito");
      expect(response.body.products[0]).to.have.property("_id");
      expect(response.body.products[0]).to.have.property("title");
      expect(response.body.products[0]).to.have.property("price");
      expect(response.body.products[0]).to.have.property("description");
      expect(response.body.products[0]).to.not.have.property("image");
    });

    it("Should create a cart", async () => {
      const response = await request
        .post("/api/carts")
        .set("Authorization", `Bearer ${userToken}`);
      cid = response.body.data._id;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito creado con éxito");
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data).to.have.property("products");
      expect(response.body.data.products).to.eql([]);
    });

    it("Should add a product to the cart", async () => {
      const response = await request
        .post(`/api/carts/${cid}/product/${pid}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ op: "add" });
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito actualizado con éxito");
      expect(
        response.body.data.products.some((product) => product.product === pid)
      ).to.be.true;
      expect(response.body.data.products[0].quantity).to.equal(1);
    });

    it("Should increase product quantity", async () => {
      const response = await request
        .post(`/api/carts/${cid}/product/${pid}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ op: "add" });
      quantity = response.body.data.products[0].quantity;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito actualizado con éxito");
      expect(
        response.body.data.products.some((product) => product.product === pid)
      ).to.be.true;
      expect(response.body.data.products[0].quantity).to.equal(2);
    });

    it("Should finish purchase", async () => {
      const response = await request
        .post(`/api/carts/${cid}/purchase`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          username: randomEmail,
          amountPurchase: price * quantity,
          products: products,
        });
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Compra realizada con éxito");
      expect(response.body.data).to.have.property("code");
      expect(response.body.data).to.have.property("purchaser");
      expect(response.body.data.purchaser).to.eql(randomEmail);
      expect(response.body).to.have.property("products");
      expect(response.body.products).to.eql([]);
    });
  });
});
