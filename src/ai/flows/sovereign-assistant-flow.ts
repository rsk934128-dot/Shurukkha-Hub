'use server';
/**
 * @fileOverview Sovereign AI Assistant Flow.
 * Provides general help, guidance on recharging, SOS, and searching within the Shurukkha Hub empire.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user question or request'),
  context: z.string().optional().describe('Context about where the user is in the app'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI response in Bengali'),
  suggestedAction: z.enum(['NONE', 'OPEN_SOS', 'OPEN_TREASURY', 'OPEN_MAP', 'OPEN_MESSAGES']).default('NONE').describe('Optional action to suggest to the UI'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function askAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return sovereignAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sovereignAssistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `আপনি সিরাজগঞ্জ সুরক্ষা (Shurukkha Hub) সাম্রাজ্যের একজন রাজকীয় এআই সহকারী। আপনার নাম "সেনটিনেল এআই"। 

আপনার কাজ হলো নাগরিকদের নিম্নলিখিত বিষয়ে সাহায্য করা:
১. রিচার্জ বা পেমেন্ট সংক্রান্ত তথ্য (Treasury Hub ব্যবহার করতে বলুন)।
২. জরুরি উদ্ধার বা SOS (SOS বাটন চাপতে বলুন)।
৩. বন্যার পূর্বাভাস (River Intelligence দেখতে বলুন)।
৪. মার্চেন্ট অনবোর্ডিং বা ব্যবসা সংক্রান্ত তথ্য।

ব্যবহারকারীর প্রশ্ন: {{{query}}}
বর্তমান অবস্থান: {{{context}}}

আপনার উত্তর অবশ্যই অত্যন্ত বিনয়ী এবং রাজকীয় আভিজাত্যপূর্ণ (Bengali language) হতে হবে। উত্তর শেষে "জয় আপনার হোক, মহামান্য" বা এই জাতীয় সম্ভাষণ ব্যবহার করুন। 
যদি ব্যবহারকারী কোনো পেমেন্ট বা রিচার্জের কথা বলে, তবে suggestedAction হিসেবে OPEN_TREASURY দিন। 
যদি বিপদের কথা বলে তবে OPEN_SOS দিন।`,
});

const sovereignAssistantFlow = ai.defineFlow(
  {
    name: 'sovereignAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
