export default class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  //Método asyncrono para obtener todos los usuarios
  async getAllUsers() {
    const result = await this.dao.getAll();
    return result;
  }

  //Método asyncrono para obtener un usuario
  async getOneUser(uid) {
    const result = await this.dao.getOne(uid);
    return result;
  }

  //Metodo asyncrono que actualiza el usuario
  async updateOneUser(userId, data) {
    const result = await this.dao.updateOne(userId, data);
    return result;
  }

  //Metodo asyncrono que actualiza la contraseña
  async updateUserPassword(user, newPassword) {
    const result = await this.dao.updatePassword(user, newPassword);
    return result;
  }

  // Método asyncrono para cambiar el role del usuario
  async updateUserRole(id, role) {
    const result = await this.dao.updateRole(id, role);
    return result;
  }

  //Método asyncrono para actualizar el carrito
  async updateUserCart(id, user) {
    const result = await this.dao.updateCart(id, user);
    return result;
  }

  // Metodo asyncrino que agrega documentos al usuario
  addUserDocuments = async (id, documents) => {
    const result = await this.dao.addDocuments(id, documents);
    return result;
  };

  updateOneProfileImage = async (id, profileImage) => {
    const result = await this.dao.updateProfileImage(id, profileImage);
    return result;
  };
}
