
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ShoppingLink } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export const generateStyledImage = async (
  base64Image: string,
  mimeType: string,
  stylePrompt: string
): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: stylePrompt }]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating styled image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};

export const refineImage = async (
  base64Image: string,
  mimeType: string,
  refinementPrompt: string
): Promise<string> => {
  try {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: refinementPrompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image generated from refinement.");
  } catch (error) {
    console.error("Error refining image:", error);
    throw new Error("Failed to refine image. Please try again.");
  }
};


export const getShoppingLinks = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<{ text: string; shoppingLinks: ShoppingLink[] }> => {
  try {
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { text: `Based on the user's request "${prompt}" and the provided image, identify key furniture and decor items. Then, generate a brief, friendly response to the user and a list of fictional, representative shopping links for those items. The URLs should be example.com placeholders.` },
          imagePart
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: {
              type: Type.STRING,
              description: 'A friendly, conversational response to the user.'
            },
            items: {
              type: Type.ARRAY,
              description: "A list of shoppable items.",
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: {
                    type: Type.STRING,
                    description: "Name of the furniture or decor item.",
                  },
                  description: {
                    type: Type.STRING,
                    description: "A brief, compelling description of the item.",
                  },
                  url: {
                    type: Type.STRING,
                    description: "A fictional URL for a similar product.",
                  },
                },
                required: ["itemName", "description", "url"],
              },
            },
          },
        },
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);

    return {
      text: parsedJson.responseText || "Here are some items you might like!",
      shoppingLinks: parsedJson.items || []
    };
  } catch (error) {
    console.error("Error getting shopping links:", error);
    return {
      text: "I had trouble finding specific items, but I can help with more design ideas!",
      shoppingLinks: []
    }
  }
};
