
'use server';
/**
 * @fileOverview Una herramienta de IA generativa para asistir a entrenadores en la creación de planes de entrenamiento personalizados.
 *
 * - generateTrainingPlan - Función que maneja la generación de planes de entrenamiento.
 * - GenerateTrainingPlanInput - Tipo de entrada para la función.
 * - GenerateTrainingPlanOutput - Tipo de salida para la función.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingSessionSchema = z.object({
  day: z.string().describe('El día de la semana para la sesión (ej. Lunes, Martes).'),
  focus: z.string().describe('El enfoque principal de la sesión (ej. Fuerza, Cardio, Técnica, Recuperación).'),
  exercises: z.array(z.string()).describe('Lista de ejercicios, incluyendo series y repeticiones (ej. "Press de banca: 3 series de 10 reps").'),
  notes: z.string().optional().describe('Notas específicas para esta sesión.'),
});

const WeeklyScheduleSchema = z.object({
  weekNumber: z.number().int().min(1).describe('El número de la semana de entrenamiento.'),
  sessions: z.array(TrainingSessionSchema).describe('Lista de sesiones para esta semana.'),
});

const GenerateTrainingPlanInputSchema = z.object({
  sportType: z.string().describe('El tipo de deporte (ej. Baloncesto, Fútbol, Natación).'),
  athleteRole: z.string().describe('El rol específico del atleta (ej. Base, Portero, Nadador de Estilo Libre).'),
  athleteLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('El nivel actual del atleta.'),
  trainingGoal: z.string().describe('El objetivo principal del plan (ej. mejorar velocidad, resistencia, fuerza).'),
  durationWeeks: z.number().int().min(1).max(24).describe('Duración del plan en semanas.'),
  sessionsPerWeek: z.number().int().min(1).max(7).describe('Número de sesiones por semana.'),
  additionalNotes: z.string().optional().describe('Consideraciones adicionales o preferencias.'),
});
export type GenerateTrainingPlanInput = z.infer<typeof GenerateTrainingPlanInputSchema>;

const GenerateTrainingPlanOutputSchema = z.object({
  planTitle: z.string().describe('Un título descriptivo para el plan generado.'),
  overview: z.string().describe('Un resumen breve y la filosofía del plan.'),
  weeklySchedule: z.array(WeeklyScheduleSchema).describe('Desglose semanal detallado de las sesiones.'),
  generalRecommendations: z.array(z.string()).describe('Recomendaciones generales (nutrición, descanso, preparación mental).'),
});
export type GenerateTrainingPlanOutput = z.infer<typeof GenerateTrainingPlanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateTrainingPlanPrompt',
  input: {schema: GenerateTrainingPlanInputSchema},
  output: {schema: GenerateTrainingPlanOutputSchema},
  prompt: `Eres un experto entrenador deportivo y generador de planes de entrenamiento. Tu tarea es crear un calendario de entrenamiento personalizado para un atleta basado en los siguientes detalles.

IMPORTANTE: El idioma de salida debe ser exclusivamente ESPAÑOL.

Detalles del Atleta:
Deporte: {{{sportType}}}
Rol/Posición: {{{athleteRole}}}
Nivel: {{{athleteLevel}}}
Objetivo: {{{trainingGoal}}}
Duración: {{{durationWeeks}}} semanas
Sesiones por semana: {{{sessionsPerWeek}}}

{{#if additionalNotes}}
Notas adicionales: {{{additionalNotes}}}
{{/if}}

Por favor, genera un plan integral siguiendo estas directrices:
1. **Título del Plan**: Un título profesional y motivador.
2. **Resumen**: Una breve explicación de la filosofía del plan.
3. **Calendario Semanal**: Para cada una de las {{durationWeeks}} semanas, detalla {{sessionsPerWeek}} sesiones. Cada sesión debe especificar el día, enfoque y ejercicios específicos.
4. **Recomendaciones Generales**: Consejos sobre nutrición y recuperación.`,
});

const generateTrainingPlanFlow = ai.defineFlow(
  {
    name: 'generateTrainingPlanFlow',
    inputSchema: GenerateTrainingPlanInputSchema,
    outputSchema: GenerateTrainingPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateTrainingPlan(input: GenerateTrainingPlanInput): Promise<GenerateTrainingPlanOutput> {
  return generateTrainingPlanFlow(input);
}
