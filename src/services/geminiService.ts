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
    ? `The user wants to personalize the content with: "${personalization}". Incorporate this into the prompts where appropriate.`
    : "Include editable placeholders like [Your Name] or [Custom Message] where appropriate.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} unique and high-quality content prompts for the trend: "${trend.name}" specifically for the category: "${category}".
    Trend description: ${trend.description}.
    
    ${personalizationContext}
    
    Category Details:
    - Photography: Realistic, high-quality photo descriptions for stock or professional use.
    - Vector: Clean, modern graphic design or illustration concepts.
    - AI-Generated: Detailed prompts optimized for AI image generators.
    - Social-Media: Concepts for social media posts, posters, or flyers with editable placeholders.
    - Image-to-Image: Specific prompts for transforming a personal photo into a themed celebration photo (outfits, poses, festive backgrounds).
    - Photo-Editing: Instructions or prompts for editing existing photos (color grading, elements, style).
    
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
    ? `The user wants to personalize the content with: "${personalization}". Incorporate this into the prompts where appropriate, especially for Social-Media.`
    : "The prompt MUST include editable placeholders like [Your Name] or [Custom Message] to allow for personalization.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 6 high-quality content prompts for the upcoming trend: "${trend.name}". 
    The trend is described as: ${trend.description}.
    
    ${personalizationContext}
    
    Provide one prompt for each of these categories:
    1. Photography: Realistic, high-quality photo descriptions for stock or professional use.
    2. Vector: Clean, modern graphic design or illustration concepts.
    3. AI-Generated: Detailed prompts optimized for AI image generators (like Firefly or Midjourney).
    4. Social-Media: Concepts for social media posts, posters, or flyers.
    5. Image-to-Image: Specific prompts for transforming a personal photo into a themed celebration photo. Describe what the person should wear (e.g., abaya, traditional suit), their pose (e.g., hands together for greeting), and the festive background.
    6. Photo-Editing: Instructions or prompts for editing existing photos to match the theme (e.g., color grading, adding elements, or style transfers).
    
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
