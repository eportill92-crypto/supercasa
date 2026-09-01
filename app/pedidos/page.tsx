export const dynamic = "force-dynamic";

import { listOrders, getLastOrder, listAllProducts } from "@/lib/actions/orders";
import { listAutomationLogs } from "@/lib/actions/automation";
import RegisterOrderForm from "@/components/RegisterOrderForm";

export default async function PedidosPage() {
  const [orders, lastOrder, products, automationLogs] = await Promise.all([
    listOrders(),
    getLastOrder(),
    listAllProducts(),
    listAutomationLogs(),
  ]);
  const pendingOrErrorLogs = automationLogs.filter((l) => l.status !== "success");

  const initialRows =
    lastOrder?.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Registra lo que compraste (en La Comer o en tienda) para reponer el inventario
          automáticamente. El formulario ya viene precargado con tu último pedido.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Registrar pedido</h2>
        {products.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">
            Primero agrega productos en Inventario para poder registrarlos aquí.
          </p>
        ) : (
          <div className="mt-4">
            <RegisterOrderForm products={products} initialRows={initialRows} />
          </div>
        )}
      </section>

      {pendingOrErrorLogs.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium">Robot de compra — en curso / con errores</h2>
          <p className="mb-3 text-sm text-zinc-500">
            Cuando el pedido se dispara desde el sitio en producción, corre en GitHub Actions y
            puede tardar unos minutos en aparecer arriba en Pedidos. Aquí ves el estado mientras
            tanto, o si algo falló.
          </p>
          <div className="flex flex-col gap-2">
            {pendingOrErrorLogs.map((log) => (
              <div
                key={log.id}
                className={`rounded-lg border p-3 text-sm ${
                  log.status === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {log.status === "error" ? "Error" : "En proceso"}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(log.startedAt).toLocaleString("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                {log.message && <p className="mt-1">{log.message}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-medium">Historial</h2>
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {new Date(order.placedAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                  {order.source === "automatico" ? "Automático (La Comer)" : "Manual"} ·{" "}
                  {order.status}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity} {item.product.unit}
                  </li>
                ))}
              </ul>
              {order.notes && <p className="mt-2 text-xs text-zinc-400">{order.notes}</p>}
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-sm text-zinc-400">Aún no hay pedidos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
