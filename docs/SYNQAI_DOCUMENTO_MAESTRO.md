# SynqAI Sports — Documento maestro
## Nexus Labs · Producto, comercial, técnico y flujos de datos

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Planificación — sin desarrollo de producto hasta aprobación de este documento  
**Próximo entregable acordado:** App **Synq Coach Free** (Android) — mínimo cobrable vía publicidad  

---

## Índice

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Visión y posicionamiento](#2-visión-y-posicionamiento)
3. [Ecosistema de productos](#3-ecosistema-de-productos)
4. [Modelo comercial y económico](#4-modelo-comercial-y-económico)
5. [Estrategia GTM — Founding Clubs](#5-estrategia-gtm--founding-clubs)
6. [Web pública e index](#6-web-pública-e-index)
7. [Portal club (web principal)](#7-portal-club-web-principal)
8. [Apps Android y Play Store](#8-apps-android-y-play-store)
9. [SynqAI Admin (app interna)](#9-synqai-admin-app-interna)
10. [TrendPulse (producto separado)](#10-trendpulse-producto-separado)
11. [Flujos de conexión y arquitectura](#11-flujos-de-conexión-y-arquitectura)
12. [Modelo de datos (Supabase)](#12-modelo-de-datos-supabase)
13. [Publicidad y monetización](#13-publicidad-y-monetización)
14. [Multiidioma, PPP y regiones](#14-multiidioma-ppp-y-regiones)
15. [Seguridad, roles y permisos](#15-seguridad-roles-y-permisos)
16. [Proyección de mercado e ingresos](#16-proyección-de-mercado-e-ingresos)
17. [Roadmap por fases](#17-roadmap-por-fases)
18. [MVP Synq Coach Free — alcance futuro](#18-mvp-synq-coach-free--alcance-futuro)
19. [Riesgos y mitigaciones](#19-riesgos-y-mitigaciones)
20. [Glosario](#20-glosario)

---

## 1. Resumen ejecutivo

**SynqAI Sports** es un ecosistema digital B2B2C para **clubes deportivos de base** (empezando por fútbol), bajo el sello **Nexus Labs**. No compite con suites enterprise tipo 360Player en el mismo perfil: SynqAI permite que **el club gane dinero** (cuota digital a familias + patrocinadores) mientras SynqAI monetiza por **cuota escalada PPP**, **publicidad** y **módulos de evento**.

**Principios inquebrantables:**

| Principio | Descripción |
|-----------|-------------|
| **Pizarras nativas** | Dibujo táctico en Android/iOS nativo — nunca WebView en campo |
| **Dos pizarras** | Free (gancho viral) vs Club (conectada al club) — productos distintos |
| **Web = club** | Gestión, metodología, cantera, informes, configuración |
| **Apps = campo** | Entrenador, padres, signage, KDS |
| **Multiidioma desde v1** | ES, EN, PT mínimo; `locale` + `country_code` |
| **Pagos** | SynqAI **no gestiona tesorería** del club; factura B2B al club (~0,50 €/niño/mes, sin Stripe). El club cobra a padres por su cuenta. Ver `docs/MODELO_COMERCIAL_B2B.md` |
| **TrendPulse separado** | Rama `trendpulse`, Supabase A, deploy propio — no mezclar |

**Objetivo de mercado (horizonte):** ~0,7 % del mercado addressable (entrenadores + clubes). **Realista a 5 años:** 0,1–0,15 %. **Madrid 10 clubes** valida el primer tramo.

---

## 2. Visión y posicionamiento

### 2.1 Problema

- Clubes base: WhatsApp, Excel, cartones de patrocinador, varias sedes sin visibilidad.
- Entrenadores voluntarios: poca herramienta táctica gratuita de calidad nativa.
- Familias: sin canal oficial del club.
- Competencia (360Player, etc.): fuerte en admin y precio alto; onboarding semanas; el club **paga** sin margen claro.

### 2.2 Propuesta SynqAI

```text
Entrenador free (viral, ads)  →  Club founding/socio  →  Ecosistema 360
                                      │
                    Familias pagan 12–24 €/año al club
                    Club paga SynqAI solo max(0, cuota − ads)
                    Patrocinadores + signage = caja del club
```

### 2.3 Comparativa rápida

| | 360Player | SynqAI |
|--|-----------|--------|
| Cliente ideal | Club profesionalizado | Club base multi-sede |
| Precio | Suscripción alta + ventas | PPP + ads compensan |
| Club gana | No (gasto) | Sí (margen + patro) |
| Pizarra | Dentro de suite | **Nativa**, free + club |
| Torneo | Limitado | **Módulo + API** externos |
| Signage | No core | **TV 10:00–22:00** + evento |

---

## 3. Ecosistema de productos

### 3.1 Mapa general

```text
NEXUS LABS
│
├── WEB PÚBLICA (index) ─────────── vídeo, nosotros, form founding, login
│
├── PORTAL CLUB (web) ──────────── cerebro del club socio
│
├── SYNQAI ADMIN (web/app API) ─── métricas clientes; SIN pagos
│
├── APPS ANDROID (Play Store)
│   ├── Synq Coach (FREE)
│   ├── Synq Club Coach
│   ├── Synq Familias
│   ├── Synq Signage (TV/tablet)
│   ├── Synq KDS Campos
│   └── Synq Wear (Wear OS, fase 2)
│
├── WEB TORNEO (hosted) ────────── URL pública, padres evento, mesa
│
└── TRENDPULSE (rama aparte) ───── piloto delay intelligence
```

### 3.2 Synq Coach FREE

**Público:** entrenador suelto mundial.  
**Monetización:** publicidad (alta persistencia controlada).  
**Funciones:**

- Pizarra partido modo **vileda** (F7, F11, futsal): jugadores con nombre/dorsal, formaciones, dibujo libre.
- **Motor dibujo ejercicios** + microciclos (**máx. 2 semanas**): 1 calentamiento + 3 principales + 1 vuelta a la calma.
- **Mi equipo:** plantilla, posiciones, pasar lista (control local).
- **Liga manual:** competición, calendario, resultados, titular por partido.
- **Smartwatch:** cronómetro, rotaciones cada X min, modo “todos juegan”, marcador, finalizar partido; estados finalizado editable; reiniciar temporada con aviso.
- **Tablet sin red:** uso local; cola de métricas/house ads al recuperar WiFi.
- Vincular club: opcional (fase 2).

### 3.3 Synq Club Coach

**Público:** entrenadores del club socio.  
**Monetización:** ads **baja persistencia** (beneficio club en reparto).  
**Modos:** móvil (gestión) + tablet pizarra (campo).  
**Funciones:**

- Carga roster oficial del club.
- Plan del **director de metodología** (solo lectura + solicitud de cambio).
- Captura **asistencia** (solo presentes) → stats jugador + app padres.
- Partidos: ejecución en app/watch; gestión oficial en **web** (estilo MatchApp).
- Pizarra club: branding, plantillas, historial.

### 3.4 Synq Familias

**Público:** padres/madres.  
**Monetización:** ads baja persistencia + reparto club.  
**Funciones:**

- Multi-hijo, planificación visible, histórico asistencia/stats.
- Sección **club**: ofertas y patrocinadores.
- **Chat** del equipo.
- **Avisar falta** anticipada al entrenamiento.

### 3.5 Synq Signage

**Público:** TV/tablet en club o **solo evento torneo**.  
**Gestión:** web club. **Reproducción:** app Android TV.  
**Horario activo por defecto:** 10:00–22:00; OFF fuera (no penalizar eCPM).  
**Rotación:** patrocinadores club intercalados con **vídeo ads** (proporción ej. 3 patro : 1 vídeo).  
**Banners fijos** inferiores opcionales.

### 3.6 Synq KDS Campos

**Público:** director deportivo, metodología, dueño, coordinadores.  
**UI:** tarjetas por campo (entero/medio/cuarto), tiempo real, asistencia, próximo equipo.  
**Ads:** 2 banners inferiores baja persistencia.

### 3.7 Módulo torneos (web + web evento + API)

- **Planificador de ingresos** (inscripciones, patro, signage opcional, ads estimados).
- Generador competición, URL pública, **web padres torneo**, **web mesa** (tablet).
- **API** para clubes **no socios** y terceras apps: mismo motor; UIs hosted por SynqAI.
- Signage evento: **evaluable** (upsell).
- Más superficie **ads web** (URL + padres); mesa sin ads programáticos.

### 3.8 TrendPulse (separado)

- Rama Git: `trendpulse`. Deploy y **Supabase A** (`trend_*`) independientes.
- Radar scrape 48 h; piloto personal; no bloquea SynqAI.

---

## 4. Modelo comercial y económico

### 4.1 Flujo de dinero familiar → club → SynqAI

```text
FAMILIA ──(12–24 €/año anticipado)──► CLUB
                                        │
CLUB ── max(0, cuota_SynqAI − ads) ────► SYNQAI
                                        │
ADS programáticos ─────────────────────► compensan cuota primero
SOBRANTE ads (si ads > cuota) ─────────► 40 % club / 60 % SynqAI
PATROCINADORES signage ────────────────► 100 % CLUB (SynqAI no)
```

### 4.2 Cuota SynqAI al club (PPP, €/jugador/mes)

| Tamaño / región | Rango orientativo |
|-----------------|-------------------|
| Club grande (600+ jugadores) | 0,50 € |
| Club medio | 0,55–0,80 € |
| Club pequeño | hasta 1,00 € |
| Latam tier bajo | 0,25–0,35 € |
| USA / norte EU | 0,65–0,72 € |

**Ejemplo club 190 jugadores (España):** cuota bruta ~95 €/mes. Si ads ~80 €/mes → **club paga 15 €/mes**, no 95 €.

### 4.3 Precio familiar (decide el club)

| Nivel | €/mes | €/año |
|-------|-------|-------|
| Bajo | 1 € | 12 € |
| Alto | 2 € | 24 € |

Margen club (antes patro): familia − cuota SynqAI efectiva.

### 4.4 Torneos (ingreso puntual)

- Inscripción equipos/jugadores → **club** (Stripe del club en fase posterior).
- Fee técnico SynqAI / ads en URL y web torneo.
- Patrocinadores torneo → club.
- Signage evento → evaluable.

### 4.5 Qué SynqAI NO hace

- **SynqAI Admin:** no gestiona cobros a padres ni facturación club.
- **Index público:** sin tabla de precios.

---

## 5. Estrategia GTM — Founding Clubs

### 5.1 Programa

- **10 clubes gratis por país** × ~27 mercados = **270 clubes** año 1 (objetivo oleadas, no día 1).
- **12 meses:** cuota SynqAI **0 €**.
- **Ads programáticos año 1:** **100 % SynqAI** (sin reparto 40 %).
- **Patrocinadores:** 100 % club.
- Obligaciones: 1 TV signage 10–22 h, 60 %+ padres, responsable digital, caso de estudio.
- **Día 366:** PPP del país; reparto ads normal.

### 5.2 Por qué funciona

- Land grab multi-país + i18n real.
- Club gana con patro + cuota familiar; SynqAI con ads + año 2.
- Madrid 10 clubes ≈ prueba España.

---

## 6. Web pública e index

### 6.1 Contenido

| Sección | Notas |
|---------|-------|
| Hero con **vídeo** | No estático |
| Qué es SynqAI / ecosistema | |
| Founding club — formulario | País, jugadores, sedes |
| Quiénes somos | Nexus Labs |
| **Login** portal club | |
| Selector idioma | ES, EN, PT |

### 6.2 Excluido

- Precios públicos.
- Comparativas agresivas con nombres (interno solo).

### 6.3 Estilo

- Index: editorial + vídeo.
- Tras login: dashboard **tipo Fuse** (sidebar oscuro, cards KPI, gráficos).

---

## 7. Portal club (web principal)

### 7.1 Navegación

| Módulo | Contenido |
|--------|-----------|
| **Inicio** | KPIs: asistencia, apps, ocupación campos, próximos partidos |
| **Club** | Datos, dirección, tel, mail, portada, organigrama institucional |
| **Dirección deportiva** | Organigrama deportivo, coordinadores, entrenadores, PF, delegados |
| **Metodología** | Ejercicios (form + pizarra web creación), asignación por categoría, objetivos temporada, solicitudes cambio |
| **Cantera** | Equipos, jugadores, calendarios por sede, export/Google futuro |
| **Sedes y campos** | Entero/medio/cuarto, planificación semanal |
| **Patrocinadores** | CRUD, playlist signage, ofertas app padres |
| **Torneos** | Planificador ingresos, generador, URL, mesa, padres evento, API |
| **Signage** | Emparejar TVs, horarios, preview |
| **Configuración** | Apps, códigos, cuota digital referencia, idioma |
| **Informes** | Asistencia, adopción, signage, torneos, multi-sede |

### 7.2 Pizarra web vs nativa

| Uso | Tecnología |
|-----|------------|
| Crear ejercicio (metodología) | Web canvas |
| Partido / entreno en campo | **App nativa** |

### 7.3 Roles web

Presidente, director deportivo, director metodología, coordinador sección, tesorero (patro/torneos), entrenador (vista limitada).

---

## 8. Apps Android y Play Store

### 8.1 Una app por rol (recomendado)

| applicationId orientativo | Store |
|-------------------------|-------|
| `com.synqai.coach` | Synq Coach Free |
| `com.synqai.clubcoach` | Synq Club Coach |
| `com.synqai.families` | Synq Familias |
| `com.synqai.signage` | Synq Signage (TV) |
| `com.synqai.kds` | Synq KDS |

### 8.2 Políticas

- **Familias:** Google Play Families, Data safety, ads mínimos.
- **Coach free:** público entrenador adulto; AdMob etiquetado correctamente.
- Publicación: AAB, cuenta organización, internal → closed (founding) → production.

### 8.3 Orden publicación

1. Synq Coach Free  
2. Synq Familias + Club Coach (piloto)  
3. Signage  
4. KDS  
5. Wear OS  

---

## 9. SynqAI Admin (app interna)

- Lista clubes por país, founding, MAU por app.
- Estadísticas agregadas, API keys torneo externo.
- **Sin módulo de pagos ni tesorería.**
- Acceso solo staff Nexus/SynqAI.

---

## 10. TrendPulse (producto separado)

| | SynqAI | TrendPulse |
|--|--------|------------|
| Rama Git | `main` | `trendpulse` |
| Supabase | Proyecto B (`synq_*`) | Proyecto A (`trend_*`) |
| URL | synqai.net | trendpulse.* |
| Rol | Negocio principal | Piloto / caja ideas timing |

---

## 11. Flujos de conexión y arquitectura

### 11.1 Diagrama lógico

```text
                    ┌─────────────────┐
                    │  Web pública    │
                    └────────┬────────┘
                             │ login
                    ┌────────▼────────┐
                    │  Portal club    │◄──── SynqAI Admin (read metrics)
                    │  (Next.js)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌───────▼──────┐ ┌────▼─────┐
     │ Supabase B │  │ REST / RT    │ │ CDN ads  │
     │ synq_*     │  │ Edge funcs   │ │ creatives│
     └────────────┘  └───────┬──────┘ └──────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │           │           │           │           │
 Coach Free  Club Coach  Familias   Signage    KDS
     │           │           │           │           │
     └───────────┴───────────┴───────────┴───────────┘
                             │
                    Wear OS (companion)
```

### 11.2 Flujo founding club (onboarding)

```text
1. Form web → synq_founding_leads
2. SynqAI aprueba → crea synq_clubs + synq_users admin
3. Portal: datos club, sedes, patrocinadores
4. Genera código club + QR
5. Apps: emparejar TV signage, invitar entrenadores/padres
6. Founding: subscription_fee = 0 por 12 meses
7. Ads tracking → synq_ad_events (tenant_id)
```

### 11.3 Flujo metodología

```text
Director (web) crea ejercicio + dibujo → synq_exercises
         asigna microciclo → synq_microcycle_slots
App Club Coach sync → sesión en campo → asistencia → synq_attendance
         → informes + push padres
Entrenador solicita cambio → synq_change_requests → director aprueba (web)
```

### 11.4 Flujo torneo (socio o API externo)

```text
Organizador (web/API) crea synq_tournaments
         → equipos, calendario, campos
Web padres/mesa (hosted) ←→ API resultados en vivo
URL pública /t/{slug} ← lectura sin auth
Signage: playlist temporal synq_signage_playlists (scope=event)
Ads: synq_ad_events (scope=tournament)
```

### 11.5 Flujo signage 10:00–22:00

```text
Web define horario ACTIVO + playlist (patro + slots vídeo)
App Signage sync playlist + cache local
Dentro franja: rotación 30s fullscreen + banners
Fuera franja: STANDBY (sin impresiones ads)
Eventos impresión → cola offline → flush API
```

### 11.6 Autenticación

| Cliente | Método |
|---------|--------|
| Portal web | Supabase Auth (email) |
| Apps club | Auth + `club_id` + rol |
| Coach Free | Auth opcional / anónimo + device_id |
| URL torneo pública | Sin auth |
| Web padres torneo | Magic link / teléfono |
| Web mesa | PIN evento + campo |
| API externa | API key + `tenant_id` |

---

## 12. Modelo de datos (Supabase)

**Proyecto SynqAI (B)** — prefijo `synq_`. TrendPulse no comparte tablas.

### 12.1 Núcleo club

```sql
-- synq_clubs
id, name, slug, country_code, locale_default,
address, phone, email, cover_url, logo_url,
family_fee_annual_eur, synq_rate_per_user_eur,
founding_until, is_founding, timezone,
created_at

-- synq_sites (sedes)
id, club_id, name, address, lat, lng

-- synq_fields
id, site_id, name, division_type -- full | half_a | half_b | quarter_*

-- synq_staff
id, club_id, user_id, role -- president | sport_director | methodology | coordinator | coach | physio | delegate
section_tag -- F7, F11, futsal...

-- synq_teams
id, club_id, site_id, name, category, sport -- football | futsal | ...

-- synq_players
id, club_id, team_id, display_name, jersey_number, position, birth_year, active

-- synq_player_guardians (enlace padre)
id, player_id, user_id, phone, email
```

### 12.2 Metodología

```sql
-- synq_exercises
id, club_id, title, objectives, duration_min, materials, drawing_json, notes, created_by

-- synq_category_goals
id, club_id, category, season, goals_text, checklist_json

-- synq_microcycles
id, club_id, team_id, week_start, week_number

-- synq_microcycle_slots
id, microcycle_id, session_date, slot_type -- warmup | main | cooldown
exercise_id, order_index

-- synq_change_requests
id, club_id, exercise_id, requested_by, reason, status, resolved_by
```

### 12.3 Operativa y asistencia

```sql
-- synq_sessions (entrenos)
id, club_id, team_id, field_id, planned_start, actual_start, actual_end, status

-- synq_attendance
id, session_id, player_id, status -- present | absent_advised | absent
recorded_at

-- synq_matches (competición club web)
id, club_id, team_id, opponent, home_away, scheduled_at, field_id,
status -- draft | live | paused | finished
score_home, score_away, editable_log_json
```

### 12.4 Patrocinadores y signage

```sql
-- synq_sponsors
id, club_id, name, logo_url, tier, url, active_from, active_until

-- synq_signage_devices
id, club_id, device_code, name, last_seen_at

-- synq_signage_schedules
id, club_id, active_from_hour, active_to_hour -- default 10, 22
days_mask

-- synq_signage_playlists
id, club_id, scope -- club | tournament
tournament_id nullable, items_json -- [{type:sponsor|video_ad|banner, ref_id, duration_sec}]
```

### 12.5 Torneos

```sql
-- synq_tournaments
id, club_id nullable, tenant_type -- member | api_external
name, slug, sport, format_json, public_url

-- synq_tournament_teams
id, tournament_id, name, club_name_external

-- synq_tournament_matches
id, tournament_id, field_label, scheduled_at, status, score_home, score_away

-- synq_tournament_registrations
id, tournament_id, player_name, guardian_email, paid_flag, qr_code

-- synq_api_keys (externos)
id, org_name, key_hash, scopes, rate_limit
```

### 12.6 Ads y métricas

```sql
-- synq_ad_events
id, club_id nullable, app_surface, event_type -- impression | click
device_id, tournament_id nullable, ecpm_est, created_at

-- synq_club_metrics_daily (agregado)
club_id, date, ad_impressions, ad_revenue_est, active_parents_pct, ...
```

### 12.7 Coach Free (puede ser local-first + sync opcional)

```sql
-- synq_free_coaches (opcional cloud backup)
device_id, locale, created_at

-- synq_free_teams, synq_free_sessions, synq_free_leagues
-- (SQLite en dispositivo; sync opcional fase 2)
```

### 12.8 RLS (Row Level Security)

- Todas las tablas `synq_*` con `club_id` → políticas por rol staff.
- Torneo público: lectura `synq_tournament_matches` vía slug anon.
- Admin SynqAI: service role separado, no expuesto a apps.

---

## 13. Publicidad y monetización

### 13.1 Superficies

| Superficie | Persistencia | Beneficiario (normal) | Founding año 1 |
|------------|--------------|----------------------|----------------|
| Coach Free | Alta controlada | SynqAI | SynqAI |
| Club Coach | Muy baja | Reparto | 100 % SynqAI |
| Familias | Muy baja | Reparto | 100 % SynqAI |
| KDS | 2 banners | Reparto | 100 % SynqAI |
| Signage 10–22h | Rotación 30s + vídeo | Reparto / SynqAI | 100 % SynqAI |
| URL torneo | Media | SynqAI | SynqAI |
| Web padres torneo | Baja | SynqAI | SynqAI |

### 13.2 Signage — impresiones (1 TV, 12 h/día, 30 días)

| Concepto | Impresiones/mes |
|----------|-----------------|
| Fullscreen slots | 43.200 |
| De ellos vídeo ads (3:1) | ~10.800 |
| Banners inferiores (×2) | 43.200 c/u |

### 13.3 Fórmula ingreso club → SynqAI

```text
pago_mes = max(0, cuota_bruta − ads_programáticos_club)
ingreso_synq = cuota_bruta (vía ads + pago club)
si ads > cuota: extra_club = 0.4 × (ads − cuota)
```

---

## 14. Multiidioma, PPP y regiones

| Campo | Uso |
|-------|-----|
| `user.locale` | UI app/web |
| `club.country_code` | PPP, moneda display, eCPM bucket |
| `club.timezone` | Signage 10:00–22:00 local |

**Idiomas fase 1:** ES, EN, PT.  
**Fase 2:** FR, IT, DE.

---

## 15. Seguridad, roles y permisos

| Rol | Portal | Apps |
|-----|--------|------|
| Admin club | Todo club | — |
| Director deportivo | Deportivo, cantera, sedes, informes | KDS |
| Metodología | Metodología, informes técnicos | — |
| Coordinador | Su sección | Club coach |
| Entrenador | Vista limitada web | Club coach |
| Padre | — | Familias |
| Mesa torneo | — | Web mesa PIN |
| SynqAI staff | Admin app | — |

Menores: datos mínimos; consentimiento tutor; cumplimiento RGPD / LOPDGDD.

---

## 16. Proyección de mercado e ingresos

### 16.1 Objetivo 0,7 % (maduro, mix global)

| Fuente | Ingreso anual orientativo |
|--------|---------------------------|
| ~3.000 clubes activos | ~2,7 M€ cuota efectiva |
| ~80.000 coaches free | ~0,17 M€ ads |
| **Total SynqAI** | **~3 M€/año** |

### 16.2 Realista 5 años

| % mercado | Ingreso SynqAI/año |
|-----------|-------------------|
| 0,1–0,15 % | 0,5–1 M€ |
| Founding 270 clubes año 1 | ~0,2 M€ solo ads |

### 16.3 Madrid 10 clubes

~1.000 €/mes temporada SynqAI (cuota efectiva + ads) — validación semilla.

---

## 17. Roadmap por fases

| Fase | Entregable | Cobro |
|------|------------|-------|
| **0** | Este documento + aprobación | — |
| **1** | **Synq Coach Free** Android + AdMob + pizarra nativa mínima | **Ads** |
| **2** | Index web + login + club mínimo (datos, códigos) | Founding |
| **3** | Familias + Club Coach + asistencia | Founding + ads |
| **4** | Patrocinadores + Signage | Patro club + ads |
| **5** | Metodología + cantera + informes | Cuota año 2 |
| **6** | Torneos + API externa | Fee evento + ads |
| **7** | KDS + Wear | Ads |

---

## 18. MVP Synq Coach Free — alcance futuro

> **Nota:** Desarrollo **solo tras tu vía libre**. Lista acordada para primer entregable cobrable.

### 18.1 Incluido MVP v1

| # | Item | Criterio aceptación |
|---|------|---------------------|
| 1 | Pizarra nativa F7/F11/futsal | Arrastrar jugadores, flechas, deshacer |
| 2 | Mi equipo (1) | Nombre, dorsal, posición |
| 3 | Microciclo ×2 semanas | Estructura 1+3+1, local SQLite |
| 4 | Dibujo ejercicio básico | Guardar en sesión |
| 5 | Liga manual ×1 | Partidos, resultado, finalizado |
| 6 | Titular partido en pizarra | Desde plantilla |
| 7 | AdMob banner | Fuera de canvas; política no intrusiva |
| 8 | i18n ES + EN | Cadenas externalizadas |
| 9 | Offline-first entreno | Sin red en campo |
| 10 | Play internal testing | AAB firmado |

### 18.2 Excluido MVP v1

- Watch, vincular club, sync cloud, interstitials agresivos, multi-equipo ilimitado.

### 18.3 Testing (agente)

- Unit tests motor geometría pizarra.
- UI test crear sesión + marcar asistencia.
- Test offline sin crash.
- Lint + build release.
- Checklist AdMob en dispositivo real.

### 18.4 Tu parte mínima

- Cuenta Play Console organización.
- AdMob app id.
- Prueba en 1 tablet Android 30 min.
- Feedback pizarra “vileda”.

---

## 19. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Scope creep | Este documento + fases |
| Families policy | App padres separada; coach free adulto |
| Ads bajos al inicio | Coach free global no depende de club |
| Founding gratis forever | Contrato 12 meses automático |
| Dos Supabase | Documentado; nunca mezclar env |
| Pizarra WebView | Prohibido en partido |

---

## 20. Glosario

| Término | Definición |
|---------|------------|
| **PPP** | Precio por país según poder adquisitivo |
| **Founding** | Club 10/país año 1 sin cuota SynqAI |
| **KDS** | Panel tiempo real ocupación campos (como cocina hostelería) |
| **Cuota efectiva** | Lo que SynqAI ingresa = ads + pago neto club |
| **House ad** | Creativo patrocinador cacheable offline |
| **SAM** | Mercado realmente abordable por SynqAI |

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Producto / Nexus Labs | | | |
| SynqAI — visión comercial | | | |

---

**Fin del documento maestro v1.0**

*Siguiente paso tras aprobación: desarrollo MVP Synq Coach Free según sección 18.*
