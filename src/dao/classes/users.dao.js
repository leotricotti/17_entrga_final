import usersModel from "../models/users.model.js";

export default class UsersDao {
  //Método asyncrono para insertar multiples usuarios
  insertMany = async (data) => {
    try {
      const result = await usersModel.insertMany(data);
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  //Método asyncrono para obtener todos los usuarios
  getAll = async () => {
    try {
      const result = await usersModel.find();
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  //Método asyncrono para obtener un usuario
  getOne = async (uid) => {
    try {
      const result = await usersModel.find({ email: uid });
      return result;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  //Metodo asyncrono que actualiza el usuario
  updateOne = async (userId, data) => {
    try {
      const respuesta = await usersModel.findByIdAndUpdate(userId, {
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number,
        home_address: data.home_address,
        zip_code: data.zip_code,
        state: data.state,
        city: data.city,
      });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  //Metodo asyncrono que actualiza la contraseña
  updatePassword = async (user, newPassword) => {
    try {
      const respuesta = await usersModel.findByIdAndUpdate(user, {
        password: newPassword,
      });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  //Método asyncrono para actualizar el carrito
  updateCart = async (id, cartId) => {
    try {
      const respuesta = await usersModel.findByIdAndUpdate(id, {
        $addToSet: { carts: cartId },
      });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Método asyncrono para cambiar el role del usuario
  updateRole = async (id, role) => {
    try {
      const respuesta = await usersModel.findByIdAndUpdate(id, { role: role });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Método asyncrono para agregar documentos al usuario
  addDocuments = async (id, documents) => {
    try {
      const user = await usersModel.findById(id);
      for (const key in documents) {
        for (const document of documents[key]) {
          user.documents.addToSet({
            name: document.fieldname,
            reference: document.path,
          });
        }
      }
      const respuesta = await user.save();
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  updateProfileImage = async (id, image) => {
    try {
      let user = await usersModel.findById(id);
      if (!user) {
        return [];
      }

      let docIndex = user.documents.findIndex(
        (doc) => doc.name === "userProfileImage"
      );
      if (docIndex !== -1) {
        // Si el documento existe, actualízalo
        user.documents[docIndex].reference = image.path;
      } else {
        // Si el documento no existe, créalo
        user.documents.push({
          name: "userProfileImage",
          reference: image.path,
        });
      }

      // Guarda el usuario actualizado
      const respuesta = await user.save();
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Metodo asyncrono para eliminar un usuario
  deleteOne = async (userId) => {
    try {
      const respuesta = await usersModel.findByIdAndDelete(userId);
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Método asyncrono para eliminar usuarios específicos
  deleteUsers = async (userIds) => {
    try {
      const respuesta = await usersModel.deleteMany({
        _id: { $in: userIds },
      });
      return respuesta;
    } catch (error) {
      console.log(error);
      return [];
    }
  };
}
