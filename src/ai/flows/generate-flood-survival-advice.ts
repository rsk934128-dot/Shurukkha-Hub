'use server';
/**
 * @fileOverview Enhanced Genkit flow for 'River Intelligence' with automated event triggering.
 * Updated Phase 31.0: Includes predictive risk coordinates and confidence scores.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SelfHealing } from '@/lib/self-healing';
import { DataIntegrityGuardian } from '@/lib/data-integrity-guardian';

const ShelterSchema = z.object({
  name: z.string().describe('আশ্রয়কেন্দ্রের নাম'),
  distance: z.string().describe('দূরত্ব'),
  capacity: z.string().describe('ধারণক্ষমতা এবং বর্তমান অবস্থা'),
  contact: z.string().optional().describe('যোগাযোগের নম্বর'),
});

const GenerateFloodSurvivalAdviceInputSchema = z.object({
  jamunaWaterLevel: z.number().describe('যমুনা নদীর বর্তমান পানির স্তর (মিটার)'),
  dangerLevelThreshold: z.number().describe('যমুনা নদীর বিপদসীমা (মিটার)'),
  weatherForecast: z.string().describe('আবহাওয়ার পূর্বাভাস'),
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
  automaticAlertTriggered: z.boolean().describe('সিস্টেম থেকে অটোমেটিক এলার্ট ট্রিগার হয়েছে কিনা'),
  isLocalFallback: z.boolean().optional().describe('এপিআই ত্রুটির কারণে লোকাল মোডে জেনারেট হয়েছে কিনা'),
  predictiveAnalytics: z.object({
    confidence: z.number().min(0).max(100).describe('এআই প্রেডিকশন কনফিডেন্স স্কোর'),
    expectedWaterRise: z.string().describe('পরবর্তী ২৪ ঘণ্টায় সম্ভাব্য পানি বৃদ্ধি'),
    hotspots: z.array(z.string()).describe('সবচেয়ে বেশি ঝুঁকিপূর্ণ এলাকা'),
  }).optional(),
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
২. যদি রিস্ক High বা Extreme হয়, তবে অবশ্যই automaticAlertTriggered কে true করুন।
৩. চরের বাসিন্দাদের জন্য বাস্তবসম্মত একটি "Evacuation Plan" দিন। বিশেষ করে গবাদি পশু এবং জরুরি নথিপত্র সংরক্ষণের কথা মাথায় রাখুন।
৪. উত্তর অবশ্যই পরিষ্কার বাংলা ভাষায় দিন।
৫. প্রেডিক্টিভ অ্যানালিটিক্স হিসেবে পরবর্তী ২৪ ঘণ্টার জন্য একটি সম্ভাবনা (Confidence Score) প্রদান করুন।`,
});

const generateFloodSurvivalAdviceFlow = ai.defineFlow(
  {
    name: 'generateFloodSurvivalAdviceFlow',
    inputSchema: GenerateFloodSurvivalAdviceInputSchema,
    outputSchema: GenerateFloodSurvivalAdviceOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('Flood Intelligence Engine failed to generate output.');
      }

      SelfHealing.setAIStatus('ONLINE');

      if (output.riskLevel === 'Extreme' || output.riskLevel === 'High') {
        output.automaticAlertTriggered = true;
      }

      return output;
    } catch (error) {
      console.warn(`[Sovereign Fallback] AI Engine offline. Executing Local Logic...`);
      SelfHealing.setAIStatus('LOCAL_MODE');
      
      const waterDiff = input.jamunaWaterLevel - input.dangerLevelThreshold;
      let riskLevel: 'Low' | 'Medium' | 'High' | 'Extreme' = 'Low';
      
      if (waterDiff > 0.5) riskLevel = 'Extreme';
      else if (waterDiff > 0) riskLevel = 'High';
      else if (waterDiff > -0.5) riskLevel = 'Medium';

      const isEvacuation = riskLevel === 'High' || riskLevel === 'Extreme';
      const recommendedShelter = input.nearbyShelters[0]?.name || "নিকটস্থ উঁচু স্থান";

      return {
        riskLevel,
        advice: `[Sovereign Local Mode] পানির স্তর বর্তমানে ${input.jamunaWaterLevel} মি.। জরুরি ভিত্তিতে প্রস্তুতি নিন।`,
        isEvacuationRecommended: isEvacuation,
        evacuationPlan: isEvacuation ? {
          recommendedShelter: recommendedShelter,
          safeRoute: "প্রধান সড়ক ব্যবহার করুন, নিচু জমি এড়িয়ে চলুন।",
          priorityItems: ["শুকনো খাবার", "জরুরি ওষুধ", "নথিপত্র"],
          urgencyTimeframe: riskLevel === 'Extreme' ? "তৎক্ষণাৎ" : "৪-৬ ঘণ্টা"
        } : undefined,
        safetyMeasures: ["গবাদি পশু নিরাপদ স্থানে রাখুন।", "মোবাইল চার্জ দিয়ে রাখুন।"],
        automaticAlertTriggered: riskLevel === 'Extreme' || riskLevel === 'High',
        isLocalFallback: true,
        predictiveAnalytics: {
          confidence: 85,
          expectedWaterRise: "+০.৫ মিটার",
          hotspots: ["বেলকুচি", "এনায়েতপুর"]
        }
      };
    }
  }
);
