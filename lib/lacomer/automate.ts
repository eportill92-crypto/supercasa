import { chromium, type Browser, type Page } from "playwright";
import { LACOMER_BASE_URL, selectors, TIMEOUTS } from "./config";

export type OrderLineItem = {
  productId: string;
  name: string;
  quantity: number;
  lacomerUrl?: string | null;
};

export type DeliveryAddressInput = {
  street: string;
  extNumber?: string | null;
  intNumber?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zip: string;
  phone?: string | null;
};

export type AutomationStep = { step: string; ok: boolean; detail?: string };

export type AutomationResult = {
  success: boolean;
  steps: AutomationStep[];
  screenshotPaths: string[];
  errorMessage?: string;
  // Texto tal cual lo muestra el sitio (ej. "Tu elección: miércoles 02 de septiembre de 2026.
  // De 08:00 a 09:00 hrs. $0.00.") para poder avisarle al usuario qué horario de entrega quedó.
  deliverySlotText?: string;
};

export type RunOrderOptions = {
  email: string;
  password: string;
  items: OrderLineItem[];
  address: DeliveryAddressInput;
  headful?: boolean;
  screenshotDir?: string;
  onStep?: (step: AutomationStep) => void | Promise<void>;
};

// Corre el flujo completo: login -> buscar/agregar cada producto -> checkout con pago
// contra entrega. Ver lib/lacomer/config.ts: los selectores son placeholders hasta que se
// verifiquen contra el sitio real (bloqueado en este entorno de desarrollo).
export async function runLacomerOrder(opts: RunOrderOptions): Promise<AutomationResult> {
  const steps: AutomationStep[] = [];
  const screenshotPaths: string[] = [];
  let browser: Browser | undefined;

  const record = async (step: AutomationStep) => {
    steps.push(step);
    await opts.onStep?.(step);
  };

  try {
    browser = await chromium.launch({ headless: !opts.headful });
    const page = await browser.newPage();
    page.setDefaultTimeout(TIMEOUTS.action);
    page.setDefaultNavigationTimeout(TIMEOUTS.navigation);

    await screenshot(page, opts.screenshotDir, "00-home", screenshotPaths, async () => {
      await page.goto(LACOMER_BASE_URL, { waitUntil: "domcontentloaded" });
    });
    await record({ step: "abrir_sitio", ok: true });

    await login(page, opts.email, opts.password);
    await screenshot(page, opts.screenshotDir, "01-login", screenshotPaths, async () => {});
    await record({ step: "login", ok: true });

    for (const item of opts.items) {
      await addItemToCart(page, item);
      await record({ step: `agregar_carrito:${item.name}`, ok: true });
    }
    await screenshot(page, opts.screenshotDir, "02-carrito", screenshotPaths, async () => {});

    const { deliverySlotText } = await checkout(page, opts.address);
    await screenshot(page, opts.screenshotDir, "03-checkout", screenshotPaths, async () => {});
    await record({
      step: "checkout_pago_contra_entrega",
      ok: true,
      detail: deliverySlotText,
    });

    return { success: true, steps, screenshotPaths, deliverySlotText };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await record({ step: "error", ok: false, detail: message });
    return { success: false, steps, screenshotPaths, errorMessage: message };
  } finally {
    await browser?.close();
  }
}

async function login(page: Page, email: string, password: string) {
  await page.click(selectors.login.openLoginButton);
  await page.fill(selectors.login.emailInput, email);
  await page.fill(selectors.login.passwordInput, password);
  await page.click(selectors.login.submitButton);
  await page.waitForSelector(selectors.login.loggedInIndicator, {
    timeout: TIMEOUTS.navigation,
  });
}

async function addItemToCart(page: Page, item: OrderLineItem) {
  if (item.lacomerUrl) {
    await page.goto(item.lacomerUrl, { waitUntil: "domcontentloaded" });
    if (item.quantity !== 1) {
      await page.fill(selectors.product.quantityInput, String(item.quantity));
    }
    await page.click(selectors.product.addToCartButton);
    return;
  }

  await page.fill(selectors.search.searchInput, item.name);
  await page.keyboard.press("Enter");
  await page.waitForSelector(selectors.search.resultCard, { timeout: TIMEOUTS.navigation });
  const firstCard = page.locator(selectors.search.resultCard).first();
  if (item.quantity !== 1) {
    await firstCard.locator(selectors.search.quantityInput).fill(String(item.quantity));
  }
  await firstCard.locator(selectors.search.resultAddToCartButton).click();
}

// El checkout real de lacomer.com.mx es un wizard de 5 pasos (Revisar pedido → Dirección →
// Horario → Pago → Detalle), todos con el mismo botón "Continuar" para avanzar. La dirección
// ya debe estar guardada en la cuenta de antemano (ver README: es un requisito previo manual,
// no algo que este robot registre solo — el alta de una dirección nueva pide un código de
// verificación por correo/SMS que un robot no puede leer).
async function checkout(
  page: Page,
  _address: DeliveryAddressInput
): Promise<{ deliverySlotText?: string }> {
  await page.click(selectors.cart.cartIcon);
  await page.click(selectors.cart.checkoutButton);

  // Modal "¿Deseas agregar algo más al carrito?" — siempre "NO" (ya se agregaron todos los
  // productos del pedido).
  await page.click(selectors.cart.declineAddMoreItemsButton);

  // Paso 1: Revisar pedido — nada que llenar, solo avanzar.
  await page.click(selectors.checkout.continueButton);

  // Paso 2: Dirección — ya viene seleccionada la guardada en la cuenta; solo hay que responder
  // que no se quiere una llamada de consulta.
  await page.click(selectors.checkout.declineConsultationCallButton);
  await page.click(selectors.checkout.continueButton);

  // Paso 3: Horario — elige automáticamente el primer horario de entrega disponible. Al
  // elegirlo aparece un aviso de "precio vigente el día de entrega" que hay que aceptar, y
  // justo debajo queda un resumen en texto ("Tu elección: ...") que capturamos para avisarle
  // al usuario qué horario quedó.
  await page.locator(selectors.checkout.firstAvailableDeliverySlot).first().click();
  await page.click(selectors.checkout.acceptDeliveryPriceNoticeButton);
  const deliverySlotText = await page
    .locator(selectors.checkout.deliverySlotSummary)
    .first()
    .textContent()
    .then((t) => t?.trim())
    .catch(() => undefined);
  await page.click(selectors.checkout.continueButton);

  // Modal opcional "¿Vas a dejar ir tus beneficios?" (promoción de Monedero Naranja) — solo
  // aparece si la cuenta no lo tiene registrado, así que se ignora si no sale a tiempo.
  await page
    .locator(selectors.checkout.skipMonederoNaranjaPromptButton)
    .click({ timeout: 3_000 })
    .catch(() => undefined);

  // Paso 4: Pago — contra entrega, nunca tarjeta.
  await page.click(selectors.checkout.paymentMethodCashOnDelivery);
  await page.click(selectors.checkout.continueButton);

  // Paso 5: Detalle — confirmación final del pedido.
  await page.click(selectors.checkout.placeOrderButton);
  await page.waitForSelector(selectors.checkout.orderConfirmedIndicator, {
    timeout: TIMEOUTS.navigation,
  });

  return { deliverySlotText: deliverySlotText || undefined };
}

async function screenshot(
  page: Page,
  dir: string | undefined,
  name: string,
  collector: string[],
  before: () => Promise<void>
) {
  await before();
  if (!dir) return;
  const fs = await import("fs/promises");
  const path = await import("path");
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${name}.png`);
  await page.screenshot({ path: filePath }).catch(() => undefined);
  collector.push(filePath);
}

// Modo simulación: no abre ningún navegador ni toca la red. Sirve para probar el resto del
// flujo (server action -> AutomationLog -> UI) sin depender de selectores reales todavía.
export async function runLacomerOrderDryRun(opts: RunOrderOptions): Promise<AutomationResult> {
  const steps: AutomationStep[] = [];
  const record = async (step: AutomationStep) => {
    steps.push(step);
    await opts.onStep?.(step);
  };

  await record({ step: "abrir_sitio (simulado)", ok: true });
  await record({ step: "login (simulado)", ok: true });
  for (const item of opts.items) {
    await record({ step: `agregar_carrito:${item.name} (simulado)`, ok: true });
  }
  const deliverySlotText = "Tu elección: mañana. De 08:00 a 09:00 hrs. $0.00. (simulado)";
  await record({ step: "checkout_pago_contra_entrega (simulado)", ok: true, detail: deliverySlotText });

  return { success: true, steps, screenshotPaths: [], deliverySlotText };
}
