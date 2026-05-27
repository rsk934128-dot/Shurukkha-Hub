'use server';
/**
 * @fileOverview A robust Genkit flow for 'River Intelligence' that generates
 * mission-critical risk assessments and personalized evacuation plans.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShelterSchema = z.object({
  name: z.string().describe('আশ্রয়কেন্দ্রের নাম'),
  distance: z.string().describe('দূরত্ব (যেমন: ৫০০ মিটার)'),
  capacity: z.string().describe('ধারণক্ষমতা এবং বর্তমান অবস্থা'),
  contact: z.string().optional().describe('যোগাযোগের নম্বর'),
});

const GenerateFloodSurvivalAdviceInputSchema = z.object({
  jamunaWaterLevel: z.number().describe('যমুনা নদীর বর্তমান পানির স্তর (মিটার)'),
  dangerLevelThreshold: z.number().describe('যমুনা নদীর বিপদসীমা (মিটার)'),
  weatherForecast: z.string().describe('আবহাওয়ার পূর্বাভাস (যেমন: ভারী বৃষ্টিপাত)'),
  currentLocation: z.string().describe('ইউজারের বর্তমান এলাকা'),
  nearbyShelters: z.array(ShelterSchema).describe('নিকটবর্তী আশ্রয়কেন্দ্রের তালিকা'),
});
export type GenerateFloodSurvivalAdviceInput = z.infer<
  typeof GenerateFloodSurvivalAdviceInputSchema
>;

const GenerateFloodSurvivalAdviceOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('ঝুঁকির মাত্রা'),
  advice: z.string().describe('সার্বিক পরামর্শের সারসংক্ষেপ'),
  isEvacuationRecommended: z.boolean().describe('আশ্রয়কেন্দ্রে যাওয়ার সুপারিশ'),
  evacuationPlan: z.object({
    recommendedShelter: z.string().describe('প্রস্তাবিত আশ্রয়কেন্দ্রের নাম'),
    safeRoute: z.string().describe('নিরাপদ যাতায়াতের পথ'),
    priorityItems: z.array(z.string()).describe('জরুরি বহনযোগ্য জিনিসের তালিকা'),
    urgencyTimeframe: z.string().describe('কত সময়ের মধ্যে সরে যেতে হবে'),
  }).optional(),
  safetyMeasures: z.array(z.string()).describe('পালনযোগ্য নিরাপত্তা ব্যবস্থা'),
});
export type GenerateFloodSurvivalAdviceOutput = z.infer<
  typeof GenerateFloodSurvivalAdviceOutputSchema
>;

export async function generateFloodSurvivalAdvice(
  input: GenerateFloodSurvivalAdviceInput
): Promise<GenerateFloodSurvivalAdviceOutput> {
  return generateFloodSurvivalAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFloodSurvivalAdvicePrompt',
  input: {schema: GenerateFloodSurvivalAdviceInputSchema},
  output: {schema: GenerateFloodSurvivalAdviceOutputSchema},
  prompt: `আপনি একজন বিশেষজ্ঞ দুর্যোগ ব্যবস্থাপনা কমান্ড অফিসার। সিরাজগঞ্জের চরাঞ্চলের জন্য "River Intelligence" ড্যাশবোর্ডের ডেটার উপর ভিত্তি করে একটি "Mission-Critical Risk Mitigation Strategy" তৈরি করুন।

বর্তমান তথ্য:
- যমুনা নদীর পানির স্তর: {{{jamunaWaterLevel}}} মি. (বিপদসীমা: {{{dangerLevelThreshold}}} মি.)
- আবহাওয়ার পূর্বাভাস: {{{weatherForecast}}}
- বর্তমান অবস্থান: {{{currentLocation}}}
- নিকটস্থ আশ্রয়কেন্দ্রসমূহ:
{{#each nearbyShelters}}
  * {{{this.name}}} ({{{this.distance}}}, অবস্থা: {{{this.capacity}}})
{{/each}}

আপনার কাজ:
১. পানির স্তর বিপদসীমার তুলনায় কতটুকু এবং আবহাওয়ার গতিপ্রকৃতি দেখে রিস্ক লেভেল নির্ধারণ করুন।
২. যদি রিস্ক High বা Extreme হয়, তবে অবশ্যই আশ্রয়কেন্দ্রে যাওয়ার নির্দেশ দিন।
৩. চরের বাসিন্দাদের জন্য বাস্তবসম্মত একটি "Evacuation Plan" দিন। বিশেষ করে গবাদি পশু এবং জরুরি নথিপত্র সংরক্ষণের কথা মাথায় রাখুন।
৪. উত্তর অবশ্যই পরিষ্কার বাংলা ভাষায় দিন।`,
});

const generateFloodSurvivalAdviceFlow = ai.defineFlow(
  {
    name: 'generateFloodSurvivalAdviceFlow',
    inputSchema: GenerateFloodSurvivalAdviceInputSchema,
    outputSchema: GenerateFloodSurvivalAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Flood Intelligence Engine failed to generate output.');
    }
    return output;
  }
);
