'use server';
/**
 * @fileOverview Genkit flow for Predictive Disaster Simulation.
 * Analyzes historical patterns to project future resource requirements.
 * Includes fallback logic for mission-critical projections.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoricalDataSchema = z.object({
  previousPeakWaterLevel: z.number(),
  affectedAreaCount: z.number(),
  averageResponseTimeMinutes: z.number(),
});

const PredictiveSimulationInputSchema = z.object({
  projectedWaterLevel: z.number().describe('Projected water level for the simulation (meters)'),
  historicalContext: HistoricalDataSchema,
  simulationDurationDays: z.number().default(7),
});
export type PredictiveSimulationInput = z.infer<typeof PredictiveSimulationInputSchema>;

const PredictiveSimulationOutputSchema = z.object({
  estimatedRiskScore: z.number().min(0).max(100).describe('Projected risk score (0-100)'),
  requiredResponders: z.object({
    medical: z.number(),
    rescue: z.number(),
    volunteers: z.number(),
  }),
  priorityZones: z.array(z.string()).describe('List of areas likely to need immediate evacuation'),
  strategicAdvice: z.string().describe('Strategic recommendations for the district administration in Bengali'),
  bottleneckWarnings: z.array(z.string()).describe('Potential operational bottlenecks predicted'),
  isLocalFallback: z.boolean().optional(),
});
export type PredictiveSimulationOutput = z.infer<typeof PredictiveSimulationOutputSchema>;

export async function runPredictiveSimulation(input: PredictiveSimulationInput): Promise<PredictiveSimulationOutput> {
  return predictiveSimulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveSimulationPrompt',
  input: {schema: PredictiveSimulationInputSchema},
  output: {schema: PredictiveSimulationOutputSchema},
  prompt: `You are a Senior Disaster Strategy AI. Run a high-fidelity simulation for Sirajganj District based on the following:

Projected Water Level: {{{projectedWaterLevel}}} m
Historical Peak: {{{historicalContext.previousPeakWaterLevel}}} m
Average Historical Response: {{{historicalContext.averageResponseTimeMinutes}}} minutes

Task:
1. Calculate a risk score (0-100).
2. Predict the exact number of Medical, Rescue (Fire/Police), and Volunteer teams needed to keep fatalities at zero.
3. Identify Sirajganj zones (e.g., Belkuchi, Enayetpur, Kazipur) most at risk based on the water level projection.
4. Provide a strategic command briefing in Bengali.
5. Identify potential bottlenecks (e.g., fuel shortage, boat scarcity, network failure).`,
});

const predictiveSimulationFlow = ai.defineFlow(
  {
    name: 'predictiveSimulationFlow',
    inputSchema: PredictiveSimulationInputSchema,
    outputSchema: PredictiveSimulationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Predictive Engine failed to simulate scenarios.');
      }
      return output;
    } catch (error) {
      console.warn(`[Simulation Fallback] AI Offline. Calculating Mathematical Projections...`);
      
      // Mathematical fallback based on projection vs historical peak
      const riskScore = Math.min(100, Math.max(0, 
        ((input.projectedWaterLevel - 13.0) / (input.historicalContext.previousPeakWaterLevel - 13.0)) * 100
      ));

      return {
        estimatedRiskScore: Math.round(riskScore),
        requiredResponders: {
          medical: Math.ceil(riskScore / 10),
          rescue: Math.ceil(riskScore / 8),
          volunteers: Math.ceil(riskScore / 5),
        },
        priorityZones: ["বেলকুচি", "এনায়েতপুর", "কাজীপুর"],
        strategicAdvice: `[Sovereign Fallback Mode] প্রজেক্টেড পানির স্তর বিপদসীমা অতিক্রম করার প্রবল সম্ভাবনা রয়েছে। সকল রেসপন্ডার টিমকে হাই-অ্যালার্টে রাখুন।`,
        bottleneckWarnings: ["যোগাযোগ বিচ্ছিন্নতা", "নৌযানের অভাব"],
        isLocalFallback: true
      };
    }
  }
);