import { GoogleGenAI, Type } from "@google/genai";
import { Trend, PromptResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateStockPrompts(trend: Trend): Promise<PromptResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 3 high-quality Adobe Stock content prompts for the upcoming trend: "${trend.name}". 
    The trend is described as: ${trend.description}.
    
    Provide one prompt for each category:
    1. Photography: Realistic, high-quality photo descriptions.
    2. Vector: Clean, modern graphic design or illustration concepts.
    3. AI-Generated: Detailed prompts optimized for AI image generators (like Firefly or Midjourney).
    
    For each, include a catchy title, the prompt itself, and 10 relevant keywords.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                prompt: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["type", "title", "prompt", "keywords"]
            }
          }
        },
        required: ["prompts"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate prompts");
  return JSON.parse(text) as PromptResponse;
}
