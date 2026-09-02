"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/settings";

type State = { error: string } | { success: string } | null;

export default function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [state, formAction, isPending] = useActionState<State, FormData>(async (_prev, formData) => {
    return (await changePasswordAction(formData)) ?? null;
  }, null);

  return (
    <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
      {hasPassword && (
        <input
          name="currentPassword"
          type="password"
          required
          placeholder="Contraseña actual"
          className="input sm:col-span-2"
        />
      )}
      <input
        name="newPassword"
        type="password"
        required
        minLength={8}
        placeholder="Contraseña nueva (mínimo 8 caracteres)"
        className="input"
      />
      <input
        name="confirmPassword"
        type="password"
        required
        minLength={8}
        placeholder="Confirmar contraseña nueva"
        className="input"
      />
      <div className="flex flex-col gap-2 sm:col-span-2">
        <button type="submit" disabled={isPending} className="btn-primary self-start">
          {isPending ? "Guardando..." : hasPassword ? "Cambiar contraseña" : "Crear contraseña"}
        </button>
        {state && "error" in state && (
          <p className="text-sm font-semibold text-berry-text">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm font-semibold text-mint-text">{state.success}</p>
        )}
      </div>
    </form>
  );
}
