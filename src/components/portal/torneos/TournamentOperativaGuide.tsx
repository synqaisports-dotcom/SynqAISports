export function TournamentOperativaGuideContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Flujo recomendado para un torneo de fin de semana con grupos y finales paralelas (Platinum, Gold…).
      </p>

      <ol className="space-y-3 text-sm">
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">1. Crear torneo (asistente)</p>
          <p className="mt-1 text-muted-foreground">
            Define datos, categorías, campos y planificación horaria antes de crear. Cada categoría recibe su franja exclusiva.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">2. Ajustes → Generar competición</p>
          <p className="mt-1 text-muted-foreground">
            Por cada categoría, pulsa <strong>Generar competición</strong> para crear grupos, cruces y partidos.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium">3. Ajustes → Planificación</p>
          <p className="mt-1 text-muted-foreground">
            Revisa ventanas por categoría y pulsa <strong>Calcular horarios</strong>.
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

      <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-200/90">
        <strong className="text-cyan-100">PWA sin portal:</strong>{' '}
        <code className="text-cyan-300">/torneo/demo</code> — web pública, mesa, delegado y taquilla.
      </div>
    </div>
  );
}
