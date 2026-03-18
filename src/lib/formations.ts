
/**
 * @fileOverview Librería de coordenadas tácticas para SynqAI.
 * Define las posiciones relativas (0.0 a 1.0) de los jugadores según el sistema.
 * v22.0.0: PROTOCOL_MIDFIELD_REBALANCE - Reajuste de la medular para ampliar distancia con ataque en defensa.
 */

export type FormationKey = string;

interface Position {
  x: number;
  y: number;
}

export const FORMATIONS_DATA: Record<string, Record<FormationKey, Position[]>> = {
  f11: {
    "4-3-3": [
      {x: 0.05, y: 0.5}, // GK
      {x: 0.25, y: 0.15}, {x: 0.25, y: 0.38}, {x: 0.25, y: 0.62}, {x: 0.25, y: 0.85}, // DEF
      {x: 0.46, y: 0.5}, {x: 0.46, y: 0.3}, {x: 0.46, y: 0.7}, // MID (Rebalanced from 0.51 to 0.46)
      {x: 0.8, y: 0.5}, {x: 0.75, y: 0.2}, {x: 0.75, y: 0.8} // ATK
    ],
    "4-4-2": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.15}, {x: 0.25, y: 0.38}, {x: 0.25, y: 0.62}, {x: 0.25, y: 0.85},
      {x: 0.45, y: 0.15}, {x: 0.45, y: 0.38}, {x: 0.45, y: 0.62}, {x: 0.45, y: 0.85}, // MID (Rebalanced from 0.5 to 0.45)
      {x: 0.75, y: 0.35}, {x: 0.75, y: 0.65}
    ],
    "3-5-2": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.25}, {x: 0.25, y: 0.5}, {x: 0.25, y: 0.75},
      {x: 0.47, y: 0.1}, {x: 0.47, y: 0.9}, {x: 0.47, y: 0.5}, {x: 0.47, y: 0.3}, {x: 0.47, y: 0.7}, // MID (Rebalanced from 0.525 to 0.47)
      {x: 0.8, y: 0.4}, {x: 0.8, y: 0.6}
    ],
    "4-2-3-1": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.15}, {x: 0.25, y: 0.38}, {x: 0.25, y: 0.62}, {x: 0.25, y: 0.85},
      {x: 0.42, y: 0.35}, {x: 0.42, y: 0.65}, // Pivot
      {x: 0.58, y: 0.5}, {x: 0.58, y: 0.2}, {x: 0.58, y: 0.8}, // Line of 3 (Rebalanced for depth)
      {x: 0.85, y: 0.5}
    ],
    "5-4-1": [
      {x: 0.05, y: 0.5},
      {x: 0.2, y: 0.1}, {x: 0.25, y: 0.3}, {x: 0.25, y: 0.5}, {x: 0.25, y: 0.7}, {x: 0.2, y: 0.9},
      {x: 0.47, y: 0.2}, {x: 0.47, y: 0.4}, {x: 0.47, y: 0.6}, {x: 0.47, y: 0.8}, // MID (Rebalanced from 0.525 to 0.47)
      {x: 0.8, y: 0.5}
    ]
  },
  f7: {
    "3-2-1": [
      {x: 0.05, y: 0.5}, // GK
      {x: 0.25, y: 0.2}, {x: 0.25, y: 0.5}, {x: 0.25, y: 0.8}, // DEF
      {x: 0.48, y: 0.35}, {x: 0.48, y: 0.65}, // MID (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.5} // ATK
    ],
    "2-3-1": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.3}, {x: 0.25, y: 0.7},
      {x: 0.48, y: 0.15}, {x: 0.48, y: 0.5}, {x: 0.48, y: 0.85}, // MID (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.5}
    ],
    "3-1-2": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.2}, {x: 0.25, y: 0.5}, {x: 0.25, y: 0.8},
      {x: 0.46, y: 0.5}, // MID (Rebalanced from 0.525 to 0.46)
      {x: 0.8, y: 0.35}, {x: 0.8, y: 0.65}
    ],
    "2-2-2": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.3}, {x: 0.25, y: 0.7},
      {x: 0.48, y: 0.3}, {x: 0.48, y: 0.7}, // MID (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.3}, {x: 0.85, y: 0.7}
    ],
    "1-4-1": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.5},
      {x: 0.48, y: 0.1}, {x: 0.48, y: 0.35}, {x: 0.48, y: 0.65}, {x: 0.48, y: 0.9}, // MID (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.5}
    ]
  },
  futsal: {
    "1-2-1": [
      {x: 0.05, y: 0.5}, // GK
      {x: 0.25, y: 0.5}, // FIXO
      {x: 0.48, y: 0.2}, {x: 0.48, y: 0.8}, // ALAS (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.5} // PIVOT
    ],
    "2-2": [
      {x: 0.05, y: 0.5},
      {x: 0.3, y: 0.3}, {x: 0.3, y: 0.7},
      {x: 0.75, y: 0.3}, {x: 0.75, y: 0.7}
    ],
    "3-1": [
      {x: 0.05, y: 0.5},
      {x: 0.3, y: 0.2}, {x: 0.3, y: 0.5}, {x: 0.3, y: 0.8},
      {x: 0.8, y: 0.5}
    ],
    "4-0": [
      {x: 0.05, y: 0.5},
      {x: 0.45, y: 0.15}, {x: 0.45, y: 0.38}, {x: 0.45, y: 0.62}, {x: 0.45, y: 0.85}
    ],
    "1-1-2": [
      {x: 0.05, y: 0.5},
      {x: 0.25, y: 0.5},
      {x: 0.48, y: 0.5}, // MID (Rebalanced from 0.55 to 0.48)
      {x: 0.85, y: 0.35}, {x: 0.85, y: 0.65}
    ]
  }
};
