"use client";

import { useActionState } from "react";
import { registerAction, loginWithGoogleAction } from "@/lib/actions/auth";

type State = { error: string } | null;

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(async (_prev, formData) => {
    return (await registerAction(formData)) ?? null;
  }, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="name"
          placeholder="Tu nombre (opcional)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Correo"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Contraseña (mínimo 8 caracteres)"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        o
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form action={loginWithGoogleAction}>
        <input type="hidden" name="callbackUrl" value="/" />
        <button
          type="submit"
          className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
