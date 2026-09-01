"use client";

import { useState, useTransition } from "react";
import { runLacomerOrder } from "@/lib/actions/automation";
import { registerOrder } from "@/lib/actions/orders";
import type { ShoppingListRow } from "@/lib/actions/shopping-list";

export default function ShoppingListActions({ rows }: { rows: ShoppingListRow[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(rows.map((r) => [r.productId, r.suggestedQty]))
  );
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map((r) => [r.productId, true]))
  );
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const selectedItems = rows
    .filter((r) => selected[r.productId])
    .map((r) => ({ productId: r.productId, quantity: quantities[r.productId] ?? r.suggestedQty }))
    .filter((i) => i.quantity > 0);

  function orderAutomatically() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await runLacomerOrder({ items: selectedItems });
        setResult(res.message);
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Error al pedir automáticamente");
      }
    });
  }

  function registerManually() {
    setResult(null);
    startTransition(async () => {
      try {
        await registerOrder({ items: selectedItems, source: "manual" });
        setResult("Pedido registrado manualmente y el inventario se repuso. ✅");
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Error al registrar el pedido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-black/5">
        {rows.map((row) => (
          <div key={row.productId} className="flex items-center gap-3 py-2.5">
            <input
              type="checkbox"
              checked={selected[row.productId] ?? true}
              onChange={(e) => setSelected((prev) => ({ ...prev, [row.productId]: e.target.checked }))}
              className="h-4 w-4 accent-brand"
            />
            <div className="flex-1">
              <div className="text-sm font-bold">{row.name}</div>
              <div className="text-xs">
                {row.reason === "stock_bajo" ? (
                  <span className="badge-sun">
                    Tienes {row.currentQty} {row.unit}, mínimo {row.minThreshold}
                  </span>
                ) : (
                  <span className="badge-grape">Agregado manualmente</span>
                )}
              </div>
            </div>
            <input
              type="number"
              step="0.5"
              value={quantities[row.productId] ?? row.suggestedQty}
              onChange={(e) => setQuantities((prev) => ({ ...prev, [row.productId]: Number(e.target.value) }))}
              className="w-20 rounded-xl border-2 border-black/10 px-2 py-1 text-sm"
            />
            <span className="w-10 text-xs text-ink-soft">{row.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || selectedItems.length === 0}
          onClick={orderAutomatically}
          className="btn-primary"
        >
          {isPending ? "Pidiendo..." : "🤖 Pedir en La Comer (automático)"}
        </button>
        <button
          type="button"
          disabled={isPending || selectedItems.length === 0}
          onClick={registerManually}
          className="btn-secondary"
        >
          Ya lo compré manualmente
        </button>
      </div>

      <p className="text-xs text-ink-soft">
        &quot;Pedir en La Comer&quot; usa el robot de compra (Playwright) con tus credenciales
        guardadas y tu dirección de entrega, con pago contra entrega. Requiere que los
        selectores en <code>lib/lacomer/config.ts</code> ya estén verificados contra el sitio
        real — ver README.
      </p>

      {result && <div className="card !p-3 bg-brand-light/40 text-sm text-brand-text">{result}</div>}
    </div>
  );
}
