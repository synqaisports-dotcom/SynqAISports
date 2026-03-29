## SynqAI Sports — Modelo de negocio y arquitectura (memoria de producto)

Este documento resume el **modelo de negocio** y las **implicaciones técnicas** declaradas para SynqAI Sports, con el objetivo de mantener una “memoria persistente” del producto y evitar pérdida de contexto a futuro.

---

## 1) Qué es SynqAI Sports

SynqAI Sports **no es una app**: es una **plataforma** de **arbitraje financiero y publicitario** para el deporte federado mundial, apoyada por:

- **Ecosistema Pro** (Club / Administración / Operativa interna): orientado a gestión, sin publicidad en áreas clave.
- **Ecosistema Consumer** (Entrenador / Tutor / Jugador / Sandbox / “terminales de acceso”): orientado a uso masivo, con publicidad dinámica y mecanismos de captación.

La arquitectura debe soportar **cientos de miles de usuarios concurrentes** y permitir **facturación dinámica por país** (PPP).

---

## 2) Mercado objetivo y escala

- Mercado objetivo: \(>\) 1.400M licencias federadas (deportes de equipo).
- Objetivo de penetración inicial citado: **0,07% global**.
- El “éxito” del producto depende de:
  - **Multi‑tenant real** por club (aislamiento estricto).
  - **Motor gráfico universal** multi‑deporte (coordenadas relativas/porcentuales).
  - Un sistema de **liquidación** y **descuento por publicidad** que sea auditable.

---

## 3) Modelo de ingresos híbrido (Pro vs Consumer)

### 3.1 Ecosistema Pro (Club / Gestión)

- **Sin publicidad** (en especial en **Metodología** y **Dashboard Club**).
- El club paga un **Fee base** (ajustado por **PPP**).
- El club tiene **soberanía de precios**: puede cobrar a sus socios lo que estime (por ejemplo 2–3€/mes) generando cash‑flow inmediato.

### 3.2 Ecosistema Consumer (Entrenador/Tutor/Jugador/Sandbox/Terminales)

- **Con publicidad dinámica** (AdMob/AdSense u otros).
- **Revenue share 60/40**:
  - 60% SynqAI
  - 40% Club (acumulado en un “wallet” para descontar de la factura mensual Pro).

### 3.3 Política clave de ads

- La publicidad se considera **parte del motor de financiación** del ecosistema.
- El club puede preferir que “se maneje todo lo que se pueda y lleve publicidad” en las terminales Consumer, porque **repercute en su bolsillo** (wallet/discount).
- Excepción explícita: **sin ads en Metodología y Dashboard Club** (áreas Pro críticas).

---

## 4) Sandbox como puerta de entrada (captación + primera fuente de ingresos)

El **Sandbox** es una **micro‑app/demo** pensada como “puerta de entrada” para entrenadores:

- Se comercializa con **vídeos/reels** en redes y **QR** asociados.
- El objetivo es que el entrenador, al ver capacidades (“qué es eso de SynqAI…”), se registre y luego su club valore la adopción.

### 4.1 Filosofía de coste

- El Sandbox se plantea como un entorno **localStorage-first** (casi 100% local) para **controlar coste de BBDD**.
- Se acepta incluso la existencia de **duplicidades** (un entrenador en PC no ve lo mismo en tablet si no se sincroniza), porque:
  - El entorno local reduce coste.
  - El volumen puede monetizar por ads (impresiones) y aún así crear captación.

### 4.2 Contenido/funciones del Sandbox (declaradas)

- Smartwatch (y configuración relacionada).
- “Mis partidos” abre:
  - **Pizarra Partido**, o
  - **Modo Continuidad** si no puede abrir Partido (o como hub de conexión).
- “Agenda promo” (local).
- Limitaciones de uso (ej. limitación de sesiones y microciclos) para mantener el formato demo.
- Cola offline y proceso de escucha que:
  - almacena eventos/paquetes (p.ej. publicidad/impresión y ejercicios creados) cuando no hay red,
  - al recuperar red sincroniza “por detrás”.

### 4.3 Operativa del QR / registro

- Los QR promo tienen **limitación** (ej. “primeros entrenadores de un país”).
- El entrenador debe entrar por internet para registrarse: en el registro se vincula:
  - identidad (email/usuario),
  - campaña/QR,
  - auditoría de usuario (admin/global users).

---

## 5) Modo Continuidad como “hub” de conexión

El **Modo Continuidad** se define como:

- Un **hub de sincronización** entre terminales (tablet/móvil/reloj).
- En Sandbox:
  - conecta con “modo partido” de la pizarra,
  - permite registrar eventos incluso sin tablet vinculada,
  - sube cola de publicidad cuando no hay red (y hace flush en background al volver).

---

## 6) Facturación del club y relación con ads

Modelo declarado para el club:

- El club paga “por jugador” (licencia) y se descuenta un % en función de la publicidad generada (wallet).
- El club puede cobrar anual/mensual a sus socios lo que quiera (soberanía de precios).
- La arquitectura debe facilitar:
  - métricas fiables en Consumer (impressions/clicks/tiempo),
  - imputación por club/país/campaña,
  - liquidación 60/40 y descuento en factura.

---

## 7) Multi‑deporte (estrategia)

- Lanzamiento inicial: **Fútbol**.
- Cuando exista una “versión hiper pro” de pizarras, se replica a deportes minoritarios con ganas de tecnología y menos presupuesto.
- El Sandbox por deporte o la app de club puede ayudarles a financiarse vía ads.

Implicación técnica clave:
- La pizarra debe usar **coordenadas relativas (%)** (motor gráfico universal) para soportar campos/canchas diferentes con el mismo código.

---

## 8) Implicaciones técnicas (principios de arquitectura)

### 8.1 Aislamiento y seguridad

- **Aislamiento estricto por `clubId`** (multi‑tenant) como base.
- RLS en Supabase y guardas en API/rutas.
- En modo local (Sandbox), las claves deben ser **scoped** y migrables.

### 8.2 Robustez en dispositivos antiguos / tablet

Requisito de producto:
- La experiencia en tablet debe ser buena y el sistema no debe “morir” en equipos antiguos.

Consecuencia técnica:
- Modo “perf‑lite” (degradación automática) para reducir:
  - blur/sombras,
  - animaciones continuas,
  - renders costosos del canvas,
  - watchers/polling agresivo.

### 8.3 Offline-first y sincronización en background

- Cola local (eventos/ads/ejercicios).
- Reintentos con backoff.
- Estado visible (“en cola / sincronizando / último OK”).
- El Pro debe permanecer limpio y consistente, incluso si Consumer genera cola masiva.

---

## 9) Notas de implementación (reglas operativas)

- **Pro**: sin ads en **Metodología** y **Dashboard Club**.
- **Consumer/Sandbox/Terminales de acceso**: ads habilitables y tracking para wallet.
- El Sandbox puede ser “ecosistema que crece solo” (entrenador con club o colegio), sin preocuparse por sincronía multi‑dispositivo si no hay backend (beneficio: coste controlado).

---

## 10) Pendientes por especificar (para convertir a roadmap)

Para convertir este documento en tareas concretas, faltan definiciones cerradas:

- Límite exacto de QR por país/campaña (X, ventana temporal, reintentos).
- Límite exacto de sesiones/microciclos (por usuario/campaña/dispositivo).
- Regla exacta “Mis partidos abre Partido o Continuidad” (prioridad por contexto/red).
- Definición del “beneficio” del entrenador por traer al club (referral).
- Esquema de wallet y liquidación (eventos contables mínimos y periodicidad).

