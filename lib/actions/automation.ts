"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { registerOrder } from "@/lib/actions/orders";
import { requireUserId } from "@/lib/session";
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
// Nota de despliegue: Playwright necesita un proceso Node de larga duración. En Vercel
// serverless esto puede exceder el tiempo máximo de ejecución de una función; para uso real
// se recomienda correr esto en un servidor propio, un contenedor, o vía `npm run lacomer:order`
// (scripts/run-order.ts) desde un cron/GitHub Action con acceso a la base de datos.
//
// Importante: esta función NUNCA lanza (throw) — siempre regresa { success, message }. Next.js
// oculta el mensaje real de cualquier error lanzado dentro de una Server Action en producción
// (por seguridad, solo deja verlo en los logs del servidor), así que lanzar excepciones aquí
// dejaría al usuario viendo un error genérico de React en vez del mensaje explicativo.
export async function runLacomerOrder(input: RunAutomationInput): Promise<RunAutomationResult> {
  try {
    const userId = await requireUserId();
    const items = input.items.filter((i) => i.quantity > 0);
    if (items.length === 0) {
      return { logId: "", success: false, message: "No hay productos para pedir" };
    }

    // En Vercel no se descargó el navegador de Playwright a propósito (build más rápido y
    // liviano) y las funciones serverless no están pensadas para procesos tan largos, así que
    // el robot de compra no puede correr ahí. Usa `npm run lacomer:order` en tu propia
    // máquina/servidor, o activa LACOMER_DRY_RUN=true para probar el resto del flujo sin abrir
    // un navegador real.
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
      const order = await registerOrder({
        items: lineItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        source: "automatico",
        notes: dryRun ? "Pedido simulado (LACOMER_DRY_RUN=true)" : undefined,
      });
      await prisma.automationLog.update({
        where: { id: log.id },
        data: {
          status: "success",
          finishedAt: new Date(),
          message: "Pedido completado" + (dryRun ? " (simulado)" : ""),
          orderId: order.id,
          screenshotPath: result.screenshotPaths.at(-1),
        },
      });
      revalidatePath("/lista-compra");
      revalidatePath("/pedidos");
      return { logId: log.id, success: true, message: "Pedido completado con éxito." };
    }

    await prisma.automationLog.update({
      where: { id: log.id },
      data: { status: "error", finishedAt: new Date(), message: result.errorMessage ?? "Error desconocido" },
    });
    revalidatePath("/lista-compra");
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

export async function listAutomationLogs() {
  const userId = await requireUserId();
  return prisma.automationLog.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 10 });
}
