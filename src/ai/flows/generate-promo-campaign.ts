'use server';
/**
 * @fileOverview Flujo de IA para la generación de tokens de acceso y campañas de marketing regional.
 * 
 * - generatePromoCampaign - Función que maneja la creación de campañas y tokens.
 * - GenerateCampaignInput - Esquema de entrada (Región, Plan, Plataforma, Validez, Usos).
 * - GenerateCampaignOutput - Esquema de salida (Token, Hook, Copy, Estrategia).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignInputSchema = z.object({
  objective: z.string().describe('El objetivo demográfico y de captación (ej. "Primeros 10 entrenadores de Argentina").'),
  platform: z
    .enum([
      'Facebook',
      'Instagram',
      'Instagram Reels',
      'TikTok',
      'YouTube',
      'YouTube Shorts',
      'LinkedIn',
      'Google Ads',
      'Twitter/X',
      'Otro',
    ])
    .describe('Canal principal de difusión (shorts, reels, etc.).'),
  planId: z.string().describe('El identificador del plan de suscripción.'),
  maxUses: z.number().optional().describe('Número máximo de veces que se puede usar el token.'),
  expiryDate: z.string().optional().describe('Fecha de caducidad de la campaña (YYYY-MM-DD).'),
});
export type GenerateCampaignInput = z.infer<typeof GenerateCampaignInputSchema>;

const GenerateCampaignOutputSchema = z.object({
  campaignTitle: z.string().describe('Título interno de la campaña.'),
  mainHook: z.string().describe('La oferta irresistible (incluyendo urgencia si hay fecha/usos).'),
  socialMediaCopy: z.string().describe('Texto publicitario optimizado.'),
  suggestedPromoCode: z.string().describe('Token de acceso único sugerido.'),
  suggestedPlanId: z.string().describe('ID del plan vinculado.'),
  adStrategy: z.string().describe('Estrategia de segmentación.'),
});
export type GenerateCampaignOutput = z.infer<typeof GenerateCampaignOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePromoCampaignPrompt',
  input: {schema: GenerateCampaignInputSchema},
  output: {schema: GenerateCampaignOutputSchema},
  prompt: `Actúa como un estratega de crecimiento para SynqAI.
Tu misión es generar un "Magic Token" de acceso y su campaña.

Contexto de la Campaña:
Objetivo: {{{objective}}}
Plataforma: {{{platform}}}
Plan Vinculado: {{{planId}}}
{{#if maxUses}}Límite de Usos: {{{maxUses}}} unidades.{{/if}}
{{#if expiryDate}}Fecha Límite: {{{expiryDate}}}.{{/if}}

Instrucciones Estratégicas:
1. Generación de Token: Crea un token alfanumérico potente (ej: ARG-PRO-VAL).
2. Gancho de Escasez: Si hay límite de usos o fecha, la campaña DEBE centrarse en la urgencia.
3. Si la plataforma es YouTube o YouTube Shorts, genera un guion de 15s; si es Reels o TikTok, adapta el copy a formato vertical y primeros 3s de gancho.

Genera un plan profesional con un lenguaje de élite y altamente persuasivo.
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
