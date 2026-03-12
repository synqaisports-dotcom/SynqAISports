
# SynqSports Pro - ARCHITECTURE_LEDGER v9.8.0 (Edición Integrada)

Este documento es el registro maestro inmutable de la arquitectura técnica, protocolos de seguridad y flujos de trabajo de SynqSports Pro.

## 5. Protocolo de Pizarra y Dibujo (v9.8.0)

### 5.6. Edición Directa en Toolbar (v9.8.0)
- **Toolbar Text Control**: Sustitución del botón de edición por un campo Input directo en la barra de herramientas. Permite modificar consignas en tiempo real sin perder el foco de la pizarra.
- **Prioridad de Renderizado**: Los textos se dibujan siempre en la última fase del ciclo para evitar bloqueos por otros objetos.
