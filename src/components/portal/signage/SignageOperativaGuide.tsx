export function SignageOperativaGuide() {
  return (
    <div className="portal-section-surface rounded-xl p-5">
      <h2 className="font-medium">Operativa completa del signage</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Guía paso a paso para poner en marcha y gestionar varias pantallas en el club.
      </p>

      <ol className="mt-4 space-y-4 text-sm">
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">1. Preparar el contenido</p>
          <p className="mt-1 text-muted-foreground">
            En <strong>Patrocinadores</strong> crea los patrocinadores del club. En <strong>Contenido</strong> sube
            vídeos, imágenes o vincula animaciones de ejercicios. Puedes pausar cualquier ítem sin borrarlo.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">2. Montar la playlist</p>
          <p className="mt-1 text-muted-foreground">
            En <strong>Programación</strong> añade ítems a la playlist principal, define duración de cada slide y el
            horario activo (por defecto 10:00–22:00). Usa el previsualizador para comprobar el resultado antes de
            publicar.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">3. Emparejar cada pantalla (repetir por cada TV)</p>
          <p className="mt-1 text-muted-foreground">
            En la TV abre <code className="text-cyan-300">/play/pair</code> en el navegador (Fire Stick, Chromecast,
            Smart TV…). Aparece un código de 6 dígitos. En el portal ve a <strong>Pantallas → Emparejar pantalla</strong>,
            introduce el código, pon nombre (ej. &quot;TV Cafetería&quot;), zona y orientación horizontal o vertical.
          </p>
          <p className="mt-2 text-muted-foreground">
            <strong>¿Más pantallas?</strong> Repite este paso en cada TV. Cada emparejamiento crea una pantalla nueva
            con su propio token. Todas comparten la playlist principal del club salvo que les asignes una distinta al
            editar la pantalla.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">4. Playlists por zona (opcional)</p>
          <p className="mt-1 text-muted-foreground">
            En <strong>Programación</strong> puedes crear playlists distintas (Gym, Cafetería…). En{' '}
            <strong>Pantallas</strong> asigna la playlist correspondiente a cada TV.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">5. Formatos de archivo</p>
          <p className="mt-1 text-muted-foreground">
            Imágenes: <strong>JPG, PNG, WebP, GIF</strong> (máx. 10 MB). Vídeos: <strong>MP4, WebM</strong> (máx. 200 MB).
            Las fotos HEIC de iPhone no son compatibles — exporta como JPG antes de subir.
          </p>
        </li>
        <li className="rounded-lg border border-primary/10 bg-background/30 p-3">
          <p className="font-medium text-foreground">6. Reproducción automática</p>
          <p className="mt-1 text-muted-foreground">
            Tras emparejar, la TV redirige a <code className="text-cyan-300">/play/&#123;token&#125;</code> y rota el
            contenido. Fuera del horario activo muestra el escudo del club (standby). Pausar una pantalla la desactiva
            sin borrar su configuración.
          </p>
        </li>
      </ol>

      <div className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs text-cyan-200/80">
        <strong className="text-cyan-100">Resumen rápido:</strong> Contenido → Playlist → Emparejar TV (×N pantallas)
        → Opcional: playlist distinta por pantalla.
      </div>
    </div>
  );
}
