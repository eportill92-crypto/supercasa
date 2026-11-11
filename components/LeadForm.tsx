"use client";

import { useState, useTransition } from "react";
import { submitLandingLead } from "@/lib/actions/leads";

export default function LeadForm() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      const res = await submitLandingLead(formData);
      setStatus(res.ok ? { ok: true, message: "¡Listo! Te contactamos pronto." } : { ok: false, message: res.error });
    });
  }

  if (status?.ok) {
    return (
      <p className="flex items-center gap-2 text-ink">
        <span className="text-2xl">✅</span> {status.message}
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <input
        name="name"
        placeholder="Tu nombre"
        required
        className="flex-1 rounded-sm border border-black/10 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft"
      />
      <input
        name="email"
        type="email"
        placeholder="Tu correo"
        required
        className="flex-1 rounded-sm border border-black/10 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft"
      />
      <input
        name="phone"
        placeholder="Teléfono (opcional)"
        className="flex-1 rounded-sm border border-black/10 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-black disabled:opacity-60 sm:shrink-0"
      >
        {isPending ? "Enviando…" : "Que me contacten"}
      </button>
      {status && !status.ok && <p className="text-xs text-berry-text sm:basis-full">{status.message}</p>}
    </form>
  );
}
