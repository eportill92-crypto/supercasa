export const dynamic = "force-dynamic";

import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegistroPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-light text-2xl">
          🛒
        </div>
        <h1 className="mt-3 text-2xl font-extrabold">SuperCasa</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Crea tu cuenta para llevar tu propio inventario, recetas y pedidos.
        </p>
      </div>
      <div className="card">
        <RegisterForm />
      </div>
      <p className="text-center text-sm text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-mint-text underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
