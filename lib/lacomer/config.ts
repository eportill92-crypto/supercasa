// Configuración de la automatización de lacomer.com.mx.
//
// ⚠️ IMPORTANTE: los selectores de abajo son PLACEHOLDERS SIN VERIFICAR.
// En este entorno de desarrollo, el acceso de red a www.lacomer.com.mx está bloqueado por
// política del sandbox, así que no fue posible abrir el sitio real y confirmar los selectores
// exactos (ids, names, data-testid, texto de botones, etc.).
//
// Antes de usar la automatización en serio:
//   1. Corre `npm run lacomer:explore` en tu propia máquina (con internet real) — abre
//      lacomer.com.mx paso a paso y te imprime candidatos de selectores para cada campo.
//   2. Reemplaza los valores de este archivo con lo que encuentres.
//   3. Prueba primero con LACOMER_HEADFUL=true para ver el navegador y confirmar visualmente
//      cada paso antes de dejarlo correr desatendido.
//
// Los sitios grandes de e-commerce cambian su HTML seguido y algunos usan protección
// anti-bot (Cloudflare, PerimeterX, etc.) que puede requerir ajustes adicionales.

// El sitio necesita un identificador de sucursal/formato en la URL (succId/succFmt) — sin
// esto, redirige a succId=0&succFmt=0 y el sitio responde con una página de error
// ("LaComer-400-APP"). Normalmente el sitio lo recuerda por cookie/localStorage según tu
// ubicación; en un navegador nuevo (como el que abre Playwright) no hay nada guardado.
// TODO: esto es la sucursal de una sola cuenta de prueba — antes de usarlo con más usuarios,
// hay que decidir cómo elegir la sucursal correcta para cada quien (¿desde su código postal
// guardado en DeliveryAddress? ¿dejando que el flujo de login la seleccione solo?).
// Nota (2026-09-02): al iniciar sesión, el sitio redirige solo a la sucursal guardada en la
// cuenta (ej. succId=14 "La Comer Lomas Anáhuac" en vez del succId=287 con el que arrancamos) —
// así que este succId inicial probablemente solo importa antes de loguearse.
export const LACOMER_BASE_URL = "https://www.lacomer.com.mx/lacomer/#!/home?succId=287&succFmt=100";

export const selectors = {
  login: {
    // Verificado contra el sitio real (2026-09-02): enlace "Ingresa" en el header,
    // <a id="lnkLogin" href="#!/login">. Solo aparece cuando NO hay sesión (ng-if="clieId <= 0").
    openLoginButton: "#lnkLogin",
    // El formulario de login vive dentro de un contenedor con id="login-form". Confirmado que
    // el correo/contraseña son input[type=email]/input[type=password] normales ahí adentro.
    emailInput: '#login-form input[type="email"]',
    passwordInput: '#login-form input[type="password"]',
    // El botón "Entrar" es un <a class="btn btn_orange" ...> (no un <button>), confirmado por
    // las reglas CSS que le aplican (#login-form .btn_orange, #login-form .btn, #login-form a).
    submitButton: "#login-form .btn_orange",
    // Verificado (2026-09-02): tras un login exitoso el header muestra "Hola: <nombre>" y
    // "Mi cuenta ▾" en vez del enlace "Ingresa".
    loggedInIndicator: "text=Mi cuenta",
  },
  search: {
    // Placeholder real: "Busca uno o más productos, separándolos por coma".
    searchInput: 'input[placeholder*="Busca" i]',
    // Verificado (2026-09-02): cada tarjeta de resultado es un <li class="li_prod li_mosaic ...">.
    resultCard: ".li_prod",
    // Verificado (2026-09-02): tanto el campo de cantidad como el botón de agregar usan el
    // código de barras del producto en su id (pediCant_{codigoBarras} / btn_addtoCart_{...}),
    // así que se buscan por atributo/clase en vez del id exacto (variable por producto).
    quantityInput: 'input[id^="pediCant_"]',
    // <button ng-add-cart id="btn_addtoCart_{codigoBarras}" title="Agregar a carrito">.
    resultAddToCartButton: "[ng-add-cart]",
  },
  product: {
    // Si navegamos directo a la URL guardada del producto (Product.lacomerUrl) en vez de buscar.
    // Mismo patrón que search: id="btn_addtoCart_{codigoBarras}" / id="pediCant_{codigoBarras}".
    addToCartButton: "[ng-add-cart]",
    quantityInput: 'input[id^="pediCant_"]',
  },
  cart: {
    // Verificado (2026-09-02): <img id="carritoH" alt="Mi carrito"> en el header.
    cartIcon: "#carritoH",
    // Verificado (2026-09-02): el carrito NO tiene un botón genérico "Proceder al pago" — al
    // final hay dos botones, "Entrega a domicilio" / "Recoger en tienda". Usamos el primero.
    checkoutButton: "text=Entrega a domicilio",
  },
  checkout: {
    // Verificado (2026-09-02): el checkout real es un wizard de 5 pasos — Revisar pedido →
    // Dirección → Horario → Pago → Detalle — con ESTE MISMO botón "Continuar" para avanzar en
    // cada paso (no hay un botón único de "Confirmar pedido" al final de un solo paso).
    continueButton: "#btnDesktopContinuar",
    // TODO: pendiente verificar cada paso individual (selección de dirección guardada, horario
    // de entrega, método de pago, confirmación final) — placeholders sin confirmar todavía.
    addressStepConfirmButton: "text=Confirmar dirección",
    paymentMethodCashOnDelivery: "text=Pago contra entrega",
    placeOrderButton: "text=Confirmar pedido",
    orderConfirmedIndicator: "text=Pedido confirmado",
  },
};

export const TIMEOUTS = {
  navigation: 30_000,
  action: 15_000,
};
