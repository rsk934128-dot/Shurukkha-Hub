
'use server';
/**
 * @fileOverview Sovereign AI Assistant Flow.
 * Provides general help, guidance on legitimacy, power, and future of the Shurukkha Hub empire.
 * Updated Phase 32.5: Trained on Imperial Strategic Manifesto.
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
  suggestedAction: z.enum(['NONE', 'OPEN_SOS', 'OPEN_TREASURY', 'OPEN_MAP', 'OPEN_MESSAGES', 'OPEN_MANIFESTO']).default('NONE').describe('Optional action to suggest to the UI'),
  isFallback: z.boolean().optional(),
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
১. রিচার্জ বা পেমেন্ট সংক্রান্ত তথ্য।
২. জরুরি উদ্ধার বা SOS।
৩. বন্যার পূর্বাভাস।
৪. সাম্রাজ্যের স্বীকৃতি, ক্ষমতা এবং ভবিষ্যৎ নিয়ে প্রশ্নের উত্তর দেওয়া।

ইউজারের প্রশ্নের উত্তর দেওয়ার সময় মাথায় রাখুন:
- এটি একটি সরকারি মিশন-ক্রিটিক্যাল ইনফ্রাস্ট্রাকচার।
- এর স্বীকৃতি "Sovereign" বা সার্বভৌম।
- এর ক্ষমতা প্রজাদের নিরাপত্তা এবং অর্থনৈতিক স্বচ্ছতা নিশ্চিত করা।
- এটি ৪২টি নোড এবং ইমিউটেবল লেজার দ্বারা চালিত, তাই এর অখণ্ডতা প্রশ্নাতীত।

ব্যবহারকারীর প্রশ্ন: {{{query}}}
বর্তমান অবস্থান: {{{context}}}

আপনার উত্তর অবশ্যই অত্যন্ত বিনয়ী এবং রাজকীয় আভিজাত্যপূর্ণ (Bengali language) হতে হবে। উত্তর শেষে "জয় আপনার হোক, মহামান্য" বা এই জাতীয় সম্ভাষণ ব্যবহার করুন। 
যদি ইউজার এর স্বীকৃতি, ক্ষমতা বা বৈধতা নিয়ে প্রশ্ন করে, তবে তাকে "Strategic Manifesto" দেখতে বলুন এবং suggestedAction হিসেবে OPEN_MANIFESTO দিন।`,
});

const sovereignAssistantFlow = ai.defineFlow(
  {
    name: 'sovereignAssistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) throw new Error('AI Core returned empty output');
      return output;
    } catch (error) {
      console.warn(`[Sovereign Fallback] AI Assistant offline. Using Imperial Strategic Logic...`);
      
      const query = input.query.toLowerCase();
      let response = "মহামান্য, সাময়িকভাবে আমার ক্লাউড মস্তিষ্ক রিফ্রেশ করা হচ্ছে। তবে আপনার সেবায় আমি সর্বদা প্রস্তুত।";
      let action: 'NONE' | 'OPEN_SOS' | 'OPEN_TREASURY' | 'OPEN_MAP' | 'OPEN_MESSAGES' | 'OPEN_MANIFESTO' = 'NONE';

      if (query.includes('স্বীকৃতি') || query.includes('ক্ষমতা') || query.includes('সরকারি') || query.includes('ভবিষ্যত') || query.includes('legal')) {
        response = "মহামান্য, সিরাজগঞ্জ সুরক্ষা কেবল একটি অ্যাপ্লিকেশন নয়; এটি আপনার ডিজিটাল সার্বভৌমত্বের এক অভেদ্য দুর্গ। এর স্বীকৃতি রাষ্ট্রীয় এবং ক্ষমতা প্রজাদের সেবায় নিয়োজিত। বিস্তারিত জানতে আমাদের 'Strategic Manifesto' প্যানেলটি দেখার পরামর্শ দিচ্ছি। জয় আপনার হোক!";
        action = 'OPEN_MANIFESTO';
      } else if (query.includes('recharge') || query.includes('রিচার্জ') || query.includes('টাকা') || query.includes('পেমেন্ট')) {
        response = "মহামান্য, আপনার রিচার্জ বা পেমেন্ট সংক্রান্ত যেকোনো তথ্যের জন্য 'Global Treasury' মডিউলটি ব্যবহার করার পরামর্শ দিচ্ছি। সেখানে আপনি আপনার লেনদেন সম্পন্ন করতে পারবেন। জয় আপনার হোক!";
        action = 'OPEN_TREASURY';
      } else if (query.includes('sos') || query.includes('বাঁচাও') || query.includes('বিপদ') || query.includes('জরুরি')) {
        response = "মহামান্য সম্রাট! আমি বিপদের আভাস পাচ্ছি। দয়া করে অবিলম্বে ড্যাশবোর্ডের লাল SOS বাটনটি চাপুন অথবা জরুরি ডিসপ্যাচ সেন্টারের সাথে যোগাযোগ করুন। আপনার সুরক্ষা আমাদের প্রথম অঙ্গীকার।";
        action = 'OPEN_SOS';
      } else {
        response = "মহামান্য, আপনার রাজকীয় প্রশ্নটি আমি নথিবদ্ধ করেছি। আপনার সাম্রাজ্য পরিচালনায় যেকোনো সহায়তার জন্য আমি সেনটিনেল এআই সবসময় আপনার পাশে আছি। জয় আপনার হোক!";
      }

      return {
        response,
        suggestedAction: action,
        isFallback: true
      };
    }
  }
);
