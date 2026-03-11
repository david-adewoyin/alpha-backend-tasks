import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, } from '@google/genai';

import {
  SummarizationProvider,
  CandidateSummaryInput,
  CandidateSummaryResult
} from './summarization-provider.interface';

@Injectable()
export class GeminiSummarizationProvider implements SummarizationProvider {
  private genAI: GoogleGenAI;
  private readonly logger = new Logger(GeminiSummarizationProvider.name);


  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateCandidateSummary(
    input: CandidateSummaryInput,
  ): Promise<CandidateSummaryResult> {

    // Combine all document texts into one context
    const context = input.documents.join('\n\n');


    const prompt = `
      You are a professional HR assistant. Analyze the candidate documents provided.
      Return a JSON response with the following fields:
      - score (0-100)
      - strengths (array of strings)
      - concerns (array of strings)
      - summary (paragraph)
      - recommendedDecision ("advance", "hold", or "reject")

      Documents:
      ${context}
    `;


    try {
      const result = await this.genAI.models.generateContent({ contents: prompt, model: 'gemini-3-flash-preview' });
      const responseText = result.text!.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(responseText);


      // Validation of malformed model output
      if (!parsed.score || !parsed.recommendedDecision) {
        throw new Error('LLM output missing required fields');
      }

      return parsed as CandidateSummaryResult;
    } catch (e: any) {
      throw new Error(`LLM Error: ${e.message}`);
    }
  }
}