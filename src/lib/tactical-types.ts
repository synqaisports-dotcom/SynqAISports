
/**
 * @fileOverview Definición del JSON Maestro para ejercicios tácticos.
 * Utiliza coordenadas decimales (0.0 a 1.0) para independencia de resolución.
 */

export type TacticalElementType = 'player' | 'ball' | 'cone' | 'pica' | 'flag' | 'arrow' | 'text';

export interface TacticalElement {
  id: string;
  type: TacticalElementType;
  x: number; // 0.0 to 1.0
  y: number; // 0.0 to 1.0
  label?: string;
  color?: string;
  rotation?: number;
  data?: any;
}

export interface TacticalFrame {
  id: string;
  elements: TacticalElement[];
  description?: string;
}

export interface TacticalExercise {
  id: string;
  title: string;
  sport: string;
  frames: TacticalFrame[];
  createdAt: string;
  updatedAt: string;
  metadata?: {
    duration?: string;
    intensity?: 'low' | 'medium' | 'high';
    category?: string;
  };
}
