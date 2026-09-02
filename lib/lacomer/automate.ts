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

    await checkout(page, opts.address);
    await screenshot(page, opts.screenshotDir, "03-checkout", screenshotPaths, async () => {});
    await record({ step: "checkout_pago_contra_entrega", ok: true });

    return { success: true, steps, screenshotPaths };
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

async function checkout(page: Page, _address: DeliveryAddressInput) {
  await page.click(selectors.cart.cartIcon);
  await page.click(selectors.cart.checkoutButton);

  // La dirección normalmente ya está guardada en la cuenta de La Comer; aquí solo se confirma.
  // Si el checkout requiere llenar campos de dirección manualmente, esos selectores hacen falta
  // en config.ts, y aquí hay que usar los campos de `_address` para llenarlos.
  await page.click(selectors.checkout.addressStepConfirmButton);
  await page.click(selectors.checkout.paymentMethodCashOnDelivery);
  await page.click(selectors.checkout.placeOrderButton);
  await page.waitForSelector(selectors.checkout.orderConfirmedIndicator, {
    timeout: TIMEOUTS.navigation,
  });
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
  await record({ step: "checkout_pago_contra_entrega (simulado)", ok: true });

  return { success: true, steps, screenshotPaths: [] };
}
