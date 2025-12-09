
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

// Check standard env or VITE_ prefixed env (loaded by dotenv)
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ No GEMINI_API_KEY found in .env file");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function listModels() {
    console.log("🔍 Checking available models for this API Key...");
    try {
        const response = await ai.models.list();
        // The response format might vary, handling both array or object with models property
        const models = Array.isArray(response) ? response : (response.models || []);

        console.log(`\n✅ Found ${models.length} models:\n`);

        models.forEach((m: any) => {
            // Filter for image generation capable models if possible, or just list all
            if (m.name.includes('vision') || m.name.includes('image') || m.name.includes('flash') || m.name.includes('pro')) {
                console.log(`- ${m.name}`);
                console.log(`  Display Name: ${m.displayName}`);
                console.log(`  Capabilities: ${JSON.stringify(m.supportedGenerationMethods)}`);
                console.log('---');
            }
        });

    } catch (error: any) {
        console.error("❌ Failed to list models:", error.message);
    }
}

listModels();
