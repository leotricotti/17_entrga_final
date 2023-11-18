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
let userToken = "";
const username = "tricottileo@gmail.com";
const userPassword = "123456";

// Inicio de los tests
describe("Testing Ecommerse Store", () => {
  // Test Products endpoints
  describe("Testing Carts Endpoints", () => {
    before(async function () {
      const response = await request.post("/api/sessions/login").send({
        username: username,
        password: userPassword,
      });
      userToken = response.body.token;
    });

    before(async function () {
      const response = await request
        .get("/api/products")
        .set("Authorization", `Bearer ${userToken}`);
      pid = response.body.products[0]._id;
    });

    it("Should get all carts", async () => {
      const response = await request
        .get("/api/carts")
        .set("Authorization", `Bearer ${userToken}`);
      cid = response.body.data[0]._id;
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carritos cargados con éxito");
      expect(response.body.data[0]).to.have.property("_id");
      expect(response.body.data[0]).to.have.property("products");
    });

    it("Should get one cart", async () => {
      const response = await request
        .get(`/api/carts/${cid}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito obtenido con éxito");
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data).to.have.property("products");
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
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito actualizado con éxito");
      expect(
        response.body.data.products.some((product) => product.product === pid)
      ).to.be.true;
      expect(response.body.data.products[0].quantity).to.equal(2);
    });

    it("Should reduce product quantity", async () => {
      const response = await request
        .post(`/api/carts/${cid}/product/${pid}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ op: "substract" });
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito actualizado con éxito");
      expect(
        response.body.data.products.some((product) => product.product === pid)
      ).to.be.true;
      expect(response.body.data.products[0].quantity).to.equal(1);
    });

    it("Should delete a product from the cart", async () => {
      const response = await request
        .delete(`/api/carts/${cid}/product/${pid}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Producto eliminado con éxito");
      expect(
        response.body.data.products.some((product) => product.product === pid)
      ).to.be.false;
    });

    it("Should empty a cart", async () => {
      const response = await request
        .delete(`/api/carts/${cid}`)
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Carrito vaciado con éxito");
      expect(response.body.data.products).to.eql([]);
    });
  });
});
