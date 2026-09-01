# SuperCasa

App para automatizar el súper de la casa contra [lacomer.com.mx](https://www.lacomer.com.mx/):

- **Inventario de la cocina**: lo que tienes en casa, con un mínimo y una cantidad objetivo por producto.
- **Registro de pedidos**: cuando compras (en La Comer o en tienda), lo registras aquí y el inventario se repone solo. El formulario de "nuevo pedido" ya viene precargado con tu **último pedido**, para reordenar rápido.
- **Consumo**: cada vez que usas algo de la despensa, lo descuentas con un click (botón "Usar"), quedando un historial de consumo (`UsageEvent`).
- **Lista de compra**: se calcula sola combinando lo que bajó del mínimo en el inventario + lo que agregues a mano, con una cantidad sugerida (tu cantidad objetivo, o lo que compraste la última vez).
- **Pedido automático en La Comer**: desde la lista de compra, un botón dispara un robot (Playwright) que inicia sesión con tus credenciales, agrega los productos al carrito y hace el checkout con **pago contra entrega**.

## Stack

Next.js (App Router) + TypeScript + Tailwind + Prisma (Postgres) + Playwright.

## Poner a andar el proyecto

Necesitas una base Postgres (local, o gratis en [Supabase](https://supabase.com) / [Neon](https://neon.tech)). Si ya la conectaste como integración de un proyecto en Vercel, usa el valor de `POSTGRES_PRISMA_URL` como `DATABASE_URL` aquí abajo, y `POSTGRES_URL_NON_POOLING` cuando corras `db:push` (las operaciones de crear/alterar tablas no deben ir por la conexión con pooling).

```bash
npm install
cp .env.example .env
# Pega tu cadena de conexión de Postgres en DATABASE_URL dentro de .env

# Genera una clave real y ponla en ENCRYPTION_KEY dentro de .env:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

npm run db:push    # crea las tablas
npm run db:seed    # productos de ejemplo
npm run dev
```

Abre `http://localhost:3000`.

## ⚠️ Sobre la automatización de La Comer — léelo antes de usarla

El robot de compra vive en `lib/lacomer/`:

- `config.ts` — todos los selectores (botones, inputs, etc.) del sitio de La Comer.
- `automate.ts` — el flujo: login → buscar/agregar cada producto → checkout con pago contra entrega.

**Los selectores de `config.ts` son placeholders sin verificar.** Este proyecto se desarrolló en un entorno con el acceso de red a `lacomer.com.mx` bloqueado por política del sandbox, así que no fue posible abrir el sitio real durante el desarrollo para confirmar los `id`/`name`/textos exactos de cada botón y campo. Antes de usar la automatización en serio:

1. Corre `npm run lacomer:explore` **en tu propia computadora** (con internet normal). Abre el sitio real paso a paso y te guía para anotar los selectores correctos.
2. Pega esos selectores en `lib/lacomer/config.ts`.
3. Prueba primero con `LACOMER_HEADFUL=true` en `.env` para ver el navegador y confirmar cada paso a la vista, antes de dejarlo correr solo.
4. Hay un modo simulación sin tocar la red ni abrir navegador: `LACOMER_DRY_RUN=true` en `.env`. Sirve para probar que el resto del flujo (guardar credenciales → botón "Pedir en La Comer" → se registra el pedido y se repone el inventario) funciona, mientras terminas de verificar los selectores reales.

### Seguridad de las credenciales

Tu correo y contraseña de La Comer se guardan **cifrados** (AES-256-GCM, clave `ENCRYPTION_KEY`) en la base de datos — nunca en texto plano. Aun así:

- Quien tenga acceso al servidor y a `ENCRYPTION_KEY` puede descifrarlas — trata esta app como si fuera tan sensible como tu cuenta de La Comer misma. No la despliegues en un servidor compartido o público.
- El pago está configurado para ser **contra entrega** (efectivo/tarjeta al recibir), nunca se guarda ni se usa una tarjeta de crédito/débito dentro de la automatización.
- Revisa los [Términos y Condiciones de La Comer](https://www.lacomer.com.mx/) — automatizar compras con un bot puede no estar contemplado en el uso esperado del sitio. Es tu cuenta y tu decisión, pero conviene saberlo.

### Dónde correr el robot en producción

Playwright necesita un proceso con navegador real, que puede tardar más de lo que permite una función serverless típica de Vercel. Para uso real:

- Corre `npm run lacomer:order` (usa `scripts/run-order.ts`) desde un cron en tu propia máquina, un contenedor, o un GitHub Action con acceso a la base de datos — no como función serverless de Vercel.
- El botón "Pedir en La Comer" de la app web funciona igual si despliegas el proyecto completo en un servidor propio (`next start`) en vez de en Vercel.

## Estructura

```
app/                  Páginas (Inicio, Inventario, Lista de compra, Pedidos, Configuración)
components/           Componentes de cliente (formularios interactivos)
lib/actions/          Server actions: pantry, orders, shopping-list, settings, automation
lib/lacomer/          Módulo de automatización (config de selectores + lógica Playwright)
lib/crypto.ts          Cifrado AES-256-GCM para credenciales
prisma/schema.prisma   Modelo de datos
scripts/explore-lacomer.ts  Ayuda a capturar selectores reales del sitio (correr localmente)
scripts/run-order.ts        CLI para disparar el pedido automático fuera de la app web
```

## Despliegue en producción

- Conecta una base Postgres (Supabase, Neon, etc.) al proyecto en Vercel y usa la variable resultante (`POSTGRES_PRISMA_URL`) como `DATABASE_URL`.
- Define `ENCRYPTION_KEY` como variable de entorno segura (nunca la subas al repo).
- Define `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` para que el build no intente descargar Chromium.
- Después de agregar/cambiar variables de entorno hace falta un **Redeploy** manual (Vercel no las aplica solo).
- Ver la sección de automatización arriba sobre dónde correr el robot de Playwright.
