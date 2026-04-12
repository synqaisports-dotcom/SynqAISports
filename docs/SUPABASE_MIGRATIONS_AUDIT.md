# Auditoría técnica — `supabase/migrations`

Revisión **archivo por archivo** (20 migraciones) y cruce con funcionalidades recientes: **Outbox** (`sandbox_device_snapshots`), **SQLite** (solo cliente; Supabase = ingest), **Leads** (`sandbox_terminal_leads`), **Incidencias** (`operativa_mobile_incidents`), **Ads** (`ad_events_queue`).

---

## Inventario cronológico

| Archivo | Ámbito |
|---------|--------|
| `20250324190000_synq_roles_profile_roles_rls.sql` | `synq_roles`, `profile_roles`, RLS `profiles`/`clubs`/`exercises`/`athletes`/`matches`, helpers `is_superadmin`, `auth_club_id`, `auth_role_text` |
| `20260324120000_promo_campaigns.sql` | `promo_campaigns`, `promo_campaign_events`, RPC `record_promo_scan`, RLS superadmin |
| `20260325120000_methodology_library_tasks.sql` | `methodology_library_tasks` + RLS club |
| `20260326130000_operativa_sessions_core.sql` | `methodology_session_assignments`, `methodology_change_requests`, `methodology_session_attendance` + RLS |
| `20260326150000_admin_global_plans.sql` | `global_plans` + RLS |
| `20260326153000_admin_global_audit_logs.sql` | `admin_audit_logs` + RLS |
| `20260326162000_admin_user_states.sql` | `admin_user_states` + RLS |
| `20260326170000_operativa_mobile_incidents.sql` | **Incidencias** continuidad + RLS club |
| `20260326190000_methodology_academy_state.sql` | `methodology_academy_state` + RLS |
| `20260326190500_methodology_warehouse_state.sql` | `methodology_warehouse_state` + RLS |
| `20260326201000_club_staff_access_matrix.sql` | `club_staff_access_matrices` + RLS |
| `20260326201500_club_staff_access_matrix_rls_fix.sql` | Ampliación SELECT staff |
| `20260326203000_club_staff_access_matrix_write_fix.sql` | Escritura `club_admin` + `academy_director` |
| `20260327183000_ad_events_queue.sql` | **`ad_events_queue`** + RLS (solo SELECT superadmin) + `service_role` |
| `20260410120000_ad_events_queue_anon_insert.sql` | **Anon INSERT** en `ad_events_queue` |
| `20260328120000_methodology_library_tasks_video_url.sql` | Columna `video_url` |
| `20260328123000_profiles_preferred_locale.sql` | `profiles.preferred_locale` |
| `20260328150000_club_memberships_option1.sql` | **`club_memberships`** |
| `20260411120000_sandbox_terminal_leads.sql` | **Leads** sandbox |
| `20260411180000_sandbox_device_snapshots.sql` | **Outbox ingest** + anon insert |

---

## Alineación con funcionalidades cerradas

| Funcionalidad | Tabla / vía | Estado en migraciones |
|---------------|-------------|------------------------|
| Outbox → API | `sandbox_device_snapshots` | Definida en abril; **INSERT anon** + **service_role** |
| Ads / SyncService | `ad_events_queue` | Marzo + abril **anon INSERT** |
| Leads `/sandbox/login` | `sandbox_terminal_leads` | Solo **service_role**; sin políticas = anon/auth **no** insertan vía PostgREST (correcto para API con service key) |
| Incidencias continuidad | `operativa_mobile_incidents` | Solo **authenticated** con ámbito club; **sin anon** (correcto: la app usa Bearer) |
| SQLite local | N/A en Supabase | Sin migración adicional requerida |

---

## Conflictos y riesgos detectados

### 1. `club_memberships.status` vs código TypeScript

- **Migración:** `CHECK (status IN ('active', 'inactive', 'invited'))`
- **Código (`supabase.ts`, API admin):** `'active' | 'pending' | 'blocked'`
- **Riesgo:** Inserciones/updates con `pending` o `blocked` **fallan** en SQL si solo existe el check antiguo.
- **Acción:** El script consolidado **amplía** el `CHECK` de forma compatible.

### 2. `club_staff_access_matrices` — permisos `GRANT`

- **Migración `20260326201000`:** solo `GRANT SELECT ... TO authenticated` (y `service_role` ALL).
- **Políticas posteriores:** `FOR ALL` / escritura para `club_admin` y `academy_director`.
- **Riesgo:** Sin `GRANT INSERT, UPDATE, DELETE`, los roles autenticados **no pueden escribir** aunque RLS permita (PostgreSQL exige ambos).
- **Acción:** El script consolidado añade **GRANT INSERT, UPDATE, DELETE** a `authenticated`.

### 3. `promo_campaigns` (marzo) — `DROP TABLE CASCADE`

- Recrea tablas desde cero. **Re-ejecutar en producción con datos** borraría campañas.
- **No es conflicto entre migraciones** si el orden histórico se aplicó una vez; es **riesgo operativo** si alguien pega ese archivo suelto en SQL Editor.

### 4. Triggers: `EXECUTE FUNCTION` vs `EXECUTE PROCEDURE`

- Varias migraciones usan **`EXECUTE FUNCTION`** (sintaxis Postgres 14+ / Supabase actual).
- En Postgres antiguo a veces se requiere **`PROCEDURE`**. Si algún entorno falla, sustituir según doc de Supabase.

### 5. Seguridad: `anon` + INSERT abierto

- **`ad_events_queue`** y **`sandbox_device_snapshots`:** política `WITH CHECK (true)` para **anon**.
- **Motivo en código:** previews sin `SUPABASE_SERVICE_ROLE_KEY`.
- **Riesgo:** Cualquiera con `anon` key puede insertar (abuso / spam). Mitigación típica: **WAF**, **rate limit** en API Gateway, o **solo service_role** en producción y anon solo en preview (configuración por proyecto, no solo SQL).

### 6. Febrero vs marzo vs abril

- **No hay nombres de migración duplicados** ni `CREATE TABLE` contradictorio entre abril y marzo para las mismas tablas de outbox/leads.
- **Dependencia lógica:** abril asume existencia de `ad_events_queue` (marzo) antes de `ad_events_queue_anon_insert` (abril). Orden de carpetas correcto.

### 7. Android Capacitor (Fase 4)

- **No añade tablas Supabase nuevas.** La app Android usa la misma API/web; **no se requiere** migración específica “Android” salvo alinear RLS/grants como arriba.

---

## Conclusión

- Las migraciones **abril** son **coherentes** con outbox y ads **si** se aplican **después** de las de marzo.
- Hay **dos correcciones de esquema/permisos** que conviene tener en base de datos aunque ya hayas corrido migraciones sueltas: **`club_memberships` check** y **`club_staff_access_matrices` GRANTs**.
- **Script consolidado en repo:** `supabase/migrations/20260412120000_consolidated_rls_grants_phase4.sql` — idempotente, con `IF EXISTS` por tabla; refuerza RLS/grants de **ad_events_queue**, **sandbox_device_snapshots**, **sandbox_terminal_leads**, **operativa_mobile_incidents**, corrige **club_memberships** CHECK y **club_staff_access_matrices** GRANTs.
