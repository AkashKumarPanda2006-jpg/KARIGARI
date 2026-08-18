import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

// Initialize the Google Gen AI client
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Ordered list of models to try.
export const FALLBACK_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.5-flash'
];

/**
 * Utility function to attempt generating content with multiple models.
 * If a model fails with a 503 (High Demand), it automatically tries the next model in the fallback list.
 */
export async function generateContentWithFallback(contents: any, config?: any) {
  let lastError;

  for (const model of FALLBACK_MODELS) {
    try {
      console.log(`[Gemini] Attempting to use model: ${model}...`);
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: config
      });
      return response; // Success! Return the response.
    } catch (error: any) {
      console.warn(`[Gemini] Model ${model} failed: ${error.message}`);
      lastError = error;
      
      // If it's a 503 (High Demand) or 404 (Model Not Found), continue to the next model in the list
      if (
        error.status === 503 || 
        error.message?.includes("503") || 
        error.message?.includes("high demand") ||
        error.status === 404 ||
        error.message?.includes("is not found")
      ) {
        continue;
      }
      
      // For any other error (like a 400 Bad Request), throw immediately so we can fix it
      throw error;
    }
  }

  // If we exhaust all models
  throw lastError;
}
