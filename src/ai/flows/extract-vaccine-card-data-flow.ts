'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const VaccineInfoSchema = z.object({
  vaccineName: z.string().describe('The name of the vaccine administered.'),
  date: z.string().describe('The date the vaccine was administered (e.g., YYYY-MM-DD).'),
  dose: z.string().optional().describe('The dose number, if available (e.g., 1st, 2nd).'),
});

const VaccineCardDataSchema = z.object({
  fullName: z.string().describe("The full name of the person on the card."),
  dateOfBirth: z.string().describe("The person's date of birth (e.g., YYYY-MM-DD)."),
  vaccines: z.array(VaccineInfoSchema).describe("A list of all vaccines administered."),
});

export type VaccineCardData = z.infer<typeof VaccineCardDataSchema>;

const ExtractCardDataInputSchema = z.object({
  photoDataUri: z.string().describe("A photo of the vaccine card as a data URI."),
});

export type ExtractCardDataInput = z.infer<typeof ExtractCardDataInputSchema>;

export async function extractVaccineCardData(input: ExtractCardDataInput): Promise<VaccineCardData> {
  return extractDataFlow(input);
}

const extractDataPrompt = ai.definePrompt({
  name: 'extractDataPrompt',
  input: { schema: ExtractCardDataInputSchema },
  output: { schema: VaccineCardDataSchema },
  prompt: `You are an expert OCR system. Your task is to extract information from the provided image of a vaccination card.

  Analyze the image and extract the following information:
  1. The full name of the individual.
  2. Their date of birth.
  3. A list of all vaccines they have received, including the name of the vaccine and the date it was administered.

  Return the data in the specified JSON format. If a piece of information is not clearly visible, do your best to interpret it or leave it blank if impossible.

  Image to analyze:
  {{media url=photoDataUri}}
  `,
});

const extractDataFlow = ai.defineFlow(
  {
    name: 'extractDataFlow',
    inputSchema: ExtractCardDataInputSchema,
    outputSchema: VaccineCardDataSchema,
  },
  async (input) => {
    const { output } = await extractDataPrompt(input);
    return output!;
  }
);
