export type Locale = 'es' | 'en';

export const locales: Locale[] = ['es', 'en'];
export const defaultLocale: Locale = 'es';

export type Dictionary = {
  nav: {
    model: string;
    calculator: string;
    modules: string;
    founding: string;
    about: string;
    login: string;
  };
  hero: {
    tag: string;
    title: string;
    body: string;
    ctaCalc: string;
    ctaFounding: string;
    ctaPortal: string;
  };
  founding: {
    title: string;
    subtitle: string;
    clubName: string;
    contactName: string;
    contactEmail: string;
    country: string;
    players: string;
    sites: string;
    message: string;
    submit: string;
    success: string;
    error: string;
    notConfigured: string;
  };
  about: {
    title: string;
    body: string;
  };
  login: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    back: string;
    error: string;
    notConfigured: string;
  };
};

const es: Dictionary = {
  nav: {
    model: 'Modelo',
    calculator: 'Calculadora',
    modules: 'Módulos',
    founding: 'Founding',
    about: 'Nosotros',
    login: 'Acceso club',
  },
  hero: {
    tag: 'Plataforma 360 para clubes',
    title: 'El club cobra a las familias. SynqAI cobra al club. Todos ganan.',
    body: 'Ecosistema digital para fútbol base y multi-deporte: entrenadores, padres, pantallas y gestión. El club fija el precio familiar — 12 € o 24 € al año por niño — y retiene el margen sobre la cuota SynqAI desde 0,50 €/usuario/mes.',
    ctaCalc: 'Simular ingresos del club',
    ctaFounding: 'Solicitar founding club',
    ctaPortal: 'Entrar al portal del club',
  },
  founding: {
    title: 'Founding club',
    subtitle: '10 clubes por país, año 1 sin cuota SynqAI. Cuéntanos tu club.',
    clubName: 'Nombre del club',
    contactName: 'Persona de contacto',
    contactEmail: 'Email',
    country: 'País (código ISO, ej. ES)',
    players: 'Jugadores aprox.',
    sites: 'Sedes',
    message: 'Mensaje (opcional)',
    submit: 'Enviar solicitud',
    success: 'Solicitud recibida. Te contactaremos pronto.',
    error: 'No se pudo enviar. Inténtalo de nuevo.',
    notConfigured: 'Formulario disponible cuando Supabase esté configurado en producción.',
  },
  about: {
    title: 'Quiénes somos',
    body: 'SynqAI Sports es un producto de Nexus Labs. Construimos herramientas para clubes de base: pizarra nativa para entrenadores, app familias, digital signage y portal de gestión. TrendPulse (inteligencia de tendencias) es un producto separado.',
  },
  login: {
    title: 'Portal del club',
    subtitle: 'Acceso para directivos y staff del club.',
    email: 'Email',
    password: 'Contraseña',
    submit: 'Entrar',
    back: 'Volver al inicio',
    error: 'Credenciales incorrectas o usuario sin club asignado.',
    notConfigured: 'Configura Supabase para habilitar el login.',
  },
};

const en: Dictionary = {
  nav: {
    model: 'Model',
    calculator: 'Calculator',
    modules: 'Modules',
    founding: 'Founding',
    about: 'About',
    login: 'Club login',
  },
  hero: {
    tag: '360 platform for clubs',
    title: 'Families pay the club. The club pays SynqAI. Everyone wins.',
    body: 'Digital ecosystem for grassroots football and multi-sport: coaches, parents, screens and management. The club sets the family fee — €12 or €24 per child per year — and keeps margin over SynqAI from €0.50/user/month.',
    ctaCalc: 'Simulate club revenue',
    ctaFounding: 'Apply for founding club',
    ctaPortal: 'Open club portal',
  },
  founding: {
    title: 'Founding club',
    subtitle: '10 clubs per country, year 1 with no SynqAI fee. Tell us about your club.',
    clubName: 'Club name',
    contactName: 'Contact person',
    contactEmail: 'Email',
    country: 'Country (ISO code, e.g. ES)',
    players: 'Approx. players',
    sites: 'Sites',
    message: 'Message (optional)',
    submit: 'Submit application',
    success: 'Application received. We will contact you soon.',
    error: 'Could not submit. Please try again.',
    notConfigured: 'Form available once Supabase is configured in production.',
  },
  about: {
    title: 'About us',
    body: 'SynqAI Sports is a Nexus Labs product. We build tools for grassroots clubs: native coach board, families app, digital signage and management portal. TrendPulse (trend intelligence) is a separate product.',
  },
  login: {
    title: 'Club portal',
    subtitle: 'Access for club directors and staff.',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    back: 'Back to home',
    error: 'Invalid credentials or user not linked to a club.',
    notConfigured: 'Configure Supabase to enable login.',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}
