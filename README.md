# SuperCasa

Plataforma **multi-usuario** para automatizar el súper de la casa contra [lacomer.com.mx](https://www.lacomer.com.mx/). Cualquiera puede crear su cuenta (correo/contraseña o Google); cada quien tiene su propia despensa, pedidos, recetas y credenciales — separados por completo del resto.

- **Cuentas**: registro abierto con correo/contraseña o Google (Auth.js). Todas las rutas requieren sesión.
- **Inventario de la cocina**: lo que tienes en casa, con un mínimo y una cantidad objetivo por producto.
- **Registro de pedidos**: cuando compras (en La Comer o en tienda), lo registras aquí y el inventario se repone solo. El formulario de "nuevo pedido" ya viene precargado con tu **último pedido**, para reordenar rápido.
- **Consumo**: cada vez que usas algo de la despensa, lo descuentas con un click (botón "Usar"), quedando un historial de consumo (`UsageEvent`) que también alimenta un estimado de "cuántos días te dura" en Inventario.
- **Lista de compra**: se calcula sola combinando lo que bajó del mínimo en el inventario + lo que agregues a mano, con una cantidad sugerida (tu cantidad objetivo, o lo que compraste la última vez).
- **Recetas y menú semanal**: recetario base compartido + tus propias recetas; recomienda qué cocinar según tu inventario, y al marcar una comida del menú semanal como "preparada" descuenta los ingredientes solos.
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

# Genera AUTH_SECRET (para firmar sesiones):
openssl rand -base64 32

npm run db:push    # crea las tablas
npm run db:seed    # recetario base (compartido entre todos los usuarios)
npm run dev
```

Abre `http://localhost:3000` y regístrate — cada cuenta empieza con la despensa vacía.

### Cuentas de usuario (Auth.js)

- **Correo/contraseña**: funciona sin configurar nada más (contraseña con bcrypt, sesión JWT).
- **Google**: necesitas crear un "OAuth client ID" en [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (tipo "Web application"), con este Redirect URI:
  - `http://localhost:3000/api/auth/callback/google` (desarrollo)
  - `https://tu-dominio.com/api/auth/callback/google` (producción)

  Pon el Client ID/Secret en `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` en `.env`. Sin esto configurado, el botón de Google simplemente no funcionará (el resto de la app sigue igual).

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
auth.ts                Configuración de Auth.js (Google + correo/contraseña)
middleware.ts           Protege todas las rutas excepto /login y /registro
app/                    Páginas (Inicio, Inventario, Lista de compra, Pedidos, Recetas, Menú semanal, Configuración, Login/Registro)
components/             Componentes de cliente (formularios interactivos)
lib/actions/            Server actions: auth, pantry, orders, shopping-list, settings, automation, recipes, meal-plan
lib/session.ts          requireUserId() — obtiene el usuario de la sesión actual en cada action
lib/lacomer/            Módulo de automatización (config de selectores + lógica Playwright)
lib/crypto.ts           Cifrado AES-256-GCM para credenciales
prisma/schema.prisma    Modelo de datos (todo separado por userId)
scripts/explore-lacomer.ts  Ayuda a capturar selectores reales del sitio (correr localmente)
scripts/run-order.ts        CLI para disparar el pedido automático fuera de la app web
```

## Despliegue en producción

- Conecta una base Postgres (Supabase, Neon, etc.) al proyecto en Vercel y usa la variable resultante (`POSTGRES_PRISMA_URL`) como `DATABASE_URL`.
- Define `ENCRYPTION_KEY`, `AUTH_SECRET`, y (si quieres login con Google) `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` como variables de entorno seguras (nunca las subas al repo). Para Google, agrega también el Redirect URI de tu dominio de producción en Google Cloud Console.
- Define `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` para que el build no intente descargar Chromium.
- Después de agregar/cambiar variables de entorno hace falta un **Redeploy** manual (Vercel no las aplica solo).
- Ver la sección de automatización arriba sobre dónde correr el robot de Playwright.
