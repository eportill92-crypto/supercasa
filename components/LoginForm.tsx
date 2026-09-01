"use client";

import { useActionState } from "react";
import { loginAction, loginWithGoogleAction } from "@/lib/actions/auth";

type State = { error: string } | null;

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, isPending] = useActionState<State, FormData>(async (_prev, formData) => {
    return (await loginAction(formData)) ?? null;
  }, null);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <input name="email" type="email" required placeholder="Correo" className="input" />
        <input name="password" type="password" required placeholder="Contraseña" className="input" />
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? "Entrando..." : "Entrar"}
        </button>
        {state?.error && <p className="text-sm font-semibold text-berry-text">{state.error}</p>}
      </form>

      <div className="flex items-center gap-2 text-xs text-ink-soft">
        <div className="h-px flex-1 bg-black/10" />
        o
        <div className="h-px flex-1 bg-black/10" />
      </div>

      <form action={loginWithGoogleAction}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <button type="submit" className="btn-secondary w-full">
          Continuar con Google
        </button>
      </form>
    </div>
  );
}
