'use server';
/**
 * @fileOverview Imperial Voice OTP Flow.
 * Generates a random 6-digit code and creates TTS audio in Bengali.
 *
 * - generateVoiceOtp - Main function to get the OTP and audio.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';

const VoiceOtpOutputSchema = z.object({
  otp: z.string().describe('The generated 6-digit OTP code'),
  audioDataUri: z.string().describe('Base64 encoded WAV audio data URI'),
});
export type VoiceOtpOutput = z.infer<typeof VoiceOtpOutputSchema>;

export async function generateVoiceOtp(): Promise<VoiceOtpOutput> {
  return generateVoiceOtpFlow();
}

/**
 * Converts PCM data from Gemini TTS to WAV format.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateVoiceOtpFlow = ai.defineFlow(
  {
    name: 'generateVoiceOtpFlow',
    outputSchema: VoiceOtpOutputSchema,
  },
  async () => {
    // 1. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const spacedOtp = otp.split('').join(' ');

    // 2. Prepare the Bengali TTS prompt
    const query = `মহামান্য সম্রাট, সিরাজগঞ্জ সুরক্ষা পোর্টালে আপনার প্রবেশের গোপন কোডটি হলো: ${spacedOtp}। আমি আবার বলছি, আপনার কোডটি হলো: ${spacedOtp}। জয় আপনার হোক।`;

    // 3. Generate Audio via Gemini TTS
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });

    if (!media || !media.url) {
      throw new Error('TTS Engine failed to produce audio media.');
    }

    // 4. Extract and convert PCM to WAV
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      otp,
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
