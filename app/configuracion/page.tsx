export const dynamic = "force-dynamic";

import {
  saveLacomerCredentials,
  clearLacomerCredentials,
  hasLacomerCredentials,
  saveDeliveryAddress,
  getDefaultAddress,
} from "@/lib/actions/settings";

export default async function ConfiguracionPage() {
  const [{ configured }, address] = await Promise.all([
    hasLacomerCredentials(),
    getDefaultAddress(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Credenciales de La Comer y dirección de entrega para el pedido automático.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Credenciales de lacomer.com.mx</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Se guardan cifradas (AES-256-GCM) en la base de datos, nunca en texto plano. Aun así,
          solo tú deberías tener acceso a esta app: quien controle el servidor puede en teoría
          descifrarlas.
        </p>
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {configured
            ? "✔ Ya hay credenciales guardadas. Vuelve a enviarlas para reemplazarlas."
            : "Aún no has guardado credenciales."}
        </div>
        <form action={saveLacomerCredentials} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Correo de La Comer"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div className="flex gap-2 sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Guardar credenciales
            </button>
          </div>
        </form>
        {configured && (
          <form action={clearLacomerCredentials} className="mt-2">
            <button type="submit" className="text-sm text-red-600 hover:underline">
              Eliminar credenciales guardadas
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <h2 className="font-medium">Dirección de entrega</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Se usa para llenar el checkout automáticamente y para pedir pago contra entrega.
        </p>
        <form action={saveDeliveryAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="street"
            required
            defaultValue={address?.street}
            placeholder="Calle"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="extNumber"
            defaultValue={address?.extNumber ?? ""}
            placeholder="Número exterior"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="intNumber"
            defaultValue={address?.intNumber ?? ""}
            placeholder="Número interior (opcional)"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="neighborhood"
            defaultValue={address?.neighborhood ?? ""}
            placeholder="Colonia"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <input
            name="city"
            required
            defaultValue={address?.city}
            placeholder="Ciudad / Alcaldía"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="state"
            required
            defaultValue={address?.state}
            placeholder="Estado"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="zip"
            required
            defaultValue={address?.zip}
            placeholder="Código postal"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            defaultValue={address?.phone ?? ""}
            placeholder="Teléfono de contacto"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Guardar dirección
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
