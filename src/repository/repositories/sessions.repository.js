export default class SessionsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  //Método asyncrono realizar el login
  async userLogin(username, password) {
    const result = await this.dao.login(username, password);
    return result;
  }

  //Metodo asyncrono para realizar el signup
  async signupUser(user) {
    const result = await this.dao.signup(user);
    return result;
  }

  //Metodo asyncrono que informa la ultima conexion del usuario
  async lastConnection(id, action) {
    const result = await this.dao.lastConnection(id, action);
    return result;
  }
}
