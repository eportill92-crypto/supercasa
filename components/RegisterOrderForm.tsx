"use client";

import { useState, useTransition } from "react";
import { registerOrder, type RegisterOrderItemInput } from "@/lib/actions/orders";

type ProductOption = { id: string; name: string; unit: string };

type Row = { productId: string; quantity: number };

export default function RegisterOrderForm({
  products,
  initialRows,
}: {
  products: ProductOption[];
  initialRows: Row[];
}) {
  const [rows, setRows] = useState<Row[]>(
    initialRows.length > 0 ? initialRows : [{ productId: products[0]?.id ?? "", quantity: 1 }]
  );
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { productId: products[0]?.id ?? "", quantity: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    const items: RegisterOrderItemInput[] = rows
      .filter((r) => r.productId && r.quantity > 0)
      .map((r) => ({ productId: r.productId, quantity: r.quantity }));

    if (items.length === 0) {
      setMessage("Agrega al menos un producto con cantidad válida.");
      return;
    }

    startTransition(async () => {
      await registerOrder({ items, source: "manual", notes: notes || undefined });
      setMessage("Pedido registrado. El inventario ya se repuso.");
      setRows([{ productId: products[0]?.id ?? "", quantity: 1 }]);
      setNotes("");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <select
            value={row.productId}
            onChange={(e) => updateRow(index, { productId: e.target.value })}
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.5"
            value={row.quantity}
            onChange={(e) => updateRow(index, { quantity: Number(e.target.value) })}
            className="w-20 rounded-md border border-zinc-300 px-2 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="text-xs text-zinc-400 hover:text-red-600"
          >
            Quitar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="self-start rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
      >
        + Agregar producto
      </button>

      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (opcional)"
        className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
      />

      <button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Registrar pedido y reponer inventario"}
      </button>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </div>
  );
}
