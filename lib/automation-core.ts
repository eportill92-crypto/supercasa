import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { registerOrderForUser } from "@/lib/orders-core";
import type { OrderLineItem } from "@/lib/lacomer/automate";

export type RunAutomationInput = {
  items: { productId: string; quantity: number }[];
};

export type RunAutomationResult = {
  logId: string;
  success: boolean;
  message: string;
};

// Dispara el pedido automático en La Comer: login, agregar al carrito, checkout con pago
// contra entrega. Si LACOMER_DRY_RUN=true, simula el flujo sin abrir un navegador real (útil
// mientras los selectores reales de config.ts no estén verificados).
//
// Recibe el userId explícito (no lo lee de la sesión) para poder correrse tanto desde una
// Server Action (app web, con requireUserId()) como desde el robot de GitHub Actions, que no
// tiene una sesión HTTP — ahí itera usuarios y llama esto directo con cada userId.
//
// Nota de despliegue: Playwright necesita un proceso Node de larga duración. En Vercel
// serverless esto puede exceder el tiempo máximo de ejecución de una función; por eso el botón
// "Pedir en La Comer" en Vercel dispara el workflow de GitHub Actions en vez de llamar esto
// directo (ver lib/actions/automation.ts). Esta función solo corre el navegador cuando se
// invoca fuera de Vercel (local, servidor propio, o el runner de GitHub Actions).
//
// Importante: esta función NUNCA lanza (throw) — siempre regresa { success, message }. Next.js
// oculta el mensaje real de cualquier error lanzado dentro de una Server Action en producción
// (por seguridad, solo deja verlo en los logs del servidor), así que lanzar excepciones aquí
// dejaría al usuario viendo un error genérico de React en vez del mensaje explicativo.
export async function runLacomerOrderForUser(
  userId: string,
  input: RunAutomationInput
): Promise<RunAutomationResult> {
  try {
    const items = input.items.filter((i) => i.quantity > 0);
    if (items.length === 0) {
      return { logId: "", success: false, message: "No hay productos para pedir" };
    }

    if (process.env.VERCEL && process.env.LACOMER_DRY_RUN !== "true") {
      return {
        logId: "",
        success: false,
        message:
          'El robot de compra no puede correr en Vercel (no tiene el navegador instalado ni está pensado para procesos largos). Corre `npm run lacomer:order` en tu propia máquina/servidor, o registra el pedido manualmente con "Ya lo compré manualmente".',
      };
    }

    const [credential, address, products] = await Promise.all([
      prisma.credential.findUnique({ where: { userId } }),
      prisma.deliveryAddress.findFirst({ where: { userId, isDefault: true } }),
      prisma.product.findMany({ where: { userId, id: { in: items.map((i) => i.productId) } } }),
    ]);

    if (!credential) {
      return {
        logId: "",
        success: false,
        message: "Guarda tus credenciales de La Comer en Configuración primero",
      };
    }
    if (!address) {
      return {
        logId: "",
        success: false,
        message: "Guarda tu dirección de entrega en Configuración primero",
      };
    }

    const productById = new Map(products.map((p) => [p.id, p]));
    const missingProduct = items.find((i) => !productById.has(i.productId));
    if (missingProduct) {
      return {
        logId: "",
        success: false,
        message: `Producto no encontrado: ${missingProduct.productId}`,
      };
    }
    const lineItems: OrderLineItem[] = items.map((i) => {
      const product = productById.get(i.productId)!;
      return {
        productId: product.id,
        name: product.name,
        quantity: i.quantity,
        lacomerUrl: product.lacomerUrl,
      };
    });

    const log = await prisma.automationLog.create({
      data: { userId, status: "running", message: "Iniciando automatización" },
    });

    const email = decrypt(credential.emailEnc);
    const password = decrypt(credential.passwordEnc);
    const dryRun = process.env.LACOMER_DRY_RUN === "true";

    const { runLacomerOrder: run, runLacomerOrderDryRun: runDry } = await import(
      "@/lib/lacomer/automate"
    );
    const runner = dryRun ? runDry : run;

    const result = await runner({
      email,
      password,
      items: lineItems,
      address: {
        street: address.street,
        extNumber: address.extNumber,
        intNumber: address.intNumber,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip: address.zip,
        phone: address.phone,
      },
      headful: process.env.LACOMER_HEADFUL === "true",
      onStep: async (step) => {
        await prisma.automationLog.update({
          where: { id: log.id },
          data: { message: `${step.ok ? "✔" : "✖"} ${step.step}${step.detail ? `: ${step.detail}` : ""}` },
        });
      },
    });

    if (result.success) {
      const notes = [
        dryRun ? "Pedido simulado (LACOMER_DRY_RUN=true)" : null,
        result.deliverySlotText,
        "Pago: contra entrega (efectivo o tarjeta al recibir).",
      ]
        .filter(Boolean)
        .join(" — ");
      const order = await registerOrderForUser(userId, {
        items: lineItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        source: "automatico",
        notes: notes || undefined,
      });
      const successMessage =
        "Pedido completado con éxito." +
        (result.deliverySlotText ? ` ${result.deliverySlotText}` : "") +
        " Pago contra entrega (efectivo o tarjeta al recibir).";
      await prisma.automationLog.update({
        where: { id: log.id },
        data: {
          status: "success",
          finishedAt: new Date(),
          message: successMessage + (dryRun ? " (simulado)" : ""),
          orderId: order.id,
          screenshotPath: result.screenshotPaths.at(-1),
        },
      });
      return { logId: log.id, success: true, message: successMessage };
    }

    await prisma.automationLog.update({
      where: { id: log.id },
      data: { status: "error", finishedAt: new Date(), message: result.errorMessage ?? "Error desconocido" },
    });
    return {
      logId: log.id,
      success: false,
      message: `Falló la automatización: ${result.errorMessage}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { logId: "", success: false, message: `Error inesperado: ${message}` };
  }
}
