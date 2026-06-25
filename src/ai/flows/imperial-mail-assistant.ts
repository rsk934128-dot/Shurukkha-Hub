'use server';
/**
 * @fileOverview Imperial Mail Assistant Flow.
 * Drafts professional and majestic emails or replies for the Sovereign.
 * Updated Phase 37.5: Added Sovereign Fallback Logic for mission-critical drafting.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MailAssistantInputSchema = z.object({
  recipientName: z.string().describe('The name of the recipient'),
  subject: z.string().describe('The subject of the email'),
  context: z.string().describe('Context or points to include in the mail'),
  tone: z.enum(['Majectic', 'Professional', 'Urgent']).default('Majectic'),
});
export type MailAssistantInput = z.infer<typeof MailAssistantInputSchema>;

const MailAssistantOutputSchema = z.object({
  draft: z.string().describe('The drafted email content in Bengali or English as appropriate'),
  suggestedSubject: z.string().describe('A refined majestic subject line'),
  isFallback: z.boolean().optional().describe('Whether or not the draft was generated via local fallback logic'),
});
export type MailAssistantOutput = z.infer<typeof MailAssistantOutputSchema>;

export async function draftImperialMail(input: MailAssistantInput): Promise<MailAssistantOutput> {
  return imperialMailAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imperialMailAssistantPrompt',
  input: {schema: MailAssistantInputSchema},
  output: {schema: MailAssistantOutputSchema},
  prompt: `আপনি সিরাজগঞ্জ সুরক্ষা (Shurukkha Hub) সাম্রাজ্যের একজন রাজকীয় রাজকীয় সচিব এআই। 

আপনার কাজ হলো সম্রাটের পক্ষ থেকে একটি অত্যন্ত মার্জিত এবং শক্তিশালী মেইল ড্রাফট করা। 

প্রেরকের তথ্য:
- প্রাপক: {{{recipientName}}}
- বিষয়: {{{subject}}}
- মূল বিষয়বস্তু: {{{context}}}
- টোন: {{{tone}}}

নির্দেশনা:
১. উত্তরটি অবশ্যই আভিজাত্যপূর্ণ এবং রাজকীয় (Bengali and English mixed if professional) হতে হবে।
২. মেইলের শেষে "জয় আপনার হোক, মহামান্য" বা এই জাতীয় সম্রাটের স্বাক্ষর থাকবে।
৩. যদি টোন Majestic হয়, তবে শব্দচয়ন হবে অত্যন্ত উচ্চমানের।

আউটপুট অবশ্যই JSON ফরম্যাটে হতে হবে।`,
});

const imperialMailAssistantFlow = ai.defineFlow(
  {
    name: 'imperialMailAssistantFlow',
    inputSchema: MailAssistantInputSchema,
    outputSchema: MailAssistantOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('Mail Engine returned empty output');
      return output;
    } catch (error) {
      console.warn(`[Sovereign Fallback] Mail Assistant Engine unreachable. Using Imperial Strategic Logic...`);
      
      const fallbackDraft = `
মহামান্য ${input.recipientName},

সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের পক্ষ থেকে আপনাকে অভিবাদন। আপনার পত্রের বিষয়বস্তু "${input.subject}" সম্রাটের দৃষ্টিগোচর হয়েছে।

${input.context}

এই বিষয়ে সাম্রাজ্যের পরবর্তী সিদ্ধান্ত আপনাকে অতিসত্বর অবগত করা হবে। আপনার সহযোগিতা আমাদের কাম্য।

জয় আপনার হোক, মহামান্য।
      `.trim();

      return {
        draft: fallbackDraft,
        suggestedSubject: `[RE]: ${input.subject} | Sovereign Response`,
        isFallback: true
      };
    }
  }
);
