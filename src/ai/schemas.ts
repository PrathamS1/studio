// src/ai/schemas.ts
/**
 * @fileOverview Shared Zod schemas for AI flows.
 */
import {z} from 'genkit';

export const ExtractKeyInformationOutputSchema = z.object({
  keywords: z.array(z.string()).describe('Keywords extracted from the text.'),
  importantPoints: z.array(z.string()).describe('Important points extracted from the text.'),
});

export const IdentifyCharactersOutputSchema = z.object({
  characters: z
    .array(
      z.object({
        name: z.string().describe('The name of the character.'),
        description: z.string().describe('A brief description of the character.'),
      })
    )
    .describe('The list of characters identified in the text.'),
});
