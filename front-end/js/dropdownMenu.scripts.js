//Capturar elementos del DOM
const dropdownMenu = document.getElementById("dropdown-menu");

// Capturar el rol del usuario
const userData = JSON.parse(localStorage.getItem("user"));
let userRoleData = userData.role;

// Función que redirige al perfil del usuario
const goToUserProfile = () => {
  const localPort = localStorage.getItem("localPort");
  window.location.href = `http://127.0.0.1:${localPort}/html/userProfile.html`;
};

// Función que redirige al perfil de todos los usuarios
const goToAllUsersProfile = () => {
  const localPort = localStorage.getItem("localPort");
  window.location.href = `http://127.0.0.1:${localPort}/html/allUsers.html`;
};

// Función que redirige a la documentación de la API
const gotToRealTimeProducts = () => {
  const localPort = localStorage.getItem("localPort");
  window.location.href = `http://127.0.0.1:${localPort}/html/realTimeProducts.html`;
};

// Función para renderizar el botón de cambio de rol
const renderDropdownMenu = () => {
  let html = "";
  if (
    userRoleData === "premium" &&
    window.location.pathname === "/html/realTimeProducts.html"
  ) {
    html = `
    <li>
      <button class="btn dropdown-item" onclick="goToUserProfile()">
        <i class="fa-solid fa-user"></i>
        Perfil de usuario
      </button>
    </li>
      <li>
      <a href="products.html" class="btn dropdown-item">
        <i class="fa-brands fa-product-hunt"></i>
        Products Page
      </a>
    </li>
    <div class="dropdown-divider"></div>
    <li>
    <button class="btn dropdown-item" onclick="logout()">
        <i class="fas fa-sign-out-alt fa-fw"></i>
        Cerrar sesión
      </button>
    </li>
  `;
  } else if (
    userRoleData === "user" &&
    window.location.pathname === "/html/userProfile.html"
  ) {
    html = `
    <li>
      <a href="products.html" class="btn dropdown-item">
        <i class="fa-brands fa-product-hunt"></i>
        Products Page
      </a>
    </li>
    <div class="dropdown-divider"></div>
    <li>
    <button class="btn dropdown-item" onclick="logout()">
        <i class="fas fa-sign-out-alt fa-fw"></i>
        Cerrar sesión
      </button>
    </li>
  `;
  } else if (
    (userRoleData === "premium" &&
      window.location.pathname === "/html/products.html") ||
    (userRoleData === "premium" &&
      window.location.pathname === "/html/cart.html") ||
    (userRoleData === "premium" &&
      window.location.pathname === "/html/userProfile.html")
  ) {
    html = `
    <li>
      <button class="btn dropdown-item" onclick="goToUserProfile()">
        <i class="fa-solid fa-user"></i>
        Perfil de usuario
      </button>
    </li>
      <li>
      <a href="realTimeProducts.html" class="btn dropdown-item">
      <i class="fa-solid fa-sliders"></i>
        Admin Panel
      </a>
    </li>
    <div class="dropdown-divider"></div>
    <li>
    <button class="btn dropdown-item" onclick="logout()">
        <i class="fas fa-sign-out-alt fa-fw"></i>
        Cerrar sesión
      </button>
    </li>
  `;
  } else if (
    userRoleData === "admin" &&
    window.location.pathname === "/html/realTimeProducts.html"
  ) {
    html = `
    <li>
    <button class="btn dropdown-item" onclick="goToAllUsersProfile()">
    <i class="fa-solid fa-user"></i>
       Users Profile 
     </button>
     <button class="btn dropdown-item" onclick="getDocumentation()">
     <i class="fa-solid fa-file"></i>
        API Documentation  
      </button>
   </li>
   <div class="dropdown-divider"></div>
    <li>
    <button class="btn dropdown-item" onclick="logout()">
       <i class="fas fa-sign-out-alt fa-fw"></i>
       Cerrar sesión
     </button>
   </li>
  `;
  } else if (
    userRoleData === "admin" &&
    window.location.pathname === "/html/allUsers.html"
  ) {
    html = `
    <li>
    <button class="btn dropdown-item" onclick="goToAllUsersProfile()">
    <i class="fa-solid fa-user-minus"></i>
       Delete Users 
     </button>
    <button class="btn dropdown-item" onclick="gotToRealTimeProducts()">
    <i class="fa-brands fa-product-hunt"></i>
       Real Time Products 
     </button>
     <button class="btn dropdown-item" onclick="getDocumentation()">
     <i class="fa-solid fa-file"></i>
        API Documentation  
      </button>
   </li>
   <div class="dropdown-divider"></div>
    <li>
    <button class="btn dropdown-item" onclick="logout()">
       <i class="fas fa-sign-out-alt fa-fw"></i>
       Cerrar sesión
     </button>
   </li>
  `;
  } else {
    html = `
    <li>
      <button class="btn dropdown-item" onclick="goToUserProfile()">
        <i class="fa-solid fa-user"></i>
        Perfil de usuario
      </button>
    </li>
    <div class="dropdown-divider"></div>
    <li>
      <button class="btn dropdown-item" onclick="logout()">
        <i class="fas fa-sign-out-alt fa-fw"></i>
        Cerrar sesión
      </button>
    </li>
  `;
  }
  dropdownMenu.innerHTML = html;
};

// Evento para renderizar el botón de cambio de rol
window.addEventListener("load", () => {
  renderDropdownMenu();
});
