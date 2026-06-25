'use server';
/**
 * @fileOverview Imperial Mail Assistant Flow.
 * Drafts professional and majestic emails or replies for the Sovereign.
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
    const {output} = await prompt(input);
    if (!output) throw new Error('Mail Engine failed');
    return output;
  }
);
