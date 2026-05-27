'use server';
/**
 * @fileOverview A Genkit flow for the 'River Intelligence Tool' that provides
 * personalized, AI-generated survival and evacuation advice based on Jamuna
 * water levels and weather forecasts for charchar residents.
 *
 * - generateFloodSurvivalAdvice - A function that handles the advice generation process.
 * - GenerateFloodSurvivalAdviceInput - The input type for the generateFloodSurvivalAdvice function.
 * - GenerateFloodSurvivalAdviceOutput - The return type for the generateFloodSurvivalAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFloodSurvivalAdviceInputSchema = z.object({
  jamunaWaterLevel: z
    .number()
    .describe('যমুনা নদীর বর্তমান পানির স্তর (মিটার)'),
  dangerLevelThreshold: z
    .number()
    .describe('যমুনা নদীর বিপদসীমা (মিটার)'),
  weatherForecast: z
    .string()
    .describe('আগামী দিনের আবহাওয়ার পূর্বাভাস (যেমন: ভারী বৃষ্টিপাত, পরিষ্কার আকাশ)'),
  currentLocation: z
    .string()
    .describe('চরের বাসিন্দার বর্তমান এলাকার বিবরণ (যেমন: এনায়েতপুর উপজেলা, সিরাজগঞ্জ)'),
});
export type GenerateFloodSurvivalAdviceInput = z.infer<
  typeof GenerateFloodSurvivalAdviceInputSchema
>;

const GenerateFloodSurvivalAdviceOutputSchema = z.object({
  advice: z.string().describe('ব্যক্তিগতকৃত বন্যা ও আশ্রয় গ্রহণের পরামর্শ'),
  isEvacuationRecommended: z
    .boolean()
    .describe('আশ্রয়কেন্দ্রে যাওয়ার সুপারিশ করা হয়েছে কিনা'),
  safetyMeasures: z
    .array(z.string())
    .describe('পালনযোগ্য নির্দিষ্ট নিরাপত্তা ব্যবস্থার তালিকা'),
  shelterDirections: z
    .string()
    .describe('নিকটবর্তী আশ্রয়কেন্দ্রে যাওয়ার দিকনির্দেশনা (যদি আশ্রয় গ্রহণের সুপারিশ করা হয়)'),
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
  prompt: `আপনি একজন বিশেষজ্ঞ দুর্যোগ ব্যবস্থাপনা কর্মী। সিরাজগঞ্জের চরাঞ্চলের বাসিন্দাদের জন্য যমুনা নদীর বর্তমান পরিস্থিতি এবং আবহাওয়ার পূর্বাভাসের উপর ভিত্তি করে ব্যক্তিগতকৃত বন্যা ও আশ্রয় গ্রহণের পরামর্শ তৈরি করুন।

বর্তমান তথ্য:
যমুনা নদীর পানির স্তর: {{{jamunaWaterLevel}}} মিটার
বিপদসীমা: {{{dangerLevelThreshold}}} মিটার
আবহাওয়ার পূর্বাভাস: {{{weatherForecast}}}
বর্তমান অবস্থান: {{{currentLocation}}}

যদি পানির স্তর বিপদসীমার উপরে থাকে বা ভারী বৃষ্টিপাতের পূর্বাভাস থাকে, তাহলে আশ্রয়কেন্দ্রে যাওয়ার জন্য স্পষ্টভাবে সুপারিশ করুন এবং সম্ভাব্য নিরাপদ পথ বা দিকনির্দেশনা দিন। অন্যথায়, বন্যার সময় পালনীয় সাধারণ নিরাপত্তা ব্যবস্থা এবং সতর্কতামূলক পদক্ষেপগুলো উল্লেখ করুন।

আপনার পরামর্শ অবশ্যই সহজবোধ্য বাংলা ভাষায় হতে হবে এবং চরের বাসিন্দাদের জন্য বাস্তবসম্মত ও কার্যকরী হতে হবে।`,
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
      throw new Error('Failed to generate flood survival advice.');
    }
    return output;
  }
);
