
import { GoogleGenAI, Type } from "@google/genai";
import type { Book } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'A creative and catchy title for the story, under 8 words.' },
    cover_illustration_prompt: { 
        type: Type.STRING, 
        description: 'A detailed, visually rich prompt for an AI image generator to create a book cover. The style should be whimsical and friendly, perfect for a children\'s book. Specify an art style (e.g., \'soft watercolor and ink\', \'chunky crayon drawing\', \'vibrant digital art\'), the lighting (e.g., \'warm morning light\', \'magical twilight glow\'), and the emotional tone (e.g., \'joyful and exciting\', \'calm and dreamy\'). Describe the main character(s) and the setting in detail.' 
    },
    pages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          page_number: { type: Type.INTEGER },
          text: { type: Type.STRING, description: 'The text for this page of the story. Around 15-25 words, suitable for a young child.' },
          illustration_prompt: { 
              type: Type.STRING, 
              description: 'A detailed prompt for an AI image generator to create an illustration for this specific page. The style must be whimsical and friendly, consistent with a children\'s book. Specify an art style (e.g., \'soft watercolor\', \'chunky crayon drawing\', \'vibrant digital art\'), the lighting (e.g., \'bright midday sun\', \'cozy firelight\'), and the emotional tone (e.g., \'adventurous and energetic\', \'quiet and peaceful\'). Describe the scene, characters, and their specific actions or emotions on this page.' 
          }
        },
        required: ["page_number", "text", "illustration_prompt"],
      }
    }
  },
  required: ["title", "cover_illustration_prompt", "pages"],
};

export const generateStory = async (prompt: string): Promise<Book> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a creative and wonderful children's storybook author. Your stories are engaging, positive, and have a gentle moral. You must generate a complete story based on the user's prompt, following the provided JSON schema precisely. All text must be in English.",
        responseMimeType: "application/json",
        responseSchema: storySchema,
      },
    });

    const text = response.text.trim();
    const storyData = JSON.parse(text);
    return storyData as Book;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to create a story. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `children's storybook illustration, whimsical and vibrant, friendly characters, simple shapes, soft lighting. No text, no words, no letters. ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to create an illustration.");
    }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
              parts: [
                { inlineData: { data: base64Image, mimeType } },
                { text: prompt },
              ],
            },
            config: {
                responseModalities: ["IMAGE", "TEXT"],
            },
          });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              return part.inlineData.data;
            }
        }
        throw new Error("No edited image was returned.");

    } catch(error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to enhance the uploaded image.");
    }
};
