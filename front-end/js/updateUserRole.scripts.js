// Función para actualizar el rol del usuario
async function updateUserRole(newRoleData) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const userId = user.email;
  const PORT = localStorage.getItem("port");

  const response = await fetch(
    `http://localhost:${PORT}/api/users/premium/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: newRoleData,
      }),
    }
  );
  const result = await response.json();

  if (!result.message === "Rol actualizado con exito") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No se pudo actualizar el rol",
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
  } else {
    Swal.fire({
      icon: "success",
      title: "¡Felicitaciones!",
      text: "Bienvenido a la comunidad Premium",
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        userData.role = newRoleData;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    });
  }
}
