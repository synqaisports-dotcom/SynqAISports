export function TournamentOperativaGuide() {
  return (
    <div className="portal-section-surface rounded-xl p-5">
      <h2 className="font-medium">¿Dónde configuro cada cosa?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Flujo recomendado para un torneo de fin de semana con grupos y finales paralelas (Platinum, Gold…).
      </p>

      <ol className="mt-4 space-y-3 text-sm">
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">1. Configuración → Datos del torneo</p>
          <p className="mt-1 text-muted-foreground">
            Nombre, fechas, sede, deporte, reglas y estado (borrador → inscripción → en juego).
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">2. Configuración → Categorías</p>
          <p className="mt-1 text-muted-foreground">
            Sub-10, Sub-12… con número de grupos, equipos por grupo y nombres de bandejas (Platinum, Silver, Bronze…).
            Pulsa <strong>Generar competición</strong> para crear grupos, cruces y partidos.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">3. Configuración → Campos</p>
          <p className="mt-1 text-muted-foreground">
            Campo 1, Campo 2… Los horarios se asignan en la pestaña <strong>Horarios</strong>.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">4. Equipos</p>
          <p className="mt-1 text-muted-foreground">
            Invita clubes, asigna grupo (A, B, C…) y envía el enlace delegado para confirmar plantilla.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">5. Horarios</p>
          <p className="mt-1 text-muted-foreground">
            Calendario por día y campo: hora, categoría, ronda y acceso a mesa móvil.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">6. Cruces</p>
          <p className="mt-1 text-muted-foreground">
            Clasificación de grupos y árboles eliminatorios por bandeja (todos los 1º a Platinum, 2º a Gold…).
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">7. Patrocinadores · Ticketing · Signage</p>
          <p className="mt-1 text-muted-foreground">
            Patrocinio del evento, entradas QR, taquilla PWA y muro de pantallas del torneo.
          </p>
        </li>
      </ol>

      <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-200/90">
        <strong className="text-cyan-100">PWA sin portal:</strong>{' '}
        <code className="text-cyan-300">/torneo/demo</code> — web pública, mesa, delegado y taquilla.
      </div>
    </div>
  );
}
