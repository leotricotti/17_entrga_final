import chai from "chai";
import config from "../../src/config/config.js";
import supertest from "supertest";

// Puerto del servidor
const PORT = config.app.PORT;

// Configuración de Chai y Supertest
const expect = chai.expect;
const request = supertest(`http://localhost:${PORT}`);

// Variables globales
let passwordToken = "";
let userToken = "";
let uid = "";
const randomPassword = Math.floor(Math.random() * 100000);
const randomEmail = `testuser${randomPassword}@gmail.com`;
const updatePassword = Math.floor(Math.random() * 100000);

// Inicio de los tests
describe("Testing Ecommerse Store", () => {
  describe("Testing Sessions Endpoints", () => {
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

    it("Should get current user", async () => {
      const response = await request
        .get("/api/sessions/current")
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.status).to.eql(200);
      expect(response.body.data.first_name).equal("Test");
      expect(response.body.data.username).equal(randomEmail);
      expect(response.body.data).to.not.have.property("image");
    });

    it("Should send email to user for recovery user password", async () => {
      const response = await request.post("/api/sessions/forgotPassword").send({
        username: randomEmail,
      });
      passwordToken = response.body.data;
      expect(response.status).to.eql(200);
      expect(response.body).to.have.property("response");
      expect(response.body.response).to.equal(
        "Correo de recuperación enviado al usuario"
      );
      expect(response.body).to.have.property("data");
      expect(response.body.data).not.to.be.empty;
    });

    it("Should update user password", async () => {
      const response = await request
        .put(`/api/sessions/updatePassword/${passwordToken}`)
        .send({
          newPasswordData: updatePassword.toString(),
        });
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal(
        "Contraseña actualizada con éxito"
      );
      expect(response.body.data).not.to.be.empty;
      expect(response.body.data).to.have.property("_id");
      expect(response.body.data.first_name).equal("Test");
      expect(response.body.data.last_name).equal("User");
      expect(response.body.data).to.not.have.property("image");
    });

    it("Should update user role", async () => {
      const response = await request
        .put(`/api/sessions/premium/${uid}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          role: "premium",
        });
      expect(response.status).to.eql(200);
      expect(response.body.message).to.equal("Rol actualizado con éxito");
      expect(response.body.data.first_name).equal("Test");
      expect(response.body.data.role).equal("premium");
      expect(response.body.data).to.not.have.property("image");
    });
  });
});
