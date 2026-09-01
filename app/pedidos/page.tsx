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
        <h1 className="text-3xl font-extrabold">📋 Pedidos</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Registra lo que compraste (en La Comer o en tienda) para reponer el inventario
          automáticamente. El formulario ya viene precargado con tu último pedido.
        </p>
      </div>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-mint-text">
          <span>✍️</span> Registrar pedido
        </h2>
        {products.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
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
          <h2 className="mb-3 flex items-center gap-2 font-bold text-ink">
            <span>🤖</span> Robot de compra — en curso / con errores
          </h2>
          <p className="mb-3 text-sm text-ink-soft">
            Cuando el pedido se dispara desde el sitio en producción, corre en GitHub Actions y
            puede tardar unos minutos en aparecer arriba en Pedidos. Aquí ves el estado mientras
            tanto, o si algo falló.
          </p>
          <div className="flex flex-col gap-2">
            {pendingOrErrorLogs.map((log) => (
              <div
                key={log.id}
                className={`card !p-3 text-sm ${
                  log.status === "error" ? "border-berry/30 bg-berry-light/50 text-berry-text" : "border-sun/30 bg-sun-light/50 text-sun-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold">{log.status === "error" ? "❌ Error" : "⏳ En proceso"}</span>
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
        <h2 className="mb-3 flex items-center gap-2 font-bold text-brand-text">
          <span>🕓</span> Historial
        </h2>
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="card !p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">
                  {new Date(order.placedAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className={order.source === "automatico" ? "badge-mint" : "badge-brand"}>
                  {order.source === "automatico" ? "🤖 Automático" : "✍️ Manual"} · {order.status}
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.name} × {item.quantity} {item.product.unit}
                  </li>
                ))}
              </ul>
              {order.notes && <p className="mt-2 text-xs text-ink-soft">{order.notes}</p>}
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-ink-soft">Aún no hay pedidos registrados.</p>}
        </div>
      </section>
    </div>
  );
}
