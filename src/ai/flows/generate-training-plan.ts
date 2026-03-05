'use server';
/**
 * @fileOverview A GenAI tool to assist coaches in creating tailored training schedules and exercise recommendations.
 *
 * - generateTrainingPlan - A function that handles the generation of training plans.
 * - GenerateTrainingPlanInput - The input type for the generateTrainingPlan function.
 * - GenerateTrainingPlanOutput - The return type for the generateTrainingPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TrainingSessionSchema = z.object({
  day: z.string().describe('The day of the week for the session (e.g., Monday, Tuesday).'),
  focus: z.string().describe('The primary focus of the training session (e.g., Strength, Cardio, Skill Development, Recovery).'),
  exercises: z.array(z.string()).describe('A list of exercises for the session, including sets and reps if applicable (e.g., "Warm-up: 10 min dynamic stretching", "Bench Press: 3 sets of 8-10 reps", "30 min steady-state cardio").'),
  notes: z.string().optional().describe('Any specific notes or tips for this session.'),
});

const WeeklyScheduleSchema = z.object({
  weekNumber: z.number().int().min(1).describe('The number of the training week.'),
  sessions: z.array(TrainingSessionSchema).describe('A list of training sessions for this week.'),
});

const GenerateTrainingPlanInputSchema = z.object({
  sportType: z.string().describe('The type of sport (e.g., Basketball, Soccer, Swimming).'),
  athleteRole: z.string().describe('The specific role of the athlete within the sport (e.g., Point Guard, Goalkeeper, Freestyle Swimmer).'),
  athleteLevel: z.enum(['beginner', 'intermediate', 'advanced']).describe('The current skill level of the athlete.'),
  trainingGoal: z.string().describe('The primary goal of the training plan (e.g., improve speed, build endurance, prepare for a specific competition, strength training).'),
  durationWeeks: z.number().int().min(1).max(24).describe('The duration of the training plan in weeks.'),
  sessionsPerWeek: z.number().int().min(1).max(7).describe('The number of training sessions per week.'),
  additionalNotes: z.string().optional().describe('Any additional specific considerations or preferences for the athlete or plan.'),
});
export type GenerateTrainingPlanInput = z.infer<typeof GenerateTrainingPlanInputSchema>;

const GenerateTrainingPlanOutputSchema = z.object({
  planTitle: z.string().describe('A concise and descriptive title for the generated training plan.'),
  overview: z.string().describe('A brief overview and philosophy of the training plan.'),
  weeklySchedule: z.array(WeeklyScheduleSchema).describe('A detailed weekly breakdown of training sessions.'),
  generalRecommendations: z.array(z.string()).describe('General recommendations for the athlete (e.g., nutrition tips, rest advice, mental preparation).'),
});
export type GenerateTrainingPlanOutput = z.infer<typeof GenerateTrainingPlanOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateTrainingPlanPrompt',
  input: {schema: GenerateTrainingPlanInputSchema},
  output: {schema: GenerateTrainingPlanOutputSchema},
  prompt: `You are an expert sports coach and training plan generator. Your task is to create a personalized training schedule and exercise recommendations for an athlete based on the provided details.

The output should be a structured JSON object.

Here are the athlete's details:
Sport Type: {{{sportType}}}
Athlete Role: {{{athleteRole}}}
Athlete Level: {{{athleteLevel}}}
Training Goal: {{{trainingGoal}}}
Duration: {{{durationWeeks}}} weeks
Sessions Per Week: {{{sessionsPerWeek}}}

{{#if additionalNotes}}
Additional Notes: {{{additionalNotes}}}
{{/if}}

Please generate a comprehensive training plan following these guidelines:
1.  **Plan Title**: Provide a catchy and relevant title.
2.  **Overview**: Write a brief overview explaining the plan's philosophy and how it addresses the athlete's goals.
3.  **Weekly Schedule**: For each of the {{durationWeeks}} weeks, detail {{sessionsPerWeek}} training sessions. Each session should specify the day (e.g., "Monday"), a primary focus (e.g., "Strength Training", "Skill Work", "Cardio"), and a list of specific exercises with recommended sets and reps or duration. Include notes if necessary. Distribute the sessions logically across the week. Ensure progression over the weeks where appropriate for the athlete's level and goal.
4.  **General Recommendations**: Offer general advice on nutrition, recovery, mental preparation, or other relevant aspects to support the training plan.

Ensure the plan is realistic, effective, and tailored to the athlete's specific needs, sport type, and role.`,
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
