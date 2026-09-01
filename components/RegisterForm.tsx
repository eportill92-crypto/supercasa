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
        <input name="name" placeholder="Tu nombre (opcional)" className="input" />
        <input name="email" type="email" required placeholder="Correo" className="input" />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Contraseña (mínimo 8 caracteres)"
          className="input"
        />
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        {state?.error && <p className="text-sm font-semibold text-berry-text">{state.error}</p>}
      </form>

      <div className="flex items-center gap-2 text-xs text-ink-soft">
        <div className="h-px flex-1 bg-black/10" />
        o
        <div className="h-px flex-1 bg-black/10" />
      </div>

      <form action={loginWithGoogleAction}>
        <input type="hidden" name="callbackUrl" value="/" />
        <button type="submit" className="btn-secondary w-full">
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
