
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Initialize GenAI on the server side (API Key is secure here)
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export default async function handler(request, response) {
    // 1. CORS Headers (Allow frontend access)
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*'); // Or specific domain
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    // Only allow POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { modelName, contents, config } = request.body;

        if (!apiKey) {
            throw new Error("Server Error: GEMINI_API_KEY is missing in environment.");
        }

        // Initialize backend-side safety settings
        // (We reconstruct this here to ensure enforcement even if frontend sends weak config)
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ];

        console.log(`[API] Generating with model: ${modelName}`);

        // Call Google AI
        const model = ai.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
            contents: contents.contents || contents, // Handle potential nesting
            generationConfig: {
                ...config,
                safetySettings: safetySettings
            }
        });

        const responseData = result.response;
        const candidates = responseData.candidates;

        if (!candidates || candidates.length === 0) {
            console.error("No candidates returned", responseData);
            return response.status(500).json({ error: "No candidates returned from AI" });
        }

        // Check for Finish Reason
        const candidate = candidates[0];
        if (candidate.finishReason !== "STOP" && candidate.finishReason !== "MAX_TOKENS" && candidate.finishReason !== undefined) {
            // If blocked, return the specific reason
            return response.status(400).json({
                error: `Generation Stopped. Reason: ${candidate.finishReason}`,
                details: candidate
            });
        }

        // Valid Success
        // Extract Image (inlineData) if present
        const parts = candidate.content?.parts || [];
        let imageBase64 = null;
        let textOutput = null;

        for (const part of parts) {
            if (part.inlineData) {
                imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
            }
            if (part.text) {
                textOutput = part.text;
            }
        }

        return response.status(200).json({
            success: true,
            image: imageBase64,
            text: textOutput,
            finishReason: candidate.finishReason
        });

    } catch (error) {
        console.error("[API Error]", error);
        return response.status(500).json({
            error: error.message || 'Internal Server Error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
