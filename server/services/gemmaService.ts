import { GoogleGenAI } from '@google/genai';

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY || process.env.CultureVerse_API_Key || process.env.GEMMA_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }
  return key;
}

export async function askGemma(
  question: string,
  culturalContext: string
): Promise<string> {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMMA_MODEL ?? 'gemma-4-26b-a4b-it';

  const prompt = `
You are Ask Your Roots, the cultural learning assistant for CultureVerse.

Your purpose is to help people learn about Yoruba, Igbo, Hausa, and other African cultures.

Use the supplied cultural resources as your primary source of information.

Distinguish documented history from oral tradition, religious belief, and contemporary cultural practice.

Do not invent facts, quotations, or sources.

If the supplied information is insufficient, explain the uncertainty instead of making unsupported claims.

CULTURAL RESOURCES:
${culturalContext}

USER QUESTION:
${question}
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    if (!response.text) {
      throw new Error('Empty response received from Gemma model.');
    }

    return response.text;
  } catch (err: any) {
    console.error(`[Gemma Service] Error generating content with model ${model}:`, err.message || err);
    throw err;
  }
}
