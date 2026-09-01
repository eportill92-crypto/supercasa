export const dynamic = "force-dynamic";

import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold">🛒 SuperCasa</h1>
        <p className="mt-1 text-sm text-zinc-500">Inicia sesión para ver tu despensa.</p>
      </div>
      <LoginForm callbackUrl={params.callbackUrl ?? "/"} />
      <p className="text-center text-sm text-zinc-500">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-zinc-900 underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
