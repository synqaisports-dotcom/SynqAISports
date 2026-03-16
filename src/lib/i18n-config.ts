
/**
 * @fileOverview Configuración Maestra de Idiomas SynqAI.
 * Soporta la expansión global v10.1.0
 */

export interface Locale {
  code: string;
  label: string;
  flag: string;
  dir?: 'ltr' | 'rtl';
}

export const AVAILABLE_LOCALES: Locale[] = [
  { code: 'es', label: 'Castellano', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'be', label: 'België', flag: '🇧🇪' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪', dir: 'rtl' },
];

export const DEFAULT_LOCALE = 'es';
