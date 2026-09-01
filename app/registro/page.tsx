export const dynamic = "force-dynamic";

import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export default function RegistroPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">🛒 SuperCasa</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Crea tu cuenta para llevar tu propio inventario, recetas y pedidos.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-zinc-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
