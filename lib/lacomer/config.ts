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
export const LACOMER_BASE_URL = "https://www.lacomer.com.mx/lacomer/#!/home?succId=287&succFmt=100";

export const selectors = {
  login: {
    // Verificado contra el sitio real (2026-09-02): enlace "Ingresa" en el header,
    // <a id="lnkLogin" href="#!/login">. Solo aparece cuando NO hay sesión (ng-if="clieId <= 0").
    openLoginButton: "#lnkLogin",
    emailInput: 'input[type="email"], input[name="email"]',
    passwordInput: 'input[type="password"], input[name="password"]',
    submitButton: 'button[type="submit"]',
    // Algo que solo aparece cuando ya iniciaste sesión (para confirmar login exitoso).
    loggedInIndicator: 'text=Mi cuenta',
  },
  search: {
    searchInput: 'input[type="search"], input[placeholder*="Buscar" i]',
    resultCard: '[data-testid="product-card"], .product-card',
    resultTitle: '.product-card__title, [data-testid="product-title"]',
    resultAddToCartButton: 'button:has-text("Agregar")',
  },
  product: {
    // Si navegamos directo a la URL guardada del producto (Product.lacomerUrl) en vez de buscar.
    addToCartButton: 'button:has-text("Agregar al carrito")',
    quantityInput: 'input[name="quantity"]',
  },
  cart: {
    cartIcon: '[aria-label="Carrito"], [data-testid="cart-icon"]',
    checkoutButton: 'text=Proceder al pago',
  },
  checkout: {
    addressStepConfirmButton: 'text=Confirmar dirección',
    paymentMethodCashOnDelivery: 'text=Pago contra entrega',
    placeOrderButton: 'text=Confirmar pedido',
    orderConfirmedIndicator: 'text=Pedido confirmado',
  },
};

export const TIMEOUTS = {
  navigation: 30_000,
  action: 15_000,
};
