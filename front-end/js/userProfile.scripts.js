//Variables globales
const userProfile = [];
const userProfileForm = document.getElementById("user-profile-form");
const addDocumentsForm = document.getElementById("add-documents-form");
const token = localStorage.getItem("token");
const PORT = localStorage.getItem("port");
const localPort = localStorage.getItem("localPort");

// Función que captura la información del usuario y la almacena en el local storage
const getUser = async () => {
  const premium = "premium";

  try {
    const response = await fetch(`http://localhost:${PORT}/api/users/current`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    userProfile.push(result.data);

    if (result.length > 0 || result.data) {
      localStorage.setItem("user", JSON.stringify(result.data));
      showSpinner(userProfile);
    }

    if (
      result.data.documents.length > 0 &&
      result.data.documents.some(
        (document) => document.name !== "userProfileImage"
      ) &&
      result.data.role === "user"
    ) {
      updateUserRole(premium);
    }

    renderUserProfile();

    return result;
  } catch (error) {
    console.log(error);
  }
};

// Función que personaliza la imagen de usuario
const addUserProfileImage = async (userProfileImage) => {
  const userId = userProfile[0].email;
  const formData = new FormData();
  formData.append("userProfileImage", userProfileImage);

  const response = await fetch(
    `http://localhost:${PORT}/api/users/${userId}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const result = await response.json();
  return result;
};

// Función que compruba si el usuario subió una imagen de perfil
const checkUserProfileImage = () => {
  const userImage = userProfile[0].documents.filter(
    (document) => document.name === "userProfileImage"
  );

  if (userImage.length > 0) {
    const referenceParts = userImage[0].reference.split("/");
    const finalReference =
      "/profiles/" + referenceParts[referenceParts.length - 1];
    return `<img class="rounded-circle mt-5" width="150px" height="150px" style="object-fit: contain" src="http://localhost:${PORT}${finalReference}" />`;
  } else {
    return `<img class="rounded-circle mt-5" width="150px" height="150px" src="../img/user-avatar.png" />`;
  }
};

// Función que renderiza el perfil del usuario
function renderUserProfile() {
  let html = "";

  html += `
    ${userProfile.map((user) => {
      return `
        <div class="row">
          <div class="col-md-4 border-right">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5">
              <div class="position-relative">
                ${checkUserProfileImage()}
                <button
                  type="button"
                  class="btn position-absolute"
                  style="
                    background-color: #eee;
                    border-radius: 50%;
                    bottom: 10px;
                    right: 20px;
                  "
                  id="user-profile-image"
                  onclick="${addUserProfileImage()}"
                >
                  <input type="file" class="form-control d-none" />
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              <span class="font-weight-bold">${user.first_name} ${
        user.last_name
      }</span>
              <span class="text-black-50">${user.email}</span>
              <div id="link-container"></div>
            </div>
          </div>
          <div class="col-md-7 border-right">
            <div class="p-3 py-5">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="text-right">Perfil</h4>
              </div>
              <div class="row mt-2">
                <div class="col-md-6">
                  <label class="labels" for='first_name'>Nombre</label>
                  <input type="text" class="form-control" value=${
                    user.first_name
                  } id='first_name' autocomplete="off" required/>
                </div>
                <div class="col-md-6">
                  <label class="labels" for="last_name">Apellido</label>
                  <input type="text" class="form-control" value=${
                    user.last_name
                  } id="last_name" autocomplete="off" required/>
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-12">
                  <label class="labels" for="phone_number">Teléfono</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su telefono"
                    id="phone_number"
                    value="${user.phone_number}" 
                    required
                    autocomplete="off"
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label class="labels" for="home_address">Dirección de envío</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su dirección"
                    value="${user.home_address}"
                    id="home_address"
                    required
                    autocomplete="off"
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label class="labels" for="zip_code">Código Postal</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su código postal"
                    value="${user.zip_code}"
                    id="zip_code"
                    required
                    autocomplete="off"
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label class="labels" for="state">Provincia</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su provincia"
                    value="${user.state}"
                    id="state"
                    required
                    autocomplete="off"
                  />
                </div>
                <div class="col-md-12 mt-3">
                  <label class="labels" for="city">Ciudad</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Ingrese su ciudad"
                    value="${user.city}"
                    id="city"
                    required
                    autocomplete="off"
                  />
                </div>
                <div class="mt-5 text-center">
                  <button
                    type="submit"
                    id="signup-button"
                    class="btn btn-secondary profile-button"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })}
  `;

  userProfileForm.innerHTML = html;

  // Agrega el evento de click después de renderizar el HTML
  const button = document.getElementById("user-profile-image");
  if (button) {
    button.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*"; // Solo acepta archivos de imagen
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);

      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];

        // Crear un enlace y una imagen para el archivo subido
        const linkContainer = document.getElementById("link-container");
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.target = "_blank";
        link.classList.add("link");
        link.href = url;
        link.textContent = "Ver imagen";
        linkContainer.appendChild(link);

        addUserProfileImage(file);
      });

      fileInput.click();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getUser();
});

// Función que completa el perfil del usuario
userProfileForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const first_name = document.getElementById("first_name").value;
  const last_name = document.getElementById("last_name").value;
  const phone_number = document.getElementById("phone_number").value;
  const home_address = document.getElementById("home_address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const zip_code = document.getElementById("zip_code").value;

  const userData = {
    first_name,
    last_name,
    phone_number,
    home_address,
    city,
    state,
    zip_code,
  };

  Swal.fire({
    icon: "question",
    title: "¿Confirma los cambios?",
    text: "Si desea puede modificar sus datos más tarde.",
    confirmButtonText: "Aceptar",
    confirmButtonColor: "#3085d6",
    showClass: {
      popup: "animate__animated animate__zoomIn",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      sendProfileData(userData);
    }
  });
});

// Función que envía los datos del perfil del usuario al servidor
async function sendProfileData(data) {
  const userId = userProfile[0].email;
  const response = await fetch(
    `http://localhost:${PORT}/api/users/userProfile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: data,
        uid: userId,
      }),
    }
  );

  const result = await response.json();

  console.log(result);

  if (result.message === "Perfil actualizado con éxito.") {
    Swal.fire({
      icon: "success",
      title: "¡Datos actualizados!",
      confirmButtonText: "Aceptar",

      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    }).then((resulted) => {
      if (resulted.isConfirmed) {
        localStorage.setItem("user", JSON.stringify(result.data));
        window.location.reload();
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "¡Error!",
      text: "No se pudieron actualizar los datos.",
      confirmButtonText: "Aceptar",

      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
  }

  return result;
}

// Función que redirige al usuario a la página de productos
const goToProducts = () => {
  window.location.href = `http://127.0.0.1:${localPort}/html/products.html`;
};
