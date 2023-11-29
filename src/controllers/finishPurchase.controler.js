import {
  ticketsService,
  cartService,
  productsService,
} from "../repository/index.js";
import CustomError from "../services/errors/CustomError.js";
import EErrors from "../services/errors/enum.js";
import { generateTicketErrorInfo } from "../services/errors/info.js";
import MailingService from "../services/mailing.js";

// Función para finalizar la compra
async function finishPurchase(req, res, next) {
  console.log(req.user);
  // Extraer los datos del cuerpo de la solicitud
  const { username, products, amountPurchase } = req.body;
  const { cid } = req.params;

  try {
    // Verificar si todos los datos necesarios están presentes
    if (!username || !amountPurchase || !products || !cid) {
      // Lanzar un error personalizado si faltan datos
      throwCustomError("Error de tipo de datos", EErrors.INVALID_TYPES_ERROR, [
        username,
        products,
        amountPurchase,
        cid,
      ]);
    }

    console.log(products);

    // Obtener el carrito de la base de datos
    const cart = await cartService.getOneCart(cid);

    // Verificar si el carrito existe
    if (cart.length === 0) {
      // Lanzar un error personalizado si el carrito no existe
      throwCustomError("Error de base de datos", EErrors.DATABASE_ERROR, cart);
    }

    // Filtrar los productos que no tienen suficiente stock
    const productWithOutStock = products.filter(
      (product) => product.product.stock < product.quantity
    );

    // Filtrar los productos que tienen suficiente stock
    const productWithStock = products.filter(
      (product) => product.product.stock >= product.quantity
    );

    // Calcular el total de la compra
    const totalPurchase = productWithStock.reduce(
      (acc, product) => acc + product.product.price * product.quantity * 0.85,
      0
    );

    // Actualizar el stock de los productos comprados
    await Promise.all(
      productWithStock.map(async (product) => {
        const newStock = product.product.stock - product.quantity;
        await productsService.updateOneProduct(product.product._id, {
          stock: newStock,
        });
      })
    );

    // Crear un nuevo ticket
    const newTicket = {
      code: Math.floor(Math.random() * 1000000),
      purchase_datetime: new Date().toLocaleString(),
      amount: totalPurchase.toFixed(2),
      purchaser: username,
    };

    // Guardar el ticket en la base de datos
    const ticket = await ticketsService.createOneTicket(newTicket);

    // Verificar si el ticket se guardó correctamente
    if (!ticket) {
      // Lanzar un error personalizado si el ticket no se guardó
      throwCustomError(
        "Error de base de datos",
        EErrors.DATABASE_ERROR,
        result
      );
    }

    // Registrar la compra exitosa
    req.logger.info(
      `Compra realizada con éxito ${new Date().toLocaleString()}`
    );

    // Actualizar el carrito con los productos que no se pudieron comprar
    cart.products =
      productWithOutStock.length === 0 ? [] : [...productWithOutStock];

    // Actualizar el carrito en la base de datos
    const result = await cartService.updateOneCart(cid, cart);

    // Crea una nueva instancia del servicio de correo
    const mailer = new MailingService();

    // Envía el correo de recuperación de contraseña
    try {
      console.log(productWithOutStock);
      await mailer.sendSimpleMail({
        from: "E-Store",
        to: req.user.user.username,
        subject: "Confirmación de Compra",
        html: `   
        <h1>Compra realizada con éxito</h1>
        <p>Estimado ${req.user.user.first_name},</p>
        <p>Le informamos que su compra se ha realizado con éxito.</p>
        <p>El total de su compra es de $${totalPurchase.toFixed(2)}.</p>
        <p>Los siguientes productos no se pudieron comprar:</p>
        <ul>
          ${productWithOutStock
            .map(
              (product) =>
                `<li>${product.product.title} - ${product.quantity}</li>`
            )
            .join("")}
        </ul>
        <p>Gracias por su compra.</p>
        <p>Atentamente,</p>
        <p>El equipo de E-Store</p>
        `,
      });
    } catch (error) {
      console.log(error);
    }

    // Enviar la respuesta
    res.json({
      message:
        productWithOutStock.length === 0
          ? "Compra realizada con éxito."
          : "Compra realizada con éxito. Los siguientes productos no se pudieron comprar",
      ticket: newTicket,
      products: productWithStock,
      remainingProducts: productWithOutStock,
    });
  } catch (error) {
    // Pasar el error al siguiente middleware
    next(error);
  }
}

// Funcion para lanzar errores personalizados
function throwCustomError(name, errorCode, cause) {
  req.logger.error(
    `${name}: Error al finalizar la compra ${new Date().toLocaleString()}`
  );
  CustomError.createError({
    name,
    cause: generateTicketErrorInfo(cause, errorCode),
    message: "Error al finalizar la compra",
    code: errorCode,
  });
  res.status(400).json({ message: "Error al finalizar la compra" });
}

// Exportar controlador
export default finishPurchase;
