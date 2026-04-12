# Internacionalización y alcance global (50 países)

Documento de **Fase 2**: cómo está montado el multi-idioma hoy y cómo escalar a **soporte global** (UE + América + otros mercados) sin reescribir la app.

## 1. Estado actual en código

| Pieza | Ubicación | Comportamiento |
|-------|-----------|----------------|
| Locales soportados UI | `src/lib/i18n-config.ts` → `AVAILABLE_LOCALES` | 8 códigos: `es`, `en`, `pt`, `de`, `fr`, `it`, `be`, `ar` (RTL) |
| Diccionarios | `public/locales/{code}.json` | Carga dinámica vía `fetch` en `I18nProvider` |
| Persistencia | `localStorage` `synq_locale_v1` + `profiles.preferred_locale` + `user_metadata` | Orden de resolución en `i18n-context.tsx` |
| Restricción DB | `profiles_preferred_locale_check` (migración) | Debe alinearse al añadir códigos nuevos |

## 2. Flujo de resolución de idioma

1. `localStorage` (`synq_locale_v1`) si existe.  
2. `profile.preferredLocale` (Supabase).  
3. `user.user_metadata.preferred_locale`.  
4. `navigator.language` (normalizado al código base `xx`).  
5. `DEFAULT_LOCALE` (`es`).

`setLocale` actualiza estado, `localStorage` y **`profiles.preferred_locale`** vía `auth-context`.

## 3. Arquitectura para “50 países”

**País ≠ idioma**: un mismo idioma cubre muchos países (p. ej. `es` → 20+ países; `en` → USA, UK, IE, etc.). El producto debe separar:

| Concepto | Uso |
|----------|-----|
| **Locale UI** (`es`, `en`, `pt-BR`…) | Textos, `document.documentElement.lang`, formatos fecha/número vía `Intl` |
| **Región / mercado** (opcional) | Impuestos, moneda, normativa deportiva, contenido legal; puede ser `NEXT_PUBLIC_MARKET` o campo club |
| **Zona horaria** | `Intl` + almacenar `timezone` en perfil o club si hace falta |

### Roadmap recomendado

1. **Fase 2a (ahora)**  
   - Documentar convención: claves `snake_case` o `dotted.path` en JSON.  
   - Añadir a `i18n-config` solo los idiomas con **diccionario completo mínimo** (login, store, sandbox shell).  
   - Ampliar `profiles_preferred_locale_check` **solo** cuando se añada un código nuevo a `AVAILABLE_LOCALES`.

2. **Fase 2b**  
   - Extraer strings críticos de marketing (`/`, `/store`) a `public/locales`.  
   - Usar `t('key')` en componentes nuevos; refactor gradual en legacy.

3. **Fase 2c (escala)**  
   - Evaluar **formatjs** / **next-intl** si el volumen de claves supera ~500 o se necesita ICU plural/género.  
   - **Sub-locales** (`pt-BR` vs `pt-PT`) como archivos `pt-br.json` o clave `pt` + región en metadata.

4. **Legal / datos**  
   - Páginas `/contacto`, `/precios`, RGPD: por región vía rutas `/[locale]/...` o CMS; fuera del scope del solo `t()`.

## 4. Lista de mercados (referencia 50+)

Para planificación comercial (no obligatoria en código hoy): agrupar por **idioma primario** y después por **país** (ISO 3166-1 alpha-2 en leads, clubs, facturación).

Ejemplos de cobertura típica:

- **Español**: ES, MX, AR, CO, CL, PE, UY, PY, BO, EC, CR, PA, GT, HN, NI, SV, DO, VE…  
- **Inglés**: US, GB, IE, AU, NZ, ZA, IN (inglés), SG…  
- **Portugués**: BR, PT, AO, MZ…  
- **Francés**: FR, BE, CH (fr), CA (qc), SN, CI…  
- **Alemán / italiano / árabe**: DACH, IT, MENA según estrategia.

El **formulario Sandbox** ya captura `country`; alinear etiquetas con ISO en un desplegable futuro mejora analítica “por país”.

## 5. Checklist al añadir un idioma

1. Añadir entrada en `AVAILABLE_LOCALES` (`i18n-config.ts`).  
2. Crear `public/locales/{code}.json` (copiar `en.json` como plantilla).  
3. Migración SQL: extender `profiles_preferred_locale_check` con el nuevo código **si** la constraint existe.  
4. Probar cambio en Sidebar + persistencia tras recarga.

## 6. Variables de entorno (opcional)

| Variable | Propósito |
|----------|-----------|
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Override del default (futuro; hoy `DEFAULT_LOCALE` en código) |

---

*Este documento cierra el criterio de aceptación de la Fase 2 relativo a arquitectura e internacionalización.*
