import { GoogleGenAI } from "@google/genai";

export const generateAutoPrompt = async (
  base64Data: string, 
  mimeType: string, 
  additionalContext?: string,
  language: string = 'English'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for fast multimodal analysis and text generation
    const modelId = 'gemini-3-flash-preview';

    const contextInstruction = additionalContext 
      ? `ADDITIONAL CONTEXT FROM USER: "${additionalContext}". Use this to inform the mood, tone, and target audience.` 
      : '';

    const prompt = `
    You are an expert Commercial Photographer, Copywriter, and AI Prompt Engineer.
    
    OBJECTIVE:
    1. Analyze the uploaded product image in extreme detail.
    2. Generate a "3x3 grid product showcase" image prompt.
    3. Generate a compelling 30-second Voice Over (VO) script that matches the visual flow.
    
    ${contextInstruction}

    CRITICAL INSTRUCTION FOR PANELS:
    Do not use generic panel descriptions. You must create 9 DISTINCT panel descriptions that are specifically tailored to showcase the unique features of THIS product.
    
    REQUIRED OUTPUT FORMAT (Maintain this structure exactly with the separator):

    Single image, vertical 9:16, 3x3 grid (9 panels).
    Use the exact same background as the reference image: [Insert your analysis of the background].
    Same model (if present), same facial features and appearance.
    Same outfit and accessories: [Insert your analysis of the outfit, or "N/A" if no model].
    Same product: [Insert your analysis of the product]. No changes.

    Panel 1: [Establishing shot]
    Panel 2: [Detail/Texture]
    Panel 3: [Side profile]
    Panel 4: [In use/Interaction]
    Panel 5: [Lifestyle/Relaxed]
    Panel 6: [Top-down/Different detail]
    Panel 7: [3/4 Angle]
    Panel 8: [Quality/Finish]
    Panel 9: [Flexibility/Usability]

    Lighting must be soft and even, commercial studio style.
    
    ---VOICE_OVER_SCRIPT---
    
    CRITICAL: The Voice Over Script MUST be written in ${language}.
    
    **Language:** ${language}
    **Title:** [Catchy Title in ${language}]
    **Tone:** [Tone based on product, e.g., Energetic, Luxurious, Calm]
    **Duration:** 30 Seconds

    **Script:**
    (0:00-0:05) [Hook]: [Script line in ${language}...]
    (0:05-0:15) [Key Features]: [Script line in ${language}...]
    (0:15-0:25) [Benefit/Emotion]: [Script line in ${language}...]
    (0:25-0:30) [Call to Action]: [Script line in ${language}...]
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    return response.text || "Failed to generate prompt.";

  } catch (error) {
    console.error("Error generating prompt:", error);
    throw new Error("Failed to analyze image and generate prompt. Please try again.");
  }
};

export const generateProductImage = async (
  referenceImageBase64: string, 
  referenceMimeType: string, 
  prompt: string
): Promise<string> => {
  try {
    // Re-initialize to ensure latest API key if selected via dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Use gemini-2.5-flash-image for faster generation
    const modelId = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt },
          { 
            inlineData: {
              mimeType: referenceMimeType,
              data: referenceImageBase64
            }
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
          // imageSize is NOT supported for gemini-2.5-flash-image
        }
      }
    });

    // Iterate through parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please try again.");
  }
};