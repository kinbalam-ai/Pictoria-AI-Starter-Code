/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/actions/hanzi-image-actions.ts
// src/app/actions/hanzi-image-actions.ts
"use server";

import Replicate from "replicate";
import { revalidateTag } from "next/cache";
import { GenerationValues } from "../(dashboard)/hanzi-generation/_components/types";
import { Database } from "@database.types";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { imgUrlToBlob } from "./image-actions";
import { imageMeta } from "image-meta";
// Add this to the top of hanzi-image-actions.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add this new function to hanzi-image-actions.ts

export type GenerationResponse = {
  error: string | null;
  success: boolean;
  data: any[];
};

const MODEL_VERSIONS = {
  CONTROLNET_SCRIBBLE:
    "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
  IMG2PAINT_CONTROLNET:
    "qr2ai/img2paint_controlnet:592691cf624bb863fe5a01673badff425607ba56dbc499a74bbfdacd3ec0da55",
};

type HanziGenerationInput = {
  model: string;
  prompt: string;
  seed: number;
  canvasImage: string;
  character: string;
  pronunciations: string[];
  // Model-specific fields
  scale?: number;
  ddim_steps?: number;
  a_prompt?: string;
  n_prompt?: string;
  condition_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function generateControlNetScribble(
  input: HanziGenerationInput
): Promise<GenerationResponse> {
  if (!process.env.REPLICATE_API_TOKEN) {
    return {
      error: "Missing REPLICATE_API_TOKEN",
      success: false,
      data: [],
    };
  }

  console.log("Calling model from actions...");

  try {
    const prediction = await replicate.predictions.create({
      version: MODEL_VERSIONS.CONTROLNET_SCRIBBLE,
      input: {
        image: input.canvasImage,
        prompt: input.prompt,
        seed: input.seed,
        guidance_scale: input.scale,
        num_inference_steps: input.ddim_steps,
        a_prompt: input.a_prompt,
        n_prompt: input.n_prompt,
      },
      wait: true, // Wait for completion
    });

    console.log("Prediction status:", prediction.status);
    console.log("Prediction output:", prediction.output);

    revalidateTag("hanzi-generations");
    return {
      error: null,
      success: true,
      data: prediction.output.slice(1),
    };
  } catch (error: any) {
    console.log("Generation ERROR: ", error);
    return {
      error: error.message || "Failed to generate image",
      success: false,
      data: [],
    };
  }
}

export async function generateImg2PaintControlNet(
  input: HanziGenerationInput
): Promise<GenerationResponse> {
  if (!process.env.REPLICATE_API_TOKEN) {
    return {
      error: "Missing REPLICATE_API_TOKEN",
      success: false,
      data: [],
    };
  }

  // Validate the input image
  if (!input.canvasImage) {
    const errorMsg =
      "Missing canvas image - please generate the character first";
    console.error(errorMsg);
    return {
      error: errorMsg,
      success: false,
      data: [],
    };
  }

  console.log("Calling img2paint model from actions...");

  try {
    const prediction = await replicate.predictions.create({
      version: MODEL_VERSIONS.IMG2PAINT_CONTROLNET,
      input: {
        image: input.canvasImage,
        prompt: input.prompt,
        seed: input.seed,
        condition_scale: input.condition_scale || 0.5,
        num_inference_steps: input.num_inference_steps || 40,
        negative_prompt: input.negative_prompt || "low quality, bad quality",
      },
      wait: true, // Wait for completion
    });

    console.log("Img2Paint Prediction status:", prediction.status);
    console.log("Img2Paint Prediction output:", prediction.output);

    // if (prediction.status !== "succeeded" || !prediction.output) {
    //   const errorMsg = "Img2Paint generation failed";
    //   console.error("Img2Paint generation failed:", errorMsg);
    //   return {
    //     error: errorMsg,
    //     success: false,
    //     data: [],
    //   };
    // }

    // Process the output (handle both array and single output cases)
    // const outputData = Array.isArray(prediction.output)
    //   ? prediction.output
    //   : [prediction.output];

    revalidateTag("hanzi-generations");
    return {
      error: null,
      success: true,
      data: [prediction.output],
    };
  } catch (error: any) {
    console.error("Img2Paint Generation ERROR:", error);
    return {
      error: error.message || "Failed to generate image",
      success: false,
      data: [],
    };
  }
}

export async function generateOpenAIImage(input: {
  prompt: string;
  character: string;
  canvasImage: string;
  pronunciations?: string[];
  model?: string;
  size?: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}): Promise<GenerationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error: "Missing OPENAI_API_KEY",
      success: false,
      data: [],
    };
  }

  console.log("Calling generateOpenAIImage model from actions...");

  try {
    // Build the enhanced prompt with pronunciations if available
    let enhancedPrompt = input.prompt;

    if (input.pronunciations && input.pronunciations.length > 0) {
      const pronunciationsText = input.pronunciations.join(", ");
      enhancedPrompt =
        `${input.prompt} featuring the Chinese character "${input.character}" (pronounced: ${pronunciationsText}). ` +
        `The character should be clearly visible and the main focus of the image. ` +
        `Incorporate elements that represent the sounds: ${pronunciationsText}.`;
    } else {
      enhancedPrompt =
        `${input.prompt} featuring the Chinese character "${input.character}". ` +
        `The character should be clearly visible and the main focus of the image.`;
    }

    const response = await openai.images.generate({
      model: input.model || "dall-e-3",
      prompt: enhancedPrompt,
      size: input.size || "1024x1024",
      quality: input.quality || "standard",
      style: input.style || "vivid",
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      return {
        error: "No image data returned from OpenAI",
        success: false,
        data: [],
      };
    }

    const firstImage = response.data[0];
    if (!firstImage.url) {
      return {
        error: "No image URL returned from OpenAI",
        success: false,
        data: [],
      };
    }

    revalidateTag("hanzi-generations");
    return {
      error: null,
      success: true,
      data: [firstImage.url],
    };
  } catch (error: any) {
    console.error("OpenAI Generation ERROR:", error);
    return {
      error: error.message || "Failed to generate image with OpenAI",
      success: false,
      data: [],
    };
  }
}

export async function generateGPTImage1(input: {
  prompt: string;
  character: string;
  canvasImage: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
  detail?: "low" | "medium" | "high" | "auto";
  pronunciations?: string[];
}): Promise<GenerationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error: "Missing OPENAI_API_KEY",
      success: false,
      data: [],
    };
  }

  console.log("Calling generateGPTImage1 model from actions...");

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `${input.prompt} featuring ${input.character}${
        input.pronunciations?.length
          ? ` (${input.pronunciations.join(", ")})`
          : ""
      }`,
      size: input.size === "auto" ? undefined : input.size,
      quality: input.detail === "auto" ? undefined : input.detail,
      n: 1,
    });

    if (!response.data?.[0]?.b64_json) {
      console.error("GPT Image 1 generation failed - no image data:", response);
      return {
        error: "Image generation succeeded but no image data was returned",
        success: false,
        data: [],
      };
    }

    // Convert base64 to data URL
    const imageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
    return {
      error: null,
      success: true,
      data: [imageUrl],
    };
  } catch (error: any) {
    console.error("GPT Image 1 Generation ERROR:", error);
    return {
      error: error.message || "Failed to generate image with GPT Image 1",
      success: false,
      data: [],
    };
  }
}

type StoreHanziImageInput = {
  url: string;
} & Database["public"]["Tables"]["generated_hanzi"]["Insert"];

interface ImageResponse {
  error: string | null;
  success: boolean;
  data: any | null;
}

export async function storeHanziImages(
  data: StoreHanziImageInput[]
): Promise<ImageResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized - Please log in to save images",
      success: false,
      data: null,
    };
  }

  console.log("storeHanziImages storeHanziImages storeHanziImages...")

  const uploadResults = await Promise.all(
    data.map(async (hanzi) => {
      try {
        // Handle both URL and base64 images
        const isBase64Image = hanzi.url.startsWith('data:image/');
        let fileBuffer: Buffer;
        let fileName = `hanzi_${Date.now()}_${user.id}.png`;

        if (isBase64Image) {
          // Process base64 image
          const base64Data = hanzi.url.replace(/^data:image\/\w+;base64,/, '');
          fileBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // Process URL image
          const response = await fetch(hanzi.url);
          if (!response.ok) throw new Error('Failed to fetch image URL');
          fileBuffer = Buffer.from(await response.arrayBuffer());
          
          // Try to get the original file extension
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('jpeg') || contentType?.includes('jpg')) {
            fileName = fileName.replace('.png', '.jpg');
          }
        }

        // Upload to storage
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('generated-hanzi')
          .upload(filePath, fileBuffer, {
            contentType: 'image/png', // Default to png
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('generated-hanzi')
          .getPublicUrl(filePath);

        // Prepare metadata for database
        const payload = {
          user_id: user.id,
          image_url: urlData.publicUrl,
          image_name: fileName,
          model: hanzi.model,
          standard_character: hanzi.standard_character,
          traditional_character: hanzi.traditional_character || null,
          prompt: hanzi.prompt,
          // // Conditionally include model-specific fields
          // ...(hanzi.model.includes('controlnet') && {
          //   guidance_scale: hanzi.guidance_scale,
          //   num_inference_steps: hanzi.num_inference_steps,
          // }),
          // ...(hanzi.model === 'gpt-image-1' && {
          //   detail_level: hanzi.detail,
          // }),
          // ...(hanzi.model === 'openai/dall-e-3' && {
          //   quality: hanzi.quality,
          //   style: hanzi.style,
          // }),
        };

        // Save to database
        const { data: dbData, error: dbError } = await supabase
          .from('generated_hanzi')
          .insert([payload])
          .select();

        if (dbError) throw dbError;

        return {
          success: true,
          data: {
            id: dbData[0].id,
            url: urlData.publicUrl,
          },
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error storing hanzi image:', errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    })
  );

  // Handle results
  const failedUploads = uploadResults.filter(result => !result.success);
  if (failedUploads.length > 0) {
    const errorMessages = failedUploads.map(f => f.error).join('; ');
    return {
      success: false,
      error: `Failed to store ${failedUploads.length} images: ${errorMessages}`,
      data: null,
    };
  }

  // Revalidate data
  revalidateTag('hanzi-generations');
  revalidateTag('dashboard-hanzi');

  return {
    success: true,
    error: null,
    data: {
      results: uploadResults.filter(r => r.success).map(r => r.data),
    },
  };
}

