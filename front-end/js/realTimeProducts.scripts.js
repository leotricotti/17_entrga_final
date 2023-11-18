// Variables globales
let page = 1;
let counter = 0;
let fileCounter = 1;
const PORT = localStorage.getItem("port");
const userLocalData = JSON.parse(localStorage.getItem("user"));
const userName = userLocalData.email;
const userRoleInfo = userLocalData.role;

// Codigo que desabilita el chat para los administradores
document.addEventListener("DOMContentLoaded", () => {
  if (userRoleInfo === "admin") {
    document.getElementById("chat-section").classList.add("d-none");
  }
});

// Funcíon que genera codigos de productos aleatorios
function generateProductCode() {
  const code = Math.floor(Math.random() * 10000000);
  return code;
}

function createRandomCodeInput() {
  const getCodeInput = document.getElementById("code-container");
  getCodeInput.innerHTML = "";
  const label = document.createElement("label");
  label.setAttribute("for", "code");
  label.innerHTML = "Código de producto";
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("id", "code");
  input.setAttribute("class", "form-control");
  input.setAttribute("placeholder", "Código de producto");
  input.setAttribute("value", "");

  // Agrega los elementos creados al contenedor
  getCodeInput.appendChild(label);
  getCodeInput.appendChild(input);

  // Genera un codigo aleatorio y lo agrega al input
  const inputField = document.getElementById("code");
  inputField.addEventListener("click", () => {
    input.value = generateProductCode();
  });
}

// Codigo que crea el input al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
  createRandomCodeInput();
});

// Obtener el formulario de agregar producto
const form = document.getElementById("add-product-form");
form.addEventListener("submit", handleSubmit);

// Función que maneja la carga de la imagen del producto
async function manageProductImage() {
  const files = document.getElementById("thumbnail").files;
  const linkContainer = document.getElementById("link-container");

  if (formData.has("userProductImage")) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Ya has cargado un archivo. No puedes cargar más.",
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
    document.getElementById("thumbnail").value = "";
    return;
  }

  const file = files[0];
  formData.append("userProductImage", file);

  // Crear un enlace y una imagen para el archivo subido
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.target = "_blank";
  link.classList.add("link");
  link.href = url;
  link.textContent = "Ver imagen";
  linkContainer.appendChild(link);

  // Restablecer el mensaje del input de archivo a su valor original
  document.getElementById("thumbnail").value = "";
}

// Codigo que dispare el evento change del input de archivo
const userProductImage = document.getElementById("thumbnail");
userProductImage.addEventListener("change", function (e) {
  if (fileCounter < 1) {
    manageProductImage();
    fileCounter++;
    this.value = "";
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Solo puedes subir 3 imagenes!",
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
  }
});

// Función para manejar el envío del formulario de actualizar producto
async function handleUpdateProduct(
  id,
  title,
  description,
  code,
  price,
  stock,
  category
) {
  try {
    const product = {
      title: title,
      description: description,
      code: code,
      price: price,
      stock: stock,
      category: category,
    };

    const response = await fetch(
      `http://localhost:${PORT}/api/realTimeProducts/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: [JSON.stringify(product), formData],
      }
    );
    const result = await response.json();

    if (!result.message === "Producto actualizado con éxito") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal! Vuelve a intentarlo",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut",
        },
      });
    }

    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, actualizar producto!",
      cancelButtonText: "Cancelar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Producto actualizado con éxito!",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Aceptar",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__zoomOut",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            setTimeout(function () {
              window.location.reload();
            }, 500);
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
}

//Codigo los datos del producto y los muestre en el formulario
const getProductToUpdate = async (id) => {
  const updateProductForm = document.getElementById("update-product-container");

  const response = await fetch(
    `http://localhost:${PORT}/api/realTimeProducts/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  const result = await response.json();

  const product = result.product;

  updateProductForm.innerHTML = `
  <h3 class="text-center mt-5 mb-5 text-decoration-underline">
          Actualizar producto
        </h3>
        <form action="" class="form-container" id="update-product-form">
          <div class="mb-3">
            <label for="title" class="form-label"> Nombre del producto: </label>
            <input
              type="text"
              class="form-control"
              id="title"
              value = "${product.title}"
            />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label"> Descripción: </label>
            <textarea
              class="form-control"
              id="description"
              style="height: 80px"
            >${product.description}</textarea>
          </div>
          <div class="mb-3">
            <label for="code" class="form-label"> Código de producto: </label>
            <input
              type="text"
              class="form-control"
              id="code"
              value = "${product.code}"
            />
          </div>
          <div class="mb-3">
            <label for="price" class="form-label"> Precio: </label>
            <input
              type="number"
              class="form-control"
              id="price"
              value = "${product.price}"
            />
          </div>
          <div class="mb-3">
            <label for="stock" class="form-label"> Stock: </label>
            <input
              type="number"
              class="form-control"
              id="stock"
              value = "${product.stock}"
            />
          </div>
          <div class="mb-3">
            <label for="category" class="form-label"> Categoría: </label>
            <input
              type="text"
              class="form-control"
              id="category"
              value = "${product.category}"
            />
          </div>
          <div class="mb-3">
            <label for="thumbnail" class="form-label"> Imagen: </label>
            <input
              type="text"
              class="form-control"
              id="thumbnail"
              value = "${product.thumbnail[0]["img1"]}"
            />
          </div>
          <button type="submit" class="btn btn-primary" id="submit" >
            Actualizar 
          </button>
        </form>
  `;

  const updateProductData = document.getElementById("update-product-form");
  updateProductData.addEventListener("submit", (e) => {
    e.preventDefault();
    const { title, description, code, price, stock, category, thumbnail } =
      updateProductData.elements;
    handleUpdateProduct(
      product._id,
      title.value,
      description.value,
      code.value,
      price.value,
      stock.value,
      category.value
    );
  });

  window.scrollTo(0, 0);
};

// Función que maneja la creación de un producto
async function handleSubmit(e) {
  e.preventDefault();

  const { title, description, code, price, stock, category } = form.elements;
  if (
    !title.value ||
    !description.value ||
    !code.value ||
    !price.value ||
    !stock.value ||
    !category.value
  ) {
    return Swal.fire({
      icon: "error",
      title: "Lo siento...",
      text: "Todos los campos son necesarios!",
      focusConfirm: true,
      confirmButtonText: "Aceptar",
      showClass: {
        popup: "animate__animated animate__zoomIn",
      },
      hideClass: {
        popup: "animate__animated animate__zoomOut",
      },
    });
  } else {
    const product = {
      title: title.value,
      description: description.value,
      code: code.value,
      price: price.value,
      stock: stock.value,
      category: category.value,
      owner: userRoleInfo,
    };
    formData.append("newProduct", JSON.stringify(product));
    const response = await fetch(
      `http://localhost:${PORT}/api/realTimeProducts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (result.message !== "Producto creado con éxito") {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal! Vuelve a intentarlo",
        showConfirmButton: true,
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
        title: "Producto agregado con exito!",
        showConfirmButton: true,
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
  // Limpiar todos los campos del formulario
  for (let i = 0; i < form.elements.length; i++) {
    form.elements[i].value = "";
  }
  updateProductList();
}

const getProducts = async (page) => {
  try {
    const result = await fetch(
      `http://localhost:${PORT}/api/realTimeProducts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (result.status === 404) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal! Vuelve a intentarlo",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut",
        },
      });
    }

    const products = await result.json();
    showSpinner(products.products);

    return products;
  } catch (error) {
    console.log(error);
  }
};

const paginatedProducts = async (pages) => {
  const products = await getProducts();
  const reverseProducts = products.products.reverse();
  const productsPaginated = reverseProducts.splice(0, pages * 10);
  return productsPaginated;
};

// Función para agregar productos
const addProductBtn = () => {
  const btnAddProduct = document.getElementById("add-product-btn");
  if (page === 4) {
    btnAddProduct.classList.add("disabled");
  } else {
    page++;
  }
  updateProductList();
};

// Función que define que imagen mostrar en el producto
const renderProductImage = (product) => {
  const imageUrl = product.thumbnail[0]?.img1;
  if (
    imageUrl ===
    "https://freezedepot.com/wp-content/uploads/2023/05/producto-sin-imagen.png"
  ) {
    return `<img src="${imageUrl}" alt="img" width="150" class="thumbnail position-absolute me-5 mt-5 end-0 top-0">`;
  } else {
    const finalUrl = product.thumbnail[0]?.img1.split("public");
    return `<img src="http://localhost:${PORT}${finalUrl[1]}" alt="img" width="150" class="thumbnail position-absolute me-5 mt-5 end-0 top-0">`;
  }
};

// Función para actualizar la lista de productos
async function updateProductList() {
  const productList = document.getElementById("products-list");
  productList.innerHTML = "";
  try {
    const container = document.createElement("div");
    const products = await paginatedProducts(page);

    products.forEach((product) => {
      const item = document.createElement("div");
      item.classList.add("list-group-item");

      item.innerHTML = `
        <div class="d-flex w-100  justify-content-between flex-column">
          <h2 class="mb-1 subtitle">${product.title}</h2>
          <p class="mb-1"><strong>Descripción:</strong> ${
            product.description
          }</p>
          <p class="mb-1"><strong>Codigo:</strong> ${product.code}</p>
          <p class="mb-1"><strong>Precio:</strong> ${product.price}</p>
          <p class="mb-1"><strong>Status:</strong> ${product.status}</p>
          <p class="mb-1"><strong>Stock:</strong> ${product.stock}</p>
          <p class="mb-1"><strong>Categoria:</strong> ${product.category}</p>
        </div>
        ${renderProductImage(product)}  
        <button type="button" class="btn btn-primary update-product-btn" onclick="getProductToUpdate('${
          product._id
        }')">Actualizar</button>
        <button type="button" class="btn btn-primary delete-product-btn">Eliminar</button>
      `;

      const btnEliminar = item.querySelector(".delete-product-btn");
      btnEliminar.addEventListener("click", () => {
        eliminarProducto(product._id);
      });

      container.appendChild(item);
    });

    productList.appendChild(container);
    const deleteBtns = document.querySelectorAll(".delete-product-btn");
    const updateBtns = document.querySelectorAll(".update-product-btn");

    deleteBtns.forEach((btn, index) => {
      if (userRoleInfo === "premium" && products[index].owner === "premium") {
        btn.disabled = false;
      } else if (userRoleInfo === "admin") {
        btn.disabled = false;
      } else {
        btn.disabled = true;
      }
    });

    updateBtns.forEach((btn, index) => {
      if (userRoleInfo === "premium" && products[index].owner === "premium") {
        btn.disabled = false;
      } else if (userRoleInfo === "admin") {
        btn.disabled = false;
      } else {
        btn.disabled = true;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateProductList();
});

// Eliminar un producto de la lista de productos
function eliminarProducto(id) {
  Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    showClass: {
      popup: "animate__animated animate__zoomIn",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut",
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      const response = await fetch(
        `http://localhost:${PORT}/api/realTimeProducts/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        return Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Algo salió mal! Vuelve a intentarlo",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          showClass: {
            popup: "animate__animated animate__zoomIn",
          },
          hideClass: {
            popup: "animate__animated animate__zoomOut",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            setTimeout(function () {
              window.location.reload();
            }, 500);
          }
        });
      }

      Swal.fire({
        icon: "success",
        title: "Producto eliminado con exito!",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        showClass: {
          popup: "animate__animated animate__zoomIn",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          setTimeout(function () {
            window.location.reload();
          }, 500);
        }
      });
    }
  });
}
