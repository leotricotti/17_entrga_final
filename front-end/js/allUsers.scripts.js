//Variables globales
const usersProfile = [];
const profileContainer = document.getElementById("profile-container");
const token = localStorage.getItem("token");
const PORT = localStorage.getItem("port");
const localPort = localStorage.getItem("localPort");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Función que captura la información del usuario y la almacena en el local storage
const getAllUser = async () => {
  const premium = "premium";

  try {
    const response = await fetch(`http://localhost:${PORT}/api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    usersProfile.push(...result.data);
    console.log(result.data);
    if (result.message !== "Usuarios enviados al cliente con éxito") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "No se pudo cargar la información de los usuarios",
        confirmButtonText: "Aceptar",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut",
        },
      });
    } else {
      showSpinner(usersProfile);
      renderAllUsersProfile();
    }

    return result;
  } catch (error) {
    console.log(error);
  }
};

console.log(usersProfile);

// Función que renderiza el perfil del usuario
function renderAllUsersProfile() {
  let html = "";
  html += `
    ${usersProfile.map((user) => {
      return `
        <div class="row container rounded bg-white w-50">
          <div class="col-md-4 border-right">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5">
              <div class="position-relative">
                <img class="rounded-circle" width="150px" height="150px" src="../img/user-avatar.png" />
              </div>
              <span class="font-weight-bold">${user.first_name} ${
        user.last_name
      }</span>
              <span class="text-black-50">${user.email}</span>
            </div>
            <div class="mb-5  text-center">
            <button
              type="submit"
              id="signup-button"
              class="btn btn-secondary profile-button"
            >
              Actualizar Role
            </button>
          </div>
          </div>
          <div class="col-md-7 border-right">
            <div class="p-3 py-5">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="text-right">Perfil</h4>
              </div>
              <div class="row mt-2">
                <div class="col-md-6">
                  <span class="text-underline mb-4" >
                   <u>Nombre</u>
                  </span>
                  <p class='text' >${user.first_name}</p>
                </div>
                <div class="col-md-6">
                  <span class="text-underline mb-4" >
                    <u>Apellido</u>
                  </span>
                  <p class='text' >${user.last_name}</p>
                </div>
              </div>
              <div class="row mt-2">
              <div class="col-md-12">
                <span class="text-underline mb-4" >
                 <u>Correo Electrónico</u>
                </span>
                <p class='text' >${user.email}</p>
              </div>
              <div class="col-md-12">
                <span class="text-underline mb-4" >
                  <u>Role</u>
                </span>
                <p class='text'>${capitalize(user.role)}</p>
              </div>
            </div>
            </div>
          </div>
        </div>
      `;
    })}
  `;

  profileContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", getAllUser);

// Función que redirige al usuario a la página de productos
const goToProducts = () => {
  window.location.href = `http://127.0.0.1:${localPort}/html/products.html`;
};
