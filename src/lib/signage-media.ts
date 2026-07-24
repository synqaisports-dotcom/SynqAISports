export const SIGNAGE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const SIGNAGE_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'] as const;

export const SIGNAGE_AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav'] as const;

export const SIGNAGE_IMAGE_EXTENSIONS = 'JPG, PNG, WebP, GIF';
export const SIGNAGE_VIDEO_EXTENSIONS = 'MP4, WebM';
export const SIGNAGE_AUDIO_EXTENSIONS = 'MP3, WAV';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

export function isSignageImageMime(type: string): boolean {
  return (SIGNAGE_IMAGE_MIME_TYPES as readonly string[]).includes(type);
}

export function isSignageVideoMime(type: string): boolean {
  return (SIGNAGE_VIDEO_MIME_TYPES as readonly string[]).includes(type);
}

export function isSignageAudioMime(type: string): boolean {
  return (SIGNAGE_AUDIO_MIME_TYPES as readonly string[]).includes(type);
}

export function validateSignageUpload(file: File): { ok: true } | { ok: false; message: string } {
  if (isSignageImageMime(file.type)) {
    if (file.size > MAX_IMAGE_BYTES) {
      return { ok: false, message: 'too_large_image' };
    }
    return { ok: true };
  }
  if (isSignageVideoMime(file.type)) {
    if (file.size > MAX_VIDEO_BYTES) {
      return { ok: false, message: 'too_large_video' };
    }
    return { ok: true };
  }
  if (isSignageAudioMime(file.type)) {
    if (file.size > MAX_AUDIO_BYTES) {
      return { ok: false, message: 'too_large_audio' };
    }
    return { ok: true };
  }
  // HEIC y otros formatos de móvil
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic')) {
    return { ok: false, message: 'heic_not_supported' };
  }
  return { ok: false, message: 'invalid_type' };
}

export function signageUploadErrorMessage(code?: string): string {
  switch (code) {
    case 'invalid_type':
      return `Formato no válido. Imágenes: ${SIGNAGE_IMAGE_EXTENSIONS}. Vídeos: ${SIGNAGE_VIDEO_EXTENSIONS}.`;
    case 'heic_not_supported':
      return 'Las fotos HEIC (iPhone) no son compatibles. Exporta como JPG o PNG desde el móvil.';
    case 'too_large_image':
      return 'La imagen supera 10 MB. Comprímela o usa una resolución menor.';
    case 'too_large_video':
      return 'El vídeo supera 200 MB.';
    case 'too_large_audio':
      return 'El audio supera 20 MB.';
    case 'upload_error':
      return 'No se pudo subir el archivo. Comprueba que la migración signage-media está aplicada en Supabase.';
    case 'no_file':
      return 'Selecciona un archivo antes de guardar.';
    default:
      return 'Error al subir el archivo.';
  }
}

export async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export function fileExtensionForMime(type: string, filename: string): string {
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/gif') return 'gif';
  if (type === 'video/mp4') return 'mp4';
  if (type === 'video/webm') return 'webm';
  if (type === 'audio/mpeg' || type === 'audio/mp3') return 'mp3';
  if (type === 'audio/wav') return 'wav';
  return filename.split('.').pop()?.toLowerCase() ?? 'bin';
}
