//Variables globales
const usersProfile = [];
const userProfileForm = document.getElementById("user-profile-form");
const token = localStorage.getItem("token");
const PORT = localStorage.getItem("port");
const localPort = localStorage.getItem("localPort");

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
    usersProfile.push(result.data);
    if (result.message !== "Usuarios enviados al cliente con éxito") {
      Swal.fire({
        icon: "error",
        title: ''
      });
    }

    return result;
  } catch (error) {
    console.log(error);
  }
};

// Función que renderiza el perfil del usuario
function renderAllUsersProfile() {
  let html = "";

  html += `
    ${usersProfile.map((user) => {
      console.log(user);
      return `
        <div class="row">
          <div class="col-md-4 border-right">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5">
              <div class="position-relative">
              <img class="rounded-circle mt-5" width="150px" src="../img/user-avatar.svg" />
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
                >
                  <input type="file" class="form-control d-none" />
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              <span class="font-weight-bold">${user.first_name} ${user.last_name}</span>
              <span class="text-black-50">${user.email}</span>
              <span> </span>
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
                  <input type="text" class="form-control" value=${user.first_name} id='first_name' autocomplete="off" required/>
                </div>
                <div class="col-md-6">
                  <label class="labels" for="last_name">Apellido</label>
                  <input type="text" class="form-control" value=${user.last_name} id="last_name" autocomplete="off" required/>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })}
  `;

  userProfileForm.innerHTML = html;
}

document.addEventListener(
  "DOMContentLoaded",
  getAllUser,
  renderAllUsersProfile
);

// Función que redirige al usuario a la página de productos
const goToProducts = () => {
  window.location.href = `http://127.0.0.1:${localPort}/html/products.html`;
};
