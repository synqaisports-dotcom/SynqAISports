-- Persistencia de preferencia de idioma por usuario (cross-device).
-- Seguro para re-ejecución: añade columna sólo si no existe.

alter table if exists public.profiles
  add column if not exists preferred_locale text;

-- Backfill básico para filas existentes sin valor.
update public.profiles
set preferred_locale = 'es'
where preferred_locale is null;

-- Default para nuevas filas.
alter table if exists public.profiles
  alter column preferred_locale set default 'es';

-- Guardarraíl simple: sólo códigos soportados hoy.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_preferred_locale_check'
  ) then
    alter table public.profiles
      add constraint profiles_preferred_locale_check
      check (preferred_locale in ('es', 'en', 'pt', 'de', 'fr', 'it', 'be', 'ar'));
  end if;
end $$;
