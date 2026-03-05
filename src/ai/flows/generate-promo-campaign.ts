'use server';
/**
 * @fileOverview Flujo de IA para la generación de tokens de acceso y campañas de marketing regional.
 * 
 * - generatePromoCampaign - Función que maneja la creación de campañas y tokens.
 * - GenerateCampaignInput - Esquema de entrada (Región, Plan, Plataforma).
 * - GenerateCampaignOutput - Esquema de salida (Token, Hook, Copy, Estrategia).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignInputSchema = z.object({
  objective: z.string().describe('El objetivo demográfico y de captación (ej. "Primeros 10 entrenadores de Argentina", "Clubes élite en Madrid").'),
  platform: z.enum(['Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'YouTube']).describe('La plataforma principal de difusión del Magic Link.'),
  planId: z.string().describe('El identificador del plan de suscripción que desbloqueará el token.'),
});
export type GenerateCampaignInput = z.infer<typeof GenerateCampaignInputSchema>;

const GenerateCampaignOutputSchema = z.object({
  campaignTitle: z.string().describe('Título interno de la campaña/token.'),
  mainHook: z.string().describe('La oferta irresistible que justifica el uso del Magic Link (ej. Acceso vitalicio a Pizarra Pro para los primeros 10).'),
  socialMediaCopy: z.string().describe('Texto publicitario optimizado que incluye la instrucción de usar el código o link.'),
  suggestedPromoCode: z.string().describe('Token de acceso único sugerido (ej. ARG-ELITE-10).'),
  suggestedPlanId: z.string().describe('ID del plan vinculado.'),
  adStrategy: z.string().describe('Estrategia de segmentación para la región indicada.'),
});
export type GenerateCampaignOutput = z.infer<typeof GenerateCampaignOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePromoCampaignPrompt',
  input: {schema: GenerateCampaignInputSchema},
  output: {schema: GenerateCampaignOutputSchema},
  prompt: `Actúa como un estratega de crecimiento para SynqAI.
Tu misión es generar un "Magic Token" de acceso y su correspondiente campaña para este objetivo: {{{objective}}}
Plataforma: {{{platform}}}
Plan Vinculado: {{{planId}}}

Instrucciones Estratégicas:
1. Generación de Token: Crea un token alfanumérico corto y potente (ej: ARG-PRO-10).
2. Gancho de Escasez: La campaña debe centrarse en que el acceso es limitado (ej: "Solo para los 10 primeros").
3. Contexto de Producto: El gancho principal es el acceso a la Pizarra Táctica (Modo Promo gratis) o funcionalidades de élite del plan {{{planId}}}.
4. Si la plataforma es YouTube, genera una estructura de guion de 15s enfocada en el beneficio de entrar ahora con el token.

Genera un plan de token profesional con un lenguaje de élite, técnico y altamente persuasivo.
Idioma: Español.`,
});

const generatePromoCampaignFlow = ai.defineFlow(
  {
    name: 'generatePromoCampaignFlow',
    inputSchema: GenerateCampaignInputSchema,
    outputSchema: GenerateCampaignOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generatePromoCampaign(input: GenerateCampaignInput): Promise<GenerateCampaignOutput> {
  return generatePromoCampaignFlow(input);
}
