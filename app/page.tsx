export const dynamic = "force-dynamic";

import Link from "next/link";
import { listPantry } from "@/lib/actions/pantry";
import { computeShoppingList } from "@/lib/actions/shopping-list";
import { hasLacomerCredentials, getDefaultAddress } from "@/lib/actions/settings";
import { getWeekMealPlan } from "@/lib/actions/meal-plan";
import { getMonday } from "@/lib/date-utils";

export default async function Home() {
  const monday = getMonday(new Date());
  const [pantry, shoppingList, { configured }, address, weekEntries] = await Promise.all([
    listPantry(),
    computeShoppingList(),
    hasLacomerCredentials(),
    getDefaultAddress(),
    getWeekMealPlan(monday),
  ]);

  const lowStockCount = pantry.filter((p) => p.quantity <= p.minThreshold).length;
  const readyToAutomate = configured && !!address;
  const daysPlanned = new Set(weekEntries.map((e) => new Date(e.date).toDateString())).size;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">Hola 👋</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Así está tu despensa hoy, {new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon="🧺" label="Productos" value={pantry.length} color="brand" />
        <StatCard icon="🛒" label="Faltantes" value={shoppingList.length} color={shoppingList.length > 0 ? "sun" : "mint"} />
        <StatCard icon="📅" label="Días planeados" value={`${daysPlanned}/7`} color="brand" />
      </div>

      <Link href="/inventario" className="-mt-4 flex items-center gap-1 text-sm font-bold text-brand">
        Ver mi despensa completa
        <span aria-hidden>→</span>
      </Link>

      {!readyToAutomate && (
        <div className="card border-sun/30 bg-sun-light/60 text-sm text-sun-text">
          <span className="mr-1">💡</span>
          Para poder pedir automáticamente en La Comer necesitas guardar{" "}
          {!configured && "tus credenciales"}
          {!configured && !address && " y "}
          {!address && "tu dirección de entrega"} en{" "}
          <Link href="/configuracion" className="font-bold underline">
            Configuración
          </Link>
          .
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Link
          href="/pedir-super"
          className="rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">🛒</span>
            {shoppingList.length > 0 && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                {shoppingList.length} te están faltando
              </span>
            )}
          </div>
          <div className="mt-3 text-xl font-extrabold">Pedir el súper</div>
          <p className="mt-1 text-sm opacity-90">
            Arma tu pedido por categoría — te avisamos qué se te está acabando.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-bold">
            Empezar <span aria-hidden>→</span>
          </div>
        </Link>

        <Link
          href="/menu-semanal"
          className="rounded-3xl p-6 text-white shadow-lg transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#059669 0%,#047857 100%)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl">📅</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
              {daysPlanned} de 7 días listos
            </span>
          </div>
          <div className="mt-3 text-xl font-extrabold">Planear tu semana</div>
          <p className="mt-1 text-sm opacity-90">
            Desayuno, comida, cena y snacks — generamos la lista de compra sola.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-sm font-bold">
            Empezar <span aria-hidden>→</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

const STAT_COLORS = {
  brand: "border-brand/20 bg-brand-light/60 text-brand-text",
  mint: "border-mint/20 bg-mint-light/60 text-mint-text",
  sun: "border-sun/30 bg-sun-light/60 text-sun-text",
} as const;

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: keyof typeof STAT_COLORS;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 rounded-2xl border p-4 text-center ${STAT_COLORS[color]}`}>
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}
