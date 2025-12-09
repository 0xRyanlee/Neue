
import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { GenerationConfig, TagCategory } from "../types";
import { TAG_CATEGORIES } from "../constants";

// Helper to get API key from process.env. 
// Note: The App component ensures the user has selected a key before we get here.
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key not found in process.env.API_KEY");
    throw new Error("API Key missing. Please set your API key.");
  }
  return key;
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
    return "connection unstable. try again.";
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

// 3. Image Generation Service
export const generateStudioImage = async (
  config: GenerationConfig, 
  promptOverride?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

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

  const contents: any = {
    parts: [{ text: basePrompt }]
  };

  // Add reference images if they exist
  if (config.referenceImages.length > 0) {
    config.referenceImages.forEach(base64Data => {
      // Strip header if present
      const cleanBase64 = base64Data.split(',')[1] || base64Data;
      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg', 
          data: cleanBase64
        }
      });
    });
  }

  try {
    // Using gemini-3-pro-image-preview for high quality generation
    // This model requires the user to select a paid API key via window.aistudio
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: contents,
      config: {
        imageConfig: {
            aspectRatio: config.aspectRatio,
            imageSize: "2K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};
