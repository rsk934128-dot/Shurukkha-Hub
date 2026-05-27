
'use server';
/**
 * @fileOverview Genkit flow for Dispatch Intelligence.
 * Analyzes SOS alerts and recommends the best available responder team.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResponderSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Police', 'Fire', 'Medical', 'Volunteer']),
  location: z.string(),
  status: z.string(),
});

const SuggestResponderInputSchema = z.object({
  sosType: z.string().describe('The type of emergency (e.g., Flood, Medical, Theft)'),
  location: z.string().describe('Location of the victim'),
  availableResponders: z.array(ResponderSchema).describe('List of responders currently available'),
});
export type SuggestResponderInput = z.infer<typeof SuggestResponderInputSchema>;

const SuggestResponderOutputSchema = z.object({
  recommendedResponderId: z.string().describe('ID of the suggested responder'),
  reasoning: z.string().describe('Why this responder was chosen (in Bengali)'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('Urgency level'),
  estimatedArrivalTime: z.string().describe('ETA to the location'),
});
export type SuggestResponderOutput = z.infer<typeof SuggestResponderOutputSchema>;

export async function suggestResponder(input: SuggestResponderInput): Promise<SuggestResponderOutput> {
  return suggestResponderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResponderPrompt',
  input: {schema: SuggestResponderInputSchema},
  output: {schema: SuggestResponderOutputSchema},
  prompt: `You are an Emergency Dispatch AI for Sirajganj Shurukkha Hub.
Your goal is to analyze an incoming SOS and pick the best responder from the provided list.

Emergency Details:
- Type: {{{sosType}}}
- Location: {{{location}}}

Available Responders:
{{#each availableResponders}}
- {{{this.name}}} ({{{this.type}}}, Location: {{{this.location}}}, Status: {{{this.status}}})
{{/each}}

Task:
1. Match the emergency type with the responder's specialty.
2. Consider geographic proximity (estimate based on location descriptions).
3. Provide the response in clear Bengali.
4. If it's a flood or fire, set priority to 'Critical'.`,
});

const suggestResponderFlow = ai.defineFlow(
  {
    name: 'suggestResponderFlow',
    inputSchema: SuggestResponderInputSchema,
    outputSchema: SuggestResponderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Responder Dispatch Engine failed to generate output.');
    }
    return output;
  }
);
