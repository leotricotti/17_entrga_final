import usersModel from "../models/users.model.js";

export default class SessionsDao {
  //Metodo asyncrono para realizar el signup
  signup = async (user) => {
    try {
      const result = await usersModel.create(user);
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Metodo asyncrono que informa la ultima conexion del usuario
  lastConnection = async (id, action) => {
    try {
      const respuesta = await usersModel.findByIdAndUpdate(id, {
        $push: { last_connection: { action: action } },
      });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };
}
