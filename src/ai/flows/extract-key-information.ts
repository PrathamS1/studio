'use server';
/**
 * @fileOverview Extracts keywords and important points from a document using AI.
 *
 * - extractKeyInformation - A function that extracts key information from the text.
 * - ExtractKeyInformationInput - The input type for the extractKeyInformation function.
 * - ExtractKeyInformationOutput - The return type for the extractKeyInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractKeyInformationInputSchema = z.object({
  text: z.string().describe('The text document to extract key information from.'),
});
export type ExtractKeyInformationInput = z.infer<typeof ExtractKeyInformationInputSchema>;

const ExtractKeyInformationOutputSchema = z.object({
  keywords: z.array(z.string()).describe('Keywords extracted from the text.'),
  importantPoints: z.array(z.string()).describe('Important points extracted from the text.'),
});
export type ExtractKeyInformationOutput = z.infer<typeof ExtractKeyInformationOutputSchema>;

export async function extractKeyInformation(input: ExtractKeyInformationInput): Promise<ExtractKeyInformationOutput> {
  return extractKeyInformationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractKeyInformationPrompt',
  input: {schema: ExtractKeyInformationInputSchema},
  output: {schema: ExtractKeyInformationOutputSchema},
  prompt: `You are an expert at extracting key information from text documents.

  Extract the keywords and important points from the following text.

  Text: {{{text}}}

  Keywords:
  - ... (list of keywords)

  Important Points:
  - ... (list of important points)

  Format your response as a JSON object that conforms to the schema.`,
});

const extractKeyInformationFlow = ai.defineFlow(
  {
    name: 'extractKeyInformationFlow',
    inputSchema: ExtractKeyInformationInputSchema,
    outputSchema: ExtractKeyInformationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
