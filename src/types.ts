export interface Trend {
  id: string;
  name: string;
  date: string;
  category: 'Holiday' | 'Seasonal' | 'Religious' | 'Global';
  region: 'Global' | 'Asia' | 'Europe' | 'Americas' | 'Middle East' | 'Africa';
  country?: string;
  description: string;
  tags: string[];
}

export interface GeneratedPrompt {
  type: 'Photography' | 'Vector' | 'AI-Generated';
  prompt: string;
  keywords: string[];
  title: string;
}

export interface PromptResponse {
  prompts: GeneratedPrompt[];
}
