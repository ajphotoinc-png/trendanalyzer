import { GoogleGenAI, Type } from "@google/genai";
import { Trend, PromptResponse, GeneratedPrompt } from "../types";

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

export async function generateCategoryPrompts(trend: Trend, category: string, count: number = 10, personalization?: string): Promise<GeneratedPrompt[]> {
  const personalizationContext = personalization 
    ? `The user's personalization hint is: "${personalization}". Use this to inform the content of placeholders, but ALWAYS keep them as editable placeholders in the final prompt using square brackets, e.g., [${personalization}] or [YOUR NAME].`
    : "Always include editable placeholders like [YOUR NAME] or [CUSTOM MESSAGE] where text is needed.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} unique and high-quality content prompts for the trend: "${trend.name}" specifically for the category: "${category}".
    Trend description: ${trend.description}.
    
    ${personalizationContext}
    
    Category-Specific Rules:
    - Photography: Realistic, high-quality photo descriptions for stock or professional use.
    - Vector: Clean, modern graphic design or illustration concepts.
    - AI-Generated: Detailed prompts optimized for AI image generators.
    - Social-Media: Concepts for social media posts, posters, or flyers. Use square bracket placeholders for any text, e.g., "A sticker that says '[YOUR NAME]'".
    - Image-to-Image: Specific prompts for transforming a personal photo into a themed celebration photo. Describe outfits, poses, and festive backgrounds. Use placeholders for text on signs or clothing, e.g., "Holding a sign that says '[GREETING]'".
    - Photo-Editing: Universal instructions applied to a "reference photo". Start with phrases like "Apply to the reference photo...", "Enhance the reference photo by...", or "Edit the reference photo to...". Focus on color grading, lighting, and adding thematic elements.
    
    Return the data as a JSON object with a "prompts" array. Each prompt must have: type (the category name), title, prompt, and keywords (array of 10).`,
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
  if (!text) throw new Error("Failed to generate category prompts");
  const result = JSON.parse(text);
  return result.prompts as GeneratedPrompt[];
}

export async function generateContentPrompts(trend: Trend, personalization?: string): Promise<PromptResponse> {
  const personalizationContext = personalization 
    ? `The user's personalization hint is: "${personalization}". Use this to inform the content of placeholders, but ALWAYS keep them as editable placeholders in the final prompt using square brackets, e.g., [${personalization}] or [YOUR NAME].`
    : "Always include editable placeholders like [YOUR NAME] or [CUSTOM MESSAGE] where text is needed.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 6 high-quality content prompts for the upcoming trend: "${trend.name}". 
    The trend is described as: ${trend.description}.
    
    ${personalizationContext}
    
    Provide one prompt for each of these categories:
    1. Photography: Realistic, high-quality photo descriptions for stock or professional use.
    2. Vector: Clean, modern graphic design or illustration concepts.
    3. AI-Generated: Detailed prompts optimized for AI image generators.
    4. Social-Media: Concepts for social media posts, posters, or flyers. Use square bracket placeholders for any text, e.g., "[YOUR NAME]".
    5. Image-to-Image: Specific prompts for transforming a personal photo into a themed celebration photo. Describe outfits, poses, and festive backgrounds. Use placeholders for text, e.g., "[GREETING]".
    6. Photo-Editing: Universal instructions applied to a "reference photo". Start with phrases like "Apply to the reference photo...". Focus on color grading and lighting.
    
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
