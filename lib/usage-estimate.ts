import { prisma } from "@/lib/prisma";

const WINDOW_DAYS = 60;

// Tasa de consumo diaria por producto (unidades/día), a partir del historial del botón "Usar"
// en los últimos WINDOW_DAYS días. Útil sobre todo para cosas que se usan seguido y a ritmo
// más o menos constante (higiene personal, limpieza), pero funciona para cualquier producto.
export async function computeDailyUsageRates(): Promise<Map<string, number>> {
  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const events = await prisma.usageEvent.groupBy({
    by: ["productId"],
    where: { usedAt: { gte: since } },
    _sum: { quantity: true },
    _min: { usedAt: true },
  });

  const now = new Date();
  const rates = new Map<string, number>();

  for (const e of events) {
    const totalQty = e._sum.quantity ?? 0;
    const firstUse = e._min.usedAt ?? since;
    const elapsedDays = Math.max(1, (now.getTime() - firstUse.getTime()) / (1000 * 60 * 60 * 24));
    const rate = totalQty / elapsedDays;
    if (rate > 0) rates.set(e.productId, rate);
  }

  return rates;
}

export function estimateDaysRemaining(currentQty: number, dailyRate: number | undefined): number | null {
  if (!dailyRate || dailyRate <= 0) return null;
  return Math.round(currentQty / dailyRate);
}
