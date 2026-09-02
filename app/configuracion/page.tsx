export const dynamic = "force-dynamic";

import {
  saveLacomerCredentials,
  clearLacomerCredentials,
  hasLacomerCredentials,
  saveDeliveryAddress,
  getDefaultAddress,
  getAutoOrderEnabled,
  setAutoOrderEnabled,
  getPreferredPaymentMethod,
  setPreferredPaymentMethod,
} from "@/lib/actions/settings";
import { PAYMENT_METHODS } from "@/lib/payment-methods";

export default async function ConfiguracionPage() {
  const [{ configured }, address, autoOrderEnabled, preferredPaymentMethod] = await Promise.all([
    hasLacomerCredentials(),
    getDefaultAddress(),
    getAutoOrderEnabled(),
    getPreferredPaymentMethod(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold">⚙️ Configuración</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Credenciales de La Comer y dirección de entrega para el pedido automático.
        </p>
      </div>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-brand-text">
          <span>🔑</span> Credenciales de lacomer.com.mx
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Se guardan cifradas (AES-256-GCM) en la base de datos, nunca en texto plano. Aun así,
          solo tú deberías tener acceso a esta app: quien controle el servidor puede en teoría
          descifrarlas.
        </p>
        <div className={`mt-3 rounded-2xl px-3 py-2 text-sm font-semibold ${configured ? "bg-mint-light text-mint-text" : "bg-sun-light text-sun-text"}`}>
          {configured
            ? "✔ Ya hay credenciales guardadas. Vuelve a enviarlas para reemplazarlas."
            : "Aún no has guardado credenciales."}
        </div>
        <form action={saveLacomerCredentials} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="email" type="email" required placeholder="Correo de La Comer" className="input" />
          <input name="password" type="password" required placeholder="Contraseña" className="input" />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">
              Guardar credenciales
            </button>
          </div>
        </form>
        {configured && (
          <form action={clearLacomerCredentials} className="mt-2">
            <button type="submit" className="text-sm font-semibold text-berry-text hover:underline">
              Eliminar credenciales guardadas
            </button>
          </form>
        )}
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-mint-text">
          <span>📍</span> Dirección de entrega
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Se usa para llenar el checkout automáticamente y para pedir pago contra entrega.
        </p>
        <form action={saveDeliveryAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="street" required defaultValue={address?.street} placeholder="Calle" className="input sm:col-span-2" />
          <input name="extNumber" defaultValue={address?.extNumber ?? ""} placeholder="Número exterior" className="input" />
          <input name="intNumber" defaultValue={address?.intNumber ?? ""} placeholder="Número interior (opcional)" className="input" />
          <input name="neighborhood" defaultValue={address?.neighborhood ?? ""} placeholder="Colonia" className="input sm:col-span-2" />
          <input name="city" required defaultValue={address?.city} placeholder="Ciudad / Alcaldía" className="input" />
          <input name="state" required defaultValue={address?.state} placeholder="Estado" className="input" />
          <input name="zip" required defaultValue={address?.zip} placeholder="Código postal" className="input" />
          <input name="phone" defaultValue={address?.phone ?? ""} placeholder="Teléfono de contacto" className="input" />
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Guardar dirección
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-sun-text">
          <span>💳</span> Método de pago contra entrega
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          El repartidor necesita saber con qué vas a pagar para traer la máquina correcta (o
          nada, si es en efectivo). Nunca se guardan datos de tarjeta — solo eliges cuál usarás
          al momento de la entrega.
        </p>
        <form action={setPreferredPaymentMethod} className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className="flex items-center gap-2 rounded-2xl border-2 border-black/10 px-4 py-2.5 text-sm font-semibold has-[:checked]:border-sun has-[:checked]:bg-sun-light has-[:checked]:text-sun-text"
              >
                <input
                  type="radio"
                  name="preferredPaymentMethod"
                  value={m.value}
                  defaultChecked={preferredPaymentMethod === m.value}
                  className="accent-sun"
                />
                {m.label}
              </label>
            ))}
          </div>
          <button type="submit" className="btn-primary self-start">
            Guardar
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="flex items-center gap-2 font-bold text-grape-text">
          <span>🤖</span> Pedido automático programado
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          El botón &quot;Pedir en La Comer&quot; de la lista de compra siempre es manual — lo
          disparas tú. Esto es aparte: si lo activas, un robot programado revisa tu lista de
          compra todos los días y pide automáticamente lo que falte, usando tus credenciales y
          dirección de arriba (necesitas tenerlas guardadas).
        </p>
        <form action={setAutoOrderEnabled} className="mt-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="autoOrderEnabled"
              defaultChecked={autoOrderEnabled}
              className="h-4 w-4 accent-brand"
            />
            Pedir automáticamente lo que falte, todos los días
          </label>
          <button type="submit" className="btn-primary mt-3">
            Guardar
          </button>
        </form>
      </section>
    </div>
  );
}
