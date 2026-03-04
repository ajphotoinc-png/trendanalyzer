import { GoogleGenAI, Type } from "@google/genai";
import { Trend, PromptResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function predictTrends(scope: 'Global' | 'Country', country?: string): Promise<Trend[]> {
  const locationContext = scope === 'Global' ? 'the entire world' : `the country: ${country}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Predict 5-7 high-demand Adobe Stock content trends for ${locationContext} for the year 2026. 
    Focus on upcoming holidays, seasonal changes, cultural events, or emerging visual styles that stock photographers and illustrators should prepare for 2-3 months in advance.
    
    Return the data as a JSON array of trend objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING, description: "Name of the holiday or trend" },
            date: { type: Type.STRING, description: "Approximate date or month in 2026" },
            category: { 
              type: Type.STRING, 
              enum: ["Holiday", "Seasonal", "Religious", "Global"] 
            },
            region: { 
              type: Type.STRING,
              enum: ["Global", "Asia", "Europe", "Americas", "Middle East", "Africa"]
            },
            country: { type: Type.STRING, description: "Country name if applicable" },
            description: { type: Type.STRING, description: "Why this is a trend and what visuals are needed" },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["id", "name", "date", "category", "region", "description", "tags"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to predict trends");
  return JSON.parse(text) as Trend[];
}

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
