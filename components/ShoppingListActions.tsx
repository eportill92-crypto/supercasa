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
        setResult("Pedido registrado manualmente y el inventario se repuso.");
      } catch (err) {
        setResult(err instanceof Error ? err.message : "Error al registrar el pedido");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-zinc-100">
        {rows.map((row) => (
          <div key={row.productId} className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={selected[row.productId] ?? true}
              onChange={(e) =>
                setSelected((prev) => ({ ...prev, [row.productId]: e.target.checked }))
              }
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{row.name}</div>
              <div className="text-xs text-zinc-400">
                {row.reason === "stock_bajo"
                  ? `Tienes ${row.currentQty} ${row.unit}, mínimo ${row.minThreshold}`
                  : "Agregado manualmente"}
              </div>
            </div>
            <input
              type="number"
              step="0.5"
              value={quantities[row.productId] ?? row.suggestedQty}
              onChange={(e) =>
                setQuantities((prev) => ({ ...prev, [row.productId]: Number(e.target.value) }))
              }
              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
            />
            <span className="w-10 text-xs text-zinc-400">{row.unit}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending || selectedItems.length === 0}
          onClick={orderAutomatically}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "Pidiendo..." : "Pedir en La Comer (automático)"}
        </button>
        <button
          type="button"
          disabled={isPending || selectedItems.length === 0}
          onClick={registerManually}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Ya lo compré manualmente
        </button>
      </div>

      <p className="text-xs text-zinc-400">
        &quot;Pedir en La Comer&quot; usa el robot de compra (Playwright) con tus credenciales
        guardadas y tu dirección de entrega, con pago contra entrega. Requiere que los
        selectores en <code>lib/lacomer/config.ts</code> ya estén verificados contra el sitio
        real — ver README.
      </p>

      {result && (
        <div className="rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">{result}</div>
      )}
    </div>
  );
}
