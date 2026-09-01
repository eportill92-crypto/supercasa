"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { registerOrder } from "@/lib/actions/orders";
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
export async function runLacomerOrder(input: RunAutomationInput): Promise<RunAutomationResult> {
  const items = input.items.filter((i) => i.quantity > 0);
  if (items.length === 0) throw new Error("No hay productos para pedir");

  // En Vercel no se descargó el navegador de Playwright a propósito (build más rápido y
  // liviano) y las funciones serverless no están pensadas para procesos tan largos, así que
  // el robot de compra no puede correr ahí. Falla con un mensaje claro en vez de un error de
  // módulo confuso; usa `npm run lacomer:order` en tu propia máquina/servidor, o activa
  // LACOMER_DRY_RUN=true para probar el resto del flujo sin abrir un navegador real.
  if (process.env.VERCEL && process.env.LACOMER_DRY_RUN !== "true") {
    throw new Error(
      "El robot de compra no puede correr en Vercel (no tiene el navegador instalado ni está pensado para procesos largos). Corre `npm run lacomer:order` en tu propia máquina/servidor, o registra el pedido manualmente con \"Ya lo compré manualmente\"."
    );
  }

  const [credential, address, products] = await Promise.all([
    prisma.credential.findUnique({ where: { provider: "lacomer" } }),
    prisma.deliveryAddress.findFirst({ where: { isDefault: true } }),
    prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } }),
  ]);

  if (!credential) throw new Error("Guarda tus credenciales de La Comer en Configuración primero");
  if (!address) throw new Error("Guarda tu dirección de entrega en Configuración primero");

  const productById = new Map(products.map((p) => [p.id, p]));
  const lineItems: OrderLineItem[] = items.map((i) => {
    const product = productById.get(i.productId);
    if (!product) throw new Error(`Producto no encontrado: ${i.productId}`);
    return {
      productId: product.id,
      name: product.name,
      quantity: i.quantity,
      lacomerUrl: product.lacomerUrl,
    };
  });

  const log = await prisma.automationLog.create({
    data: { status: "running", message: "Iniciando automatización" },
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
}

export async function listAutomationLogs() {
  return prisma.automationLog.findMany({ orderBy: { startedAt: "desc" }, take: 10 });
}
