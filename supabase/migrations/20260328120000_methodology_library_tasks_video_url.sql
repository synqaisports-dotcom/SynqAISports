-- Metodología: vídeo opcional por ejercicio (YouTube/Vimeo).
-- Campo no obligatorio; validación fuerte se hace en API.

ALTER TABLE public.methodology_library_tasks
  ADD COLUMN IF NOT EXISTS video_url text;

CREATE INDEX IF NOT EXISTS methodology_library_tasks_club_video_idx
  ON public.methodology_library_tasks (club_id)
  WHERE video_url IS NOT NULL;

