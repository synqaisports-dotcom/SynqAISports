import type { CanteraCategorySlug } from '@/lib/cantera-categories';

export type ObjectiveDimensionKey =
  | 'technique'
  | 'tactics'
  | 'physical'
  | 'psychological'
  | 'rules';

export type ObjectiveDimension = {
  key: ObjectiveDimensionKey;
  itemLabel: string;
  content: string;
};

export type CategoryObjectives = Record<ObjectiveDimensionKey, ObjectiveDimension>;

export type MethodologyObjectivesMap = Record<CanteraCategorySlug, CategoryObjectives>;

export type MethodologyStage = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  categorySlugs: CanteraCategorySlug[];
};

export const OBJECTIVE_DIMENSION_META: {
  key: ObjectiveDimensionKey;
  label: string;
}[] = [
  { key: 'technique', label: 'Técnica individual' },
  { key: 'tactics', label: 'Táctica básica' },
  { key: 'physical', label: 'Capacidades físicas' },
  { key: 'psychological', label: 'Factor psicológico' },
  { key: 'rules', label: 'Reglas del juego' },
];

export const METHODOLOGY_STAGES: MethodologyStage[] = [
  {
    id: 'discovery',
    emoji: '🐣',
    title: 'Etapa de descubrimiento e iniciación',
    subtitle: 'Primeros contactos con el fútbol y el juego en grupo',
    categorySlugs: ['debutantes', 'prebenjamin', 'benjamin'],
  },
  {
    id: 'transition',
    emoji: '🚀',
    title: 'Etapa de transición y desarrollo',
    subtitle: 'Del fútbol 7 al fútbol 11',
    categorySlugs: ['alevin', 'infantil'],
  },
  {
    id: 'specialization',
    emoji: '🔥',
    title: 'Etapa de especialización y rendimiento',
    subtitle: 'Complejidad táctica y orientación competitiva',
    categorySlugs: ['cadete', 'juvenil'],
  },
];

/** Objetivos formativos por categoría — referencia editable por el club. */
export const DEFAULT_METHODOLOGY_OBJECTIVES: MethodologyObjectivesMap = {
  debutantes: {
    technique: {
      key: 'technique',
      itemLabel: 'Primeros contactos',
      content: 'Conducir libremente, empujar el balón y pararlo con la planta.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Sentido del juego',
      content: 'Saber hacia qué portería atacar y cuál defender.',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Motricidad básica',
      content: 'Correr, saltar, frenar y evitar caídas.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Socialización',
      content: 'Apego al grupo, atención corta y juego libre sin presión.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Esenciales',
      content: 'No usar las manos (salvo el portero) y marcar en la portería correcta.',
    },
  },
  prebenjamin: {
    technique: {
      key: 'technique',
      itemLabel: 'Familiarización',
      content: 'Conducir con ambos pies, toques libres y "mimos" al balón.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Noción espacial',
      content: 'Evitar amontonarse detrás del balón (el efecto "enjambre").',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Psicomotricidad',
      content: 'Equilibrio, correr hacia atrás y coordinación ojo-pie.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Diversión',
      content: 'Aprender a seguir reglas simples y compartir el balón.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Básicas',
      content: 'Saques de banda simples, saques de centro y qué es un saque de meta.',
    },
  },
  benjamin: {
    technique: {
      key: 'technique',
      itemLabel: 'Refinamiento',
      content: 'Cambios de dirección, regates (fintas) y golpeo con empeine e interior.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Posicionamiento',
      content: 'Entender conceptos de amplitud, apoyo e inicio de la defensa individual.',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Agilidad y reacción',
      content: 'Velocidad gestual y cambios de ritmo mediante juegos.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Competitividad sana',
      content: 'Manejo de la frustración, trabajo en equipo y respeto.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Desarrollo',
      content: 'Faltas directas/indirectas, saques de esquina y cesión al portero.',
    },
  },
  alevin: {
    technique: {
      key: 'technique',
      itemLabel: 'Consolidación',
      content:
        'Pase largo, control orientado, juego aéreo básico y uso consciente de la pierna no hábil.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Movimientos',
      content:
        'Desmarques de ruptura y apoyo, permutas, coberturas y transiciones básicas (ataque-defensa).',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Desarrollo aeróbico',
      content: 'Resistencia aeróbica, velocidad de desplazamiento y agilidad específica.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Autoconfianza',
      content:
        'Gestión de la presión en partidos, compromiso con los entrenamientos y fijación de objetivos.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Avanzadas',
      content: 'El fuera de juego (aplicación estricta), penaltis y normativas de sustitución completas.',
    },
  },
  infantil: {
    technique: {
      key: 'technique',
      itemLabel: 'Ejecución rápida',
      content:
        'Técnica bajo presión, controles orientados en velocidad, entradas y anticipaciones defensivas.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Estructura F11',
      content:
        'Defensa en bloque, basculaciones, temporizaciones y sistemas de juego definidos (ej. 1-4-3-3).',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Adaptación biológica',
      content:
        'Estirón puberal. Trabajo de fuerza general (autocargas) y flexibilidad para evitar lesiones.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Identidad y ego',
      content:
        'Pensamiento crítico, entendimiento del rol dentro del equipo y gestión de suplencias.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Rigor táctico',
      content: 'Ley de la ventaja, faltas tácticas, entendimiento de infracciones y barreras.',
    },
  },
  cadete: {
    technique: {
      key: 'technique',
      itemLabel: 'Especialización',
      content:
        'Dominio técnico aplicado a la táctica, golpeos específicos (centros, faltas) y protección del balón.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Complejidad',
      content:
        'Presión alta/baja estructurada, Acciones a Balón Parado (ABP) y lectura de juego autónoma.',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Fuerza y resistencia',
      content:
        'Introducción a la fuerza específica, resistencia anaeróbica y trabajo preventivo intenso.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Madurez',
      content:
        'Disciplina táctica estricta, toma de decisiones bajo estrés y concentración prolongada.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Uso a favor',
      content:
        'Comprensión de las amonestaciones (tarjetas) y rigor reglamentario en área de castigo.',
    },
  },
  juvenil: {
    technique: {
      key: 'technique',
      itemLabel: 'Perfeccionamiento',
      content:
        'Ejecución técnica excelente a máxima velocidad, bajo fatiga y en espacios muy reducidos.',
    },
    tactics: {
      key: 'tactics',
      itemLabel: 'Estrategia avanzada',
      content:
        'Variantes tácticas en tiempo real, automatismos complejos y análisis profundo del rival.',
    },
    physical: {
      key: 'physical',
      itemLabel: 'Alto rendimiento',
      content:
        'Fuerza máxima, potencia, picos de velocidad y rutinas de recuperación enfocadas al fútbol senior.',
    },
    psychological: {
      key: 'psychological',
      itemLabel: 'Gestión competitiva',
      content:
        'Liderazgo, control emocional extremo y orientación hacia el fútbol profesional o amateur.',
    },
    rules: {
      key: 'rules',
      itemLabel: 'Dominio experto',
      content:
        'Dominio absoluto del reglamento para usarlo a favor (gestión de tiempos, comunicación con el árbitro).',
    },
  },
};

export function stageForCategory(slug: CanteraCategorySlug): MethodologyStage | undefined {
  return METHODOLOGY_STAGES.find((stage) => stage.categorySlugs.includes(slug));
}

export function mergeMethodologyObjectives(
  overrides: Partial<MethodologyObjectivesMap> | null | undefined
): MethodologyObjectivesMap {
  const merged = structuredClone(DEFAULT_METHODOLOGY_OBJECTIVES);
  if (!overrides) return merged;

  for (const slug of Object.keys(overrides) as CanteraCategorySlug[]) {
    const categoryOverrides = overrides[slug];
    if (!categoryOverrides || !merged[slug]) continue;
    for (const dimension of OBJECTIVE_DIMENSION_META) {
      const patch = categoryOverrides[dimension.key];
      if (!patch) continue;
      merged[slug][dimension.key] = {
        key: dimension.key,
        itemLabel: patch.itemLabel || merged[slug][dimension.key].itemLabel,
        content: patch.content ?? merged[slug][dimension.key].content,
      };
    }
  }

  return merged;
}

export function canEditMethodologyObjectives(role: string): boolean {
  const normalized = role.toLowerCase();
  return ['admin', 'owner', 'methodology', 'sport_director', 'coach'].includes(normalized);
}
