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
  model?: string;
  size?: string;
  quality?: string;
  style?: string;
  detail?: string;
  pronunciations?: string[];
}): Promise<GenerationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      error: "Missing OPENAI_API_KEY",
      success: false,
      data: [],
    };
  }

  console.log("Calling generateGPTImage1 model from actions: ", input);

  try {
    // const response = await openai.images.generate({
    //   model: "gpt-image-1",
    //   size: input.size === "auto" ? undefined : input.size, // Handle auto size
    //   model: "gpt-image-1",
    //   prompt: `${input.prompt} featuring ${input.character}${
    //     input.pronunciations?.length
    //       ? ` (${input.pronunciations.join(", ")})`
    //       : ""
    //   }. ${input.detail === 'high' ? 'Highly detailed.' : ''}`,
    //   quality: input.quality || "hd",
    //   style: input.style || "vivid",
    //   n: 1,
    // });

    // if (!response.data || response.data.length === 0) {
    //   return {
    //     error: "No image data returned from OpenAI",
    //     success: false,
    //     data: [],
    //   };
    // }

    // const firstImage = response.data[0];
    // if (!firstImage.url) {
    //   return {
    //     error: "No image URL returned from OpenAI",
    //     success: false,
    //     data: [],
    //   };
    // }

    return {
      error: null,
      success: true,
      data: ["firstImage.url"],
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
  // TODO: Implement actual Hanzi image storage logic
  console.log("Storing Hanzi images (not implemented)", data);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Unauthorized",
      success: false,
      data: null,
    };
  }

  const uploadResults = [];

  for (const hanzi of data) {
    // try {
    // !!
    if (!hanzi.url || !hanzi.standard_character) {
      throw new Error("Missing required fields (url or character)");
    }

    // 1. Download the generated image
    const arrayBuffer = await imgUrlToBlob(hanzi.url);
    const { width, height, type } = imageMeta(new Uint8Array(arrayBuffer));

    // 2. Generate unique filename
    const fileName = `hanzi_${randomUUID()}.${type}`;
    const filePath = `${user.id}/${fileName}`;

    // !! 3. Upload to storage
    console.log("Uploading to storage:", filePath);
    const { error: storageError } = await supabase.storage
      .from("generated-hanzi")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${type}`,
        cacheControl: "public, max-age=3600",
        upsert: true,
      });

    if (storageError) {
      throw storageError;
    }

    // console.log("Saving image to database...");
    // // 4. Get public URL
    // const { data: urlData } = supabase.storage
    //   .from("generated-hanzi")
    //   .getPublicUrl(filePath);

    const payload = {
      user_id: user.id,
      model: hanzi.model,
      standard_character: hanzi.standard_character,
      traditional_character: hanzi.traditional_character,
      image_name: fileName,
      prompt: hanzi.prompt,
      guidance_scale: hanzi.guidance_scale,
      num_inference_steps: hanzi.num_inference_steps,
      // output_format: type, // or hanzi.output_format if you prefer // !!
      // width,
      // height,
      // aspect_ratio: hanzi.aspect_ratio || `${width}:${height}`,
      // image_url: urlData.publicUrl,
    };

    // 5. Save metadata to database
    console.log("Saving Hanzi to database... PAYLOAD: ", payload);
    const { data: dbData, error: dbError } = await supabase
      .from("generated_hanzi")
      .insert([payload])
      .select();

    uploadResults.push({
      fileName,
      error: dbError?.message || null,
      success: !dbError,
      data: dbData || null,
    });

    // } catch (error) {
    //   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    //   uploadResults.push({
    //     fileName: hanzi.image_name || 'unknown',
    //     error: errorMessage,
    //     success: false,
    //     data: null,
    //   });
    // }
  }

  // Revalidate relevant tags
  revalidateTag("hanzi-generations");
  revalidateTag("dashboard-hanzi");

  return {
    error: null,
    success: true,
    data: { results: uploadResults },
  };
}
