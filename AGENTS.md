# AGENTS.md

## Cursor Cloud specific instructions

### Qué es este repo
Monorepo del sello **Nexus Labs** con dos apps Next.js 15 (App Router, React 19, TypeScript, Tailwind):

- **SynqAI Sports** (raíz `/`, paquete `@synqai/sports`): producto principal en la rama `main`. Landing en español con la **Calculadora club** (`src/components/ClubCalculator.tsx`), que es la funcionalidad central y es 100% client-side (no requiere backend).
- **Nexus** (corporativo, `apps/nexus`, paquete `@nexus-labs/nexus-web`): landing estática secundaria. Es un proyecto npm independiente (no hay npm workspaces), con su propio `package-lock.json`.
- **TrendPulse**: producto distinto que vive en la rama `trendpulse` (no en `main`); requiere su propia infraestructura. El `README.md` está parcialmente desactualizado y llama "TrendPulse" a la app raíz, pero en `main` la raíz es SynqAI Sports.

### Servicios y comandos
Comandos por app (ver `package.json` de cada una). Ambas usan el **puerto 9100** en dev, así que no se pueden correr a la vez sin cambiar el puerto (ej. `npx next dev -p 9101`).

- Dev (raíz): `npm run dev` → http://localhost:9100
- Build (raíz): `npm run build`
- Nexus: mismos scripts dentro de `apps/nexus`.

### Notas no obvias
- **No se requiere base de datos ni variables de entorno** para correr/probar SynqAI en `main`. Supabase es opcional: `src/lib/supabase.ts` (`getSynqSupabase()`) devuelve `null` si faltan las env vars y la app funciona igual. No hay Supabase CLI local; las migraciones (`supabase/migrations/*.sql`) se ejecutan a mano en un proyecto Supabase hosteado.
- **Lint no está configurado**: `npm run lint` ejecuta `next lint`, que sin un `.eslintrc` lanza un asistente interactivo y no puede correr de forma desatendida. No hay configuración de ESLint en el repo. La verificación de tipos sí ocurre durante `npm run build`.
- Node 22 / npm 10 funcionan correctamente (no hay `.nvmrc` ni campo `engines`).
