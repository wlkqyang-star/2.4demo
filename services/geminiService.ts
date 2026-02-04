import { GoogleGenAI, Type } from "@google/genai";
import { GeminiEventResult } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMysteryEvent = async (): Promise<GeminiEventResult> => {
  try {
    const modelId = "gemini-3-flash-preview";
    
    const prompt = `
      You are the dungeon master of a magical mine. The player just mined a "Mystery Stone". 
      Generate a random short event description (max 10 words) and a gameplay effect.
      Effects can be: 
      - Finding extra gold (GOLD)
      - Gaining extra time (TIME)
      - A temporary strength burst (STRENGTH_BUFF)
      - Just a funny message with no effect (NOTHING)
      
      Make it fun and varied.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING, description: "A witty, short description of what happened." },
            effectType: { type: Type.STRING, enum: ["GOLD", "TIME", "STRENGTH_BUFF", "NOTHING"] },
            value: { type: Type.INTEGER, description: "The magnitude of the effect. Gold: 100-800. Time: 10-30. Strength: 0 (it's boolean). Nothing: 0." }
          },
          required: ["message", "effectType", "value"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as GeminiEventResult;

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback if API fails
    return {
      message: "The stone crumbles... nothing happens.",
      effectType: "NOTHING",
      value: 0
    };
  }
};
