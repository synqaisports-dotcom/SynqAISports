'use server';
/**
 * @fileOverview Flujo de IA para la generación de ejercicios individuales de élite.
 *
 * - generateNeuralExercise - Función que maneja la creación de ejercicios.
 * - GenerateExerciseInput - Esquema de entrada.
 * - GenerateExerciseOutput - Esquema de salida estructurado.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExerciseInputSchema = z.object({
  topic: z.string().describe('El tema o concepto del ejercicio (ej. "Presión tras pérdida", "Salida de balón").'),
});
export type GenerateExerciseInput = z.infer<typeof GenerateExerciseInputSchema>;

const GenerateExerciseOutputSchema = z.object({
  title: z.string().describe('Título profesional del ejercicio.'),
  objective: z.string().describe('Objetivo táctico principal.'),
  description: z.string().describe('Descripción técnica detallada.'),
  variations: z.array(z.string()).min(3).max(3).describe('Tres variaciones tácticas para progresar el ejercicio.'),
});
export type GenerateExerciseOutput = z.infer<typeof GenerateExerciseOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateNeuralExercisePrompt',
  input: {schema: GenerateExerciseInputSchema},
  output: {schema: GenerateExerciseOutputSchema},
  prompt: `Actúa como un entrenador de élite de SynqAI. 
Diseña un ejercicio de entrenamiento de alto rendimiento basado en el siguiente tema: {{{topic}}}.

Instrucciones:
1. Estilo: Profesional, directo y altamente técnico (NASA/Aeroespacial).
2. El Título debe ser impactante y moderno.
3. El Objetivo debe ser claro y medible.
4. La Descripción debe explicar la mecánica del ejercicio.
5. Debes proporcionar exactamente 3 variaciones tácticas de progresión.

Idioma: Español.`,
});

const generateNeuralExerciseFlow = ai.defineFlow(
  {
    name: 'generateNeuralExerciseFlow',
    inputSchema: GenerateExerciseInputSchema,
    outputSchema: GenerateExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateNeuralExercise(input: GenerateExerciseInput): Promise<GenerateExerciseOutput> {
  return generateNeuralExerciseFlow(input);
}
