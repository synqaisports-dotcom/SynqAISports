'use server';
/**
 * @fileOverview Flujo de IA para la generación de campañas de marketing deportivo.
 * 
 * - generatePromoCampaign - Función que maneja la creación de campañas.
 * - GenerateCampaignInput - Esquema de entrada.
 * - GenerateCampaignOutput - Esquema de salida.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCampaignInputSchema = z.object({
  objective: z.string().describe('El objetivo de la campaña (ej. "Captar clubes con pizarra gratis", "Escalado de 0.70€ por niño").'),
  platform: z.enum(['Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'YouTube']).describe('La plataforma principal de difusión.'),
  planId: z.string().describe('El identificador del plan de suscripción vinculado a esta campaña.'),
});
export type GenerateCampaignInput = z.infer<typeof GenerateCampaignInputSchema>;

const GenerateCampaignOutputSchema = z.object({
  campaignTitle: z.string().describe('Título interno de la campaña.'),
  mainHook: z.string().describe('El gancho principal de venta (Lead Magnet).'),
  socialMediaCopy: z.string().describe('Texto publicitario optimizado para la plataforma seleccionada.'),
  suggestedPromoCode: z.string().describe('Código promocional sugerido.'),
  suggestedPlanId: z.string().describe('ID del plan recomendado para vincular a esta campaña.'),
  adStrategy: z.string().describe('Breve estrategia de segmentación para la plataforma seleccionada.'),
});
export type GenerateCampaignOutput = z.infer<typeof GenerateCampaignOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generatePromoCampaignPrompt',
  input: {schema: GenerateCampaignInputSchema},
  output: {schema: GenerateCampaignOutputSchema},
  prompt: `Actúa como un experto en marketing deportivo para SynqAI.
Tu misión es generar una campaña publicitaria de alto impacto basada en este objetivo: {{{objective}}}
Plataforma: {{{platform}}}
Plan Vinculado: {{{planId}}}

Contexto Estratégico:
1. Usamos la Pizarra Táctica (Modo Promo con Ads) como gancho gratuito (Lead Magnet).
2. El modelo de negocio es volumen por niño (1€ a 0.70€ según escalado).
3. Los clubes ganan dinero aumentando su cuota anual.

Si la plataforma es YouTube, genera una estructura de guion breve para un anuncio de 15-30 segundos centrado en el beneficio económico para el club.

Genera un plan de campaña profesional con un lenguaje de élite, técnico y motivador.
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
