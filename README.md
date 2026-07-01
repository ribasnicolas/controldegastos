# Control de Gastos

App simple para llevar el control de gastos personales: cada usuario carga sus gastos e ingresos, ve un dashboard con el dinero disponible del mes, y puede sumarse a un "hogar" para compartir el resumen con otras personas. Gastos, categorías y usuarios se gestionan desde un módulo admin.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS v4 + Prisma + PostgreSQL (Supabase) + NextAuth v5 (credentials) + recharts + sonner.

## Setup local

1. **Instalar dependencias**

   ```bash
   npm install
   ```

2. **Crear un proyecto en [Supabase](https://supabase.com)**

   - `New project` → elegí una contraseña de base de datos y guardala.
   - Andá a `Project Settings → Database → Connection string`.
   - Copiá la **Connection pooling** string (puerto 6543) para `DATABASE_URL`, y la conexión **directa** (puerto 5432) para `DIRECT_URL`.

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Completá `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` (`openssl rand -base64 32`) y `CRON_SECRET` (`openssl rand -base64 32`). Si querés que el seed cree un usuario admin, completá `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

4. **Crear las tablas y cargar datos iniciales**

   ```bash
   npm run db:migrate   # crea las tablas en Supabase
   npm run db:seed      # crea categorías por defecto + usuario admin (si configuraste las env vars)
   ```

5. **Correr en desarrollo**

   ```bash
   npm run dev
   ```

   Entrá a `http://localhost:3000` con el email/contraseña del admin que sembraste.

## Estructura

- `app/(app)/` — pantallas protegidas (dashboard, gastos, ingresos, presupuesto, hogar, admin), todas comparten el layout con navegación inferior.
- `app/login/` — pantalla pública de inicio de sesión.
- `app/api/cron/recurring/` — endpoint que materializa gastos/ingresos fijos del mes (ver más abajo).
- `lib/actions/` — Server Actions (crear/borrar gastos, ingresos, presupuestos, usuarios, categorías, hogar, recurrentes).
- `lib/data/` — queries de lectura reutilizadas por las páginas.
- `prisma/schema.prisma` — modelo de datos.
- `design-playbook.md` — reglas de diseño mobile (HIG + Material 3) que sigue toda la UI.

## Roles

- **USER**: carga y ve únicamente sus propios gastos, ingresos y presupuesto. Puede crear o unirse a un hogar.
- **ADMIN**: además de lo anterior, gestiona usuarios (`/admin/usuarios`) y categorías de gasto (`/admin/categorias`) desde el módulo admin.

El primer usuario admin se crea con `npm run db:seed` (variables `ADMIN_*` en `.env`). Desde la app, un admin puede crear el resto de los usuarios — no hay registro público.

## Gastos e ingresos fijos (recurrentes)

Cada usuario puede marcar un gasto o ingreso como fijo (ej. alquiler, sueldo) indicando el monto y el día del mes. El endpoint `GET /api/cron/recurring` revisa qué recurrentes ya deberían haberse generado este mes y crea el `Expense`/`Income` correspondiente una sola vez por mes.

En producción, Vercel ejecuta este endpoint automáticamente todos los días a las 9am (ver `vercel.json`), autenticándose con el header `Authorization: Bearer $CRON_SECRET`.

## Deploy en Vercel

1. Subí el repo a GitHub y importalo en [vercel.com/new](https://vercel.com/new).
2. Cargá las mismas variables de entorno del `.env` (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `CRON_SECRET`) en `Project Settings → Environment Variables`.
3. Agregá también `AUTH_URL` con la URL final de producción (ej. `https://tu-app.vercel.app`).
4. Antes del primer deploy (o cada vez que cambies el schema), corré las migraciones apuntando a Supabase:

   ```bash
   npm run db:deploy
   ```

5. Deployá. El cron de `vercel.json` se activa solo en el plan de Vercel; en el plan Hobby corre una vez por día.
