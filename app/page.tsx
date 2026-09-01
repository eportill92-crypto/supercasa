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
        <h1 className="text-2xl font-semibold">Hola 👋</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Así está tu despensa hoy, {new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Productos en inventario" value={pantry.length} href="/inventario" />
        <StatCard
          label="Faltantes en la lista"
          value={shoppingList.length}
          href="/lista-compra"
          alert={shoppingList.length > 0}
        />
        <StatCard
          label="Con stock bajo"
          value={lowStockCount}
          href="/inventario"
          alert={lowStockCount > 0}
        />
      </div>

      {!readyToAutomate && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Para poder pedir automáticamente en La Comer necesitas guardar{" "}
          {!configured && "tus credenciales"}
          {!configured && !address && " y "}
          {!address && "tu dirección de entrega"} en{" "}
          <Link href="/configuracion" className="font-medium underline">
            Configuración
          </Link>
          .
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-medium">Lista de compra actual</h2>
          {shoppingList.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-400">Todo en orden, no falta nada.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {shoppingList.slice(0, 6).map((row) => (
                <li key={row.productId} className="flex justify-between">
                  <span>{row.name}</span>
                  <span className="text-zinc-400">
                    {row.suggestedQty} {row.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/lista-compra"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Ir a la lista de compra →
          </Link>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <h2 className="font-medium">Último pedido</h2>
          {lastOrder ? (
            <>
              <p className="mt-1 text-xs text-zinc-400">
                {new Date(lastOrder.placedAt).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}{" "}
                · {lastOrder.source === "automatico" ? "Automático" : "Manual"}
              </p>
              <ul className="mt-3 flex flex-col gap-1 text-sm">
                {lastOrder.items.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product.name}</span>
                    <span className="text-zinc-400">
                      {item.quantity} {item.product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Aún no has registrado ningún pedido.</p>
          )}
          <Link
            href="/pedidos"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Ver historial de pedidos →
          </Link>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  alert,
}: {
  label: string;
  value: number;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border p-5 transition hover:shadow-sm ${
        alert ? "border-amber-300 bg-amber-50" : "border-zinc-200 bg-white"
      }`}
    >
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </Link>
  );
}
