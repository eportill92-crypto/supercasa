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
      setMessage("Pedido registrado. El inventario ya se repuso. ✅");
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
            className="input flex-1"
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
            className="input w-20"
          />
          <button type="button" onClick={() => removeRow(index)} className="text-xs font-semibold text-ink-soft hover:text-berry-text">
            Quitar
          </button>
        </div>
      ))}

      <button type="button" onClick={addRow} className="btn-ghost self-start !px-2">
        + Agregar producto
      </button>

      <input
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas (opcional)"
        className="input"
      />

      <button type="button" disabled={isPending} onClick={submit} className="btn-primary self-start">
        {isPending ? "Guardando..." : "Registrar pedido y reponer inventario"}
      </button>

      {message && <p className="text-sm font-semibold text-mint-text">{message}</p>}
    </div>
  );
}
