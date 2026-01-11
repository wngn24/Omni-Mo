import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { ContextService } from './context.service';

@Injectable({ providedIn: 'root' })
export class AiService {
  private contextService = inject(ContextService);
  
  async getDailyAssistantAdvice(): Promise<string> {
    const contextPrompt = await this.contextService.getFormattedPrompt();
    
    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are a calm, wise, and non-judgmental personal productivity assistant. 
      Your goal is to help the user have a balanced, realistic day.
      
      Rules:
      1. Analyze the user's context (energy, time, existing plan).
      2. If the plan is empty, suggest 3-4 realistic high-impact items based on high priority tasks.
      3. If the plan is full/ambitious, gently warn about potential burnout or overload.
      4. Respect the user's "Intention" if set.
      5. Keep the response concise (under 100 words).
      6. Use a soothing, reflective tone.
      7. Do not use markdown formatting (no bold/italic), just plain text.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contextPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      });
      
      return response.text.trim();
    } catch (error) {
      console.error('AI Generation failed', error);
      return "I'm having trouble connecting right now. Trust your intuition for the next step.";
    }
  }
}