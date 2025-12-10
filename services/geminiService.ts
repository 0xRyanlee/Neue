import { GoogleGenAI, GenerateContentResponse, Chat, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { GenerationConfig, TagCategory, ModelTier } from "../types";
import { TAG_CATEGORIES } from "../constants";

// Helper to get API key with priority:
// 1. LocalStorage (User entered)
// 2. Process.env (Deployment config)
// 3. Throw error
export const getApiKey = (): string => {
  // Check LocalStorage first (for deployed app user override)
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) return localKey;

  // Check Process Env (injected by build tool or AI Studio)
  const envKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY; // Support Vite env
  if (envKey) return envKey;

  throw new Error("API Key missing. Please connect your account or enter a key in settings.");
};

// 1. Chat Consultation Service
export const createConsultationChat = (config: GenerationConfig): Chat => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const systemInstruction = `
    You are "Neue", a strict, minimalist art director and professional photographer.
    Your aesthetic is Swiss International Style: clean, objective, grid-based.
    
    Current User Configuration:
    - Style: ${config.style}
    - Lighting: ${config.lighting}
    - Camera: ${config.camera}
    - Environment: ${config.environment}
    - Pose: ${config.pose}
    
    Guidelines:
    1. Be concise. Use short sentences. Lowercase often. Minimalist tone.
    2. Confirm the user's tags.
    3. Ask ONE critical question to refine the shot (e.g., specific clothing color, exact mood).
    4. Do not offer encouragement. Offer solutions.
    
    Do NOT generate the image yourself. You are preparing the spec.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
    },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text || "processing request...";
  } catch (error) {
    console.error("Chat Error:", error);
    return "connection unstable. check api key.";
  }
};

// 2. Tag Analysis Service (Smart Context)
export const analyzeTagsFromContext = async (userText: string): Promise<Partial<GenerationConfig>> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const categoriesDescription = TAG_CATEGORIES.map(cat =>
    `${cat.id}: [${cat.options.join(', ')}]`
  ).join('\n');

  const prompt = `
    Analyze the following user description: "${userText}".
    Map it to the closest matching options for the following categories. 
    You MUST pick exactly one option from the provided lists for each category.
    
    Categories:
    ${categoriesDescription}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            lighting: { type: Type.STRING },
            camera: { type: Type.STRING },
            environment: { type: Type.STRING },
            pose: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<GenerationConfig>;
    }
    return {};
  } catch (e) {
    console.error("Tag Analysis Failed", e);
    return {};
  }
};

// 3. Image Generation Service (Proxy Mode)
export const generateStudioImage = async (
  config: GenerationConfig,
  promptOverride?: string
): Promise<string> => {

  // Construct a detailed prompt based on tags + any override
  const basePrompt = `
    Professional studio photography. High-end retouching.
    Style: ${config.style}.
    Lighting: ${config.lighting}.
    Camera: ${config.camera}.
    Environment: ${config.environment}.
    Subject Pose: ${config.pose}.
    
    CRITICAL REQUIREMENTS:
    - Photorealistic, 8k resolution.
    - NO watermarks, NO text, NO logos, NO overlays. 
    - Pure, clean image suitable for ID or professional use.
    - If "ID / Passport" is selected, ensure solid background and even lighting.
    
    ${promptOverride ? `Specific instructions: ${promptOverride}` : ''}
  `;

  // Construct Content Part
  const contents: any = {
    parts: [{ text: basePrompt }]
  };

  // Add reference images if they exist
  if (config.referenceImages.length > 0) {
    config.referenceImages.forEach(base64Data => {
      const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");

      contents.parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64
        }
      });
    });
  }

  // Determine model based on tier
  const modelName = config.modelTier || 'gemini-2.0-flash-exp';

  // Image Config
  const imageConfig: any = {};
  if (!modelName.includes('gemini-2.0-flash')) {
    imageConfig.aspectRatio = config.aspectRatio;
  }

  try {
    // Call our own Vercel API Proxy
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelName,
        contents,
        config: { imageConfig }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Server Error');
    }

    if (data.image) {
      return data.image;
    } else if (data.text) {
      // Fallback if model generated text (e.g. "I cannot do that")
      throw new Error(`Model returned text instead of image: ${data.text}`);
    } else {
      throw new Error(`No content generated. Reason: ${data.finishReason}`);
    }

  } catch (error: any) {
    console.error("Generation Error (Proxy):", error);
    alert(`Generation Failed: ${error.message}`);
    throw error;
  }
};
