/**
 * @fileOverview Definición del JSON Maestro para ejercicios tácticos.
 * Utiliza coordenadas decimales (0.0 a 1.0) para independencia de resolución.
 * Este estándar garantiza que el ejercicio se vea igual en una Tablet o una TV 4K.
 */

export type TacticalElementType = 'player' | 'ball' | 'cone' | 'pica' | 'flag' | 'arrow' | 'text';

export interface TacticalElement {
  id: string;
  type: TacticalElementType;
  x: number; // 0.000 to 1.000 (Precisión decimal)
  y: number; // 0.000 to 1.000 (Precisión decimal)
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
