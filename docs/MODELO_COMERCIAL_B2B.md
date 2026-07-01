# Modelo comercial B2B — SynqAI ↔ Club ↔ Familias

**Versión:** 1.1 (refinamiento junio 2026)  
**Estado:** Alineado con dirección de producto  
**Complementa:** `docs/SYNQAI_DOCUMENTO_MAESTRO.md` §4  

---

## 1. Resumen en una frase

**SynqAI vende al club (B2B). El club cobra a las familias por su cuenta. SynqAI no usa Stripe para facturar al club** (transferencia / domiciliación SEPA / factura manual). El club puede repercutir 1–3 €/mes por niño y quedarse el margen.

---

## 2. Flujo de dinero

```text
PADRES ──(cuota que fija el club, a menudo por adelantado)──► CLUB
                                                                 │
CLUB ──(~0,50 €/niño/mes a SynqAI, factura mensual)────────────► SYNQAI
```

| Actor | Cobro | Quién gestiona el cobro |
|-------|-------|-------------------------|
| **Padres → Club** | 1–3 €/mes (o anual en matrícula) | El club (efectivo, bizum, su banco, su pasarela si quiere) |
| **Club → SynqAI** | ~0,50 €/niño/mes | SynqAI (factura + transferencia/SEPA, sin Stripe de momento) |

**SynqAI no toca la tesorería del club ni cobra a padres.** Eso simplifica legal, contable y operativa.

---

## 3. Por qué este modelo encaja

### 3.1 vs B2C (cobrar a cada padre)

| | B2C | B2B (acordado) |
|--|-----|----------------|
| Facturas/mes (500 clubes × 500 niños) | ~250.000 microcobros | **~500 facturas a clubes** |
| Comisiones pasarela | Altas (0,30 € + % por tx) | Casi nulas (SEPA/transferencia) |
| Impagos | Tarjetas caducadas, chargebacks | Relación comercial con 1 interlocutor |
| Escalabilidad contable | Mala | Buena |

### 3.2 El club como aliado (no como víctima del SaaS)

Argumento de venta:

> «La plataforma no es un gasto: es una línea de ingresos. Vosotros decidís cuánto repercutís (1, 2 o 3 €/mes). Nosotros cobramos 0,50 €/mes por niño. El resto es margen del club.»

**Ejemplo club 500 niños (mensual):**

| Repercute a padres | Coste SynqAI | Margen club/mes |
|--------------------|--------------|-----------------|
| 1,00 €/niño | 0,50 € | **250 €** |
| 2,00 €/niño | 0,50 € | **750 €** |
| 3,00 €/niño | 0,50 € | **1.250 €** |

Cobro **mes a mes** alinea tesorería: el club paga SynqAI a medida que recauda de las familias, sin desembolso único de miles de euros al inicio de temporada (menor barrera de entrada).

### 3.3 Cobro anual (opcional comercial)

Para clubes grandes o founding maduros se puede ofrecer **factura anual** (mejor cash flow para SynqAI). El argumento comercial por defecto sigue siendo **mensual** por flexibilidad y baja fricción.

---

## 4. Alineación con el documento maestro

El documento maestro ya planteaba B2B2C con club cobrando a familias y SynqAI al club. Este refinamiento **aclara**:

| Tema | Documento maestro | Refinamiento junio 2026 |
|------|-------------------|-------------------------|
| Cliente de pago SynqAI | Club | Igual |
| Cobro padres | Club (12–24 €/año) | Club decide; **1–3 €/mes** como argumento ágil |
| Pasarela SynqAI→club | No detallada | **Sin Stripe**; banca tradicional |
| Compensación por ads | Sí (`max(0, cuota − ads)`) | Sigue vigente para founding / clubes con signage |
| PPP por tamaño | 0,25–1,00 € | **0,50 €** como referencia comercial España |

No hay contradicción: el PPP y los ads son capas sobre la misma base B2B.

---

## 5. Implicaciones en producto (qué construir)

### 5.1 En fase cáscaras (ahora)

- Portal club: gestión cantera, metodología, comunicación — **valor visible** para justificar la cuota.
- Demo con `synq_rate_per_user_eur: 0.5` y `family_fee_annual_eur: 12` en club demo (`src/lib/demo.ts`).
- **No** hace falta módulo de pagos ni Stripe para avanzar.

### 5.2 Cuando haya BD (después)

| Módulo | Función |
|--------|---------|
| **Configuración club** | Cuota familiar de referencia, `synq_rate_per_user_eur`, idioma, founding |
| **SynqAI Admin** (interno) | Nº jugadores activos por club, facturación mensual, estado de pago |
| **Informe club** | «Tu margen estimado si repercutís X €» — herramienta de venta interna del club a padres |
| **App familias** | Canal del club; el cobro sigue siendo del club, no de SynqAI |

### 5.3 Qué NO construir (de momento)

- Suscripción Stripe padre ↔ SynqAI
- Wallet / tesorería del club dentro de SynqAI
- Facturación automática a padres por parte de SynqAI

**Excepción futura:** torneos con inscripción — el documento maestro reserva **Stripe del club** para inscripciones de evento, no para la cuota SaaS base.

---

## 6. Métricas clave

```text
MRR SynqAI = Σ (jugadores_activos_club × tarifa_synq_club)
Margen club plataforma = Σ (jugadores × (cuota_padre − tarifa_synq))  // si repercute
```

**Jugador activo** = niño con ficha en cantera y equipo activo (definición operativa a cerrar en BD).

Facturación SynqAI: **una línea por club por mes**, no una por jugador en contabilidad (el detalle va en albarán/factura desglosada).

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Club no repercute y percibe SynqAI como gasto | Argumento margen + founding 12 meses gratis; ads que reducen cuota |
| Impago club | Contrato anual, suspensión portal (no borrado datos), founding con compromiso |
| Padres rechazan cuota digital | Club elige precio (1 €); valor claro (horarios, convocatorias, metodología) |
| Complejidad contable por país | Facturación B2B nacional por entidad SynqAI; Latam PPP más bajo (doc. maestro) |

---

## 8. Mensaje comercial (elevator)

1. **Para el club:** «Ganáis entre 250 y 1.250 €/mes con 500 niños, solo por usar la plataforma. Vosotros ponéis el precio a las familias.»
2. **Para SynqAI:** «500 clientes B2B, facturación predecible, sin comisiones de 250.000 transacciones.»
3. **Para padres:** «Cuota del club con herramienta profesional; el club decide el importe.»

---

## 9. Conclusión de alineación

**Sí, vais alineados.** Lo que estáis construyendo (portal del club, cantera, personas, instalaciones, metodología, demo sin pagos) es exactamente la **cáscara de valor** que sostiene un SaaS B2B a 0,50 €/niño/mes. Posponer la BD no contradice el modelo: refuerza iterar UX y argumento comercial antes de atar datos y facturación.

Próximo paso natural cuando cerréis cáscaras críticas: módulo **Configuración → Cuota y repercusión** (solo números de referencia, sin cobrar) y **Admin interno** con conteo de jugadores activos para simular facturas.
