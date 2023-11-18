import chai from "chai";
import {
  createHash,
  isValidPassword,
  generateToken,
} from "../../src/utils/index.js";
import UserDTO from "../../src/dao/DTOs/users.dto.js";

// Configuración de Chai
const expect = chai.expect;

// Variables globales
let saveHash = "";
const TEST_TIMEOUT = 15000;
const randomPassword = Math.floor(Math.random() * 1000000).toString();
const user = {
  first_name: "Test",
  last_name: "User",
  username: "usertest@gmail.com",
  password: randomPassword,
  carts: [],
  role: "admin",
};

//Tests
describe("Text Utils With Chai", () => {
  before(function () {});
  beforeEach(function () {
    this.timeout(TEST_TIMEOUT);
  });

  it("Should user data ", () => {
    const result = new UserDTO(user);
    expect(result.first_name).to.be.equal(user.first_name);
    expect(result).to.be.an("object").and.to.not.have.property("last_name");
    expect(result.email).to.be.equal(user.email);
    expect(result).to.be.an("object").and.to.not.have.property("password");
    expect(result.role).to.be.equal(user.role);
  });

  it("Should create a hash", () => {
    const hash = createHash(randomPassword);
    const result = hash === randomPassword;
    saveHash = hash;
    expect(result).to.be.false;
  });

  it("Should verify a password", () => {
    const hash = createHash(randomPassword);
    const result = isValidPassword(hash, randomPassword);
    expect(result).to.be.true;
  });

  it("Should generate a token", () => {
    const token = generateToken(user);
    expect(token).to.be.a("string");
    expect(token).to.be.not.empty;
    expect(token).to.be.not.null;
  });
});
