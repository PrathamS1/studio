
// src/ai/flows/summarize-document.ts
'use server';
/**
 * @fileOverview Summarizes a document provided by the user, and orchestrates extraction of key information and character identification.
 *
 * - summarizeDocument - A function that handles the document summarization and detailed analysis process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { extractKeyInformation, type ExtractKeyInformationOutput } from './extract-key-information';
import { identifyCharacters, type IdentifyCharactersOutput } from './identify-characters';
import { ExtractKeyInformationOutputSchema, IdentifyCharactersOutputSchema } from '@/ai/schemas'; // Import from shared schemas

const SummarizeDocumentInputSchema = z.object({
  documentText: z.string().describe('The text content of the document to summarize.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

// This is the overall output schema for the flow, combining all analyses
const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise narrative summary of the document.'),
  keyInformation: ExtractKeyInformationOutputSchema.optional().describe('Extracted keywords and important points from the document.'),
  identifiedCharacters: IdentifyCharactersOutputSchema.optional().describe('Characters identified in the document, along with their descriptions.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

// Simplified schema for the prompt that only generates the narrative summary
const NarrativeSummarySchema = z.object({
  summary: z.string().describe('A concise narrative summary of the document.'),
});

const narrativeSummaryPrompt = ai.definePrompt({
  name: 'narrativeSummaryPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: NarrativeSummarySchema},
  prompt: `Generate a concise narrative summary for the following document. Focus only on the overall summary. Other details like keywords, important points, and characters will be handled separately.\n\nDocument:\n{{{documentText}}}`,  
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema, // Use the richer, combined output schema
  },
  async (input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> => {
    // Define promises for each analysis task
    const summaryPromise = narrativeSummaryPrompt(input);
    const keyInfoPromise = extractKeyInformation({ text: input.documentText });
    const charactersPromise = identifyCharacters({ text: input.documentText });

    // Await all promises, handling potential errors for each
    let narrativeSummary: string = "No summary could be generated.";
    let keyInfo: ExtractKeyInformationOutput | undefined;
    let chars: IdentifyCharactersOutput | undefined;

    try {
      const summaryResult = await summaryPromise;
      if (summaryResult.output) {
        narrativeSummary = summaryResult.output.summary;
      }
    } catch (e) {
      console.error("Error generating narrative summary:", e);
    }

    try {
      keyInfo = await keyInfoPromise;
    } catch (e) {
      console.error("Error extracting key information:", e);
    }

    try {
      chars = await charactersPromise;
    } catch (e) {
      console.error("Error identifying characters:", e);
    }
    
    return {
      summary: narrativeSummary,
      keyInformation: keyInfo,
      identifiedCharacters: chars,
    };
  }
);
