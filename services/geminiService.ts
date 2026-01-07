
import { GoogleGenAI, Type } from "@google/genai";
import { SlotData, MatchResult } from "../types";
import { MODEL_NAME } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Always use process.env.API_KEY directly as per SDK guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async fileToPart(base64Str: string) {
    const data = base64Str.split(',')[1];
    return {
      inlineData: {
        data: data,
        mimeType: "image/png"
      },
    };
  }

  async extractLobbyData(images: string[]): Promise<SlotData[]> {
    const parts = await Promise.all(images.map(img => this.fileToPart(img)));
    
    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            ...parts,
            { text: "Extract Free Fire lobby information from these screenshots. For each highlighted slot (1-12), list the 4 player names belonging to that slot. Return ONLY a JSON array of objects with 'slotNo' (number) and 'players' (array of strings). Use names exactly as they appear." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              slotNo: { type: Type.INTEGER },
              players: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["slotNo", "players"]
          }
        }
      }
    });

    try {
      // Fix: Direct access to .text property and handling undefined/empty case for JSON parsing
      const resultText = response.text || "[]";
      return JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse Lobby Data JSON", e);
      throw new Error("Lobby data extraction failed. Please try clearer images.");
    }
  }

  async extractEndData(images: string[]): Promise<MatchResult[]> {
    const parts = await Promise.all(images.map(img => this.fileToPart(img)));
    
    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          parts: [
            ...parts,
            { text: "Extract Free Fire match result ranking. The screenshots show ranks, player names, and elimination (kill) counts. One image might show ranks 1-10, another shows ranks 1-5 and 8-12. Merge them correctly, ensuring no duplicate entries for the same player. Return ONLY a JSON array of objects with 'rank' (number), 'playerName' (string), and 'kills' (number)." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              rank: { type: Type.INTEGER },
              playerName: { type: Type.STRING },
              kills: { type: Type.INTEGER }
            },
            required: ["rank", "playerName", "kills"]
          }
        }
      }
    });

    try {
      // Fix: Direct access to .text property and handling undefined/empty case for JSON parsing
      const resultText = response.text || "[]";
      return JSON.parse(resultText);
    } catch (e) {
      console.error("Failed to parse End Data JSON", e);
      throw new Error("End game data extraction failed. Please ensure rank and kills are visible.");
    }
  }
}
