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

export const LACOMER_BASE_URL = "https://www.lacomer.com.mx";

export const selectors = {
  login: {
    // Botón/enlace en el header que abre el login (modal o página nueva).
    openLoginButton: 'text=Iniciar sesión',
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
