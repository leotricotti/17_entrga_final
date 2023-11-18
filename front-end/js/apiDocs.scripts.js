async function getDocumentation() {
  const token = localStorage.getItem("token");
  const PORT = localStorage.getItem("port");

  const response = await fetch(`http://localhost:${PORT}/api/docs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 200) {
    window.location.href = response.url;
  } else if (response.status === 401) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No se pudo autenticar al usuario",
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
      icon: "error",
      title: "Oops...",
      text: "No se pudo obtener la documentación",
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
  }
}
