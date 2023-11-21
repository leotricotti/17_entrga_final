// Ultima desconexión
const lastConnection = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user.email;

  const response = await fetch(
    `http://localhost:${PORT}/api/sessions/lastConnection`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        username: username,
        action: "logout",
      }),
    }
  );
};

//Cerrar sesión
const logout = () => {
  // Puerto local
  const localPort = localStorage.getItem("localPort");

  Swal.fire({
    title: "¿Estás seguro que deseas cerrar sesión?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: `Cerrar sesión`,
    denyButtonText: `Cancelar`,
    showClass: {
      popup: "animate__animated animate__zoomIn",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Gracias por utilizar nuestros servicios",
        showConfirmButton: true,
        confirmButtonText: `Aceptar`,
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut",
        },
      });
      setTimeout(() => {
        lastConnection();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("currentPage", 1);
        localStorage.removeItem("usersDeleted");
        window.location.href = `http://127.0.0.1:${localPort}/html/index.html`;
      }, 2000);
    }
  });
};
