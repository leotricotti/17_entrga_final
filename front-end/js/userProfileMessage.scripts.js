// Variables
const loadUserProfile = [JSON.parse(localStorage.getItem("user"))];

// Función que muestra un mensage si el usuario aún no completó su perfil
const showIncompleteProfileMessage = () => {
  Swal.fire({
    icon: "warning",
    title: "¡Perfil incompleto!",
    text: "Por favor, complete su perfil para poder acceder al los beneficios de ser Premium.",
    confirmButtonText: "Completar perfil",
    confirmButtonColor: "#3085d6",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#d33",
    showClass: {
      popup: "animate__animated animate__zoomIn",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      goToUserProfile();
    }
  });
};

// Funcion que verifica si el perfil de usuario está completo
const checkUserProfile = () => {
  if (
    loadUserProfile[0].phone_number === "" ||
    loadUserProfile[0].home_address == "" ||
    loadUserProfile[0].city == "" ||
    loadUserProfile[0].state == "" ||
    loadUserProfile[0].zip_code == ""
  ) {
    showIncompleteProfileMessage();
  } else {
    return;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    checkUserProfile();
  }, 2500);
});
