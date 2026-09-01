export const dynamic = "force-dynamic";

import Link from "next/link";
import { listPantry } from "@/lib/actions/pantry";
import { computeShoppingList } from "@/lib/actions/shopping-list";
import { getLastOrder } from "@/lib/actions/orders";
import { hasLacomerCredentials, getDefaultAddress } from "@/lib/actions/settings";

export default async function Home() {
  const [pantry, shoppingList, lastOrder, { configured }, address] = await Promise.all([
    listPantry(),
    computeShoppingList(),
    getLastOrder(),
    hasLacomerCredentials(),
    getDefaultAddress(),
  ]);

  const lowStockCount = pantry.filter((p) => p.quantity <= p.minThreshold).length;
  const readyToAutomate = configured && !!address;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">Hola 👋</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Así está tu despensa hoy, {new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="📦" label="Productos en inventario" value={pantry.length} href="/inventario" color="brand" />
        <StatCard
          icon="🛒"
          label="Faltantes en la lista"
          value={shoppingList.length}
          href="/lista-compra"
          color={shoppingList.length > 0 ? "sun" : "mint"}
        />
        <StatCard
          icon="⚠️"
          label="Con stock bajo"
          value={lowStockCount}
          href="/inventario"
          color={lowStockCount > 0 ? "berry" : "mint"}
        />
      </div>

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

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card">
          <h2 className="flex items-center gap-2 font-bold text-brand-text">
            <span>🛒</span> Lista de compra actual
          </h2>
          {shoppingList.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Todo en orden, no falta nada. ✨</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {shoppingList.slice(0, 6).map((row) => (
                <li key={row.productId} className="flex justify-between">
                  <span>{row.name}</span>
                  <span className="font-semibold text-ink-soft">
                    {row.suggestedQty} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/lista-compra" className="btn-ghost mt-4 -ml-4 !px-4">
            Ir a la lista de compra →
          </Link>
        </section>

        <section className="card">
          <h2 className="flex items-center gap-2 font-bold text-mint-text">
            <span>📋</span> Último pedido
          </h2>
          {lastOrder ? (
            <>
              <p className="mt-1 text-xs text-ink-soft">
                {new Date(lastOrder.placedAt).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {lastOrder.source === "automatico" ? "🤖 Automático" : "✍️ Manual"}
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {lastOrder.items.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product.name}</span>
                    <span className="font-semibold text-ink-soft">
                      {item.quantity} {item.product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-soft">Aún no has registrado ningún pedido.</p>
          )}
          <Link href="/pedidos" className="btn-ghost mt-4 -ml-4 !px-4">
            Ver historial de pedidos →
          </Link>
        </section>
      </div>
    </div>
  );
}

const STAT_COLORS = {
  brand: "border-brand/20 bg-brand-light/60 text-brand-text",
  mint: "border-mint/20 bg-mint-light/60 text-mint-text",
  sun: "border-sun/30 bg-sun-light/60 text-sun-text",
  berry: "border-berry/20 bg-berry-light/60 text-berry-text",
} as const;

function StatCard({
  icon,
  label,
  value,
  href,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  href: string;
  color: keyof typeof STAT_COLORS;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${STAT_COLORS[color]}`}
    >
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <div>
        <div className="text-3xl font-extrabold">{value}</div>
        <div className="text-sm font-medium opacity-80">{label}</div>
      </div>
    </Link>
  );
}
