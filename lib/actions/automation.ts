"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { runLacomerOrderForUser, type RunAutomationInput, type RunAutomationResult } from "@/lib/automation-core";
import { dispatchLacomerOrderWorkflow } from "@/lib/github-dispatch";

export type { RunAutomationInput, RunAutomationResult } from "@/lib/automation-core";

// Dispara el pedido automático en La Comer.
//
// - Fuera de Vercel (local, servidor propio): corre el navegador aquí mismo.
// - En Vercel (producción de la app web): no puede correr Playwright, así que en vez de fallar
//   dispara el workflow de GitHub Actions (ver .github/workflows/lacomer-order.yml), que sí
//   tiene un runner con navegador y accede a la misma base de datos. El resultado no es
//   inmediato: aparece en el Historial (AutomationLog) en cuanto el workflow termine.
//
// Importante: esta función NUNCA lanza (throw) — siempre regresa { success, message }. Next.js
// oculta el mensaje real de cualquier error lanzado dentro de una Server Action en producción,
// así que lanzar excepciones aquí dejaría al usuario viendo un error genérico en vez del mensaje
// explicativo.
export async function runLacomerOrder(input: RunAutomationInput): Promise<RunAutomationResult> {
  const userId = await requireUserId();

  if (process.env.VERCEL && process.env.LACOMER_DRY_RUN !== "true") {
    const dispatch = await dispatchLacomerOrderWorkflow(userId);
    revalidatePath("/lista-compra");
    return dispatch;
  }

  const result = await runLacomerOrderForUser(userId, input);
  revalidatePath("/lista-compra");
  revalidatePath("/pedidos");
  return result;
}

export async function listAutomationLogs() {
  const userId = await requireUserId();
  return prisma.automationLog.findMany({ where: { userId }, orderBy: { startedAt: "desc" }, take: 10 });
}
