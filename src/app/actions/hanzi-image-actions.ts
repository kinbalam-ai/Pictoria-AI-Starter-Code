/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/actions/hanzi-image-actions.ts
// src/app/actions/hanzi-image-actions.ts
"use server";

import Replicate from "replicate";
import { revalidateTag } from "next/cache";
import { GenerationValues } from "../(dashboard)/hanzi-generation/_components/types";

type GenerationResponse = {
  error: string | null;
  success: boolean;
  data: any;
};

const MODEL_VERSIONS = {
  CONTROLNET_SCRIBBLE: "jagilley/controlnet-scribble:435061a1b5a4c1e26740464bf786efdfa9cb3a3ac488595a2de23e143fdb0117",
  IMG2PAINT_CONTROLNET: "qr2ai/img2paint_controlnet:592691cf624bb863fe5a01673badff425607ba56dbc499a74bbfdacd3ec0da55"
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
      data: null,
    };
  }

  console.log("Calling model from actions...");

  try {
    const output = await replicate.run(MODEL_VERSIONS.CONTROLNET_SCRIBBLE as `${string}/${string}`, {
      input: {
        image: input.canvasImage,
        prompt: input.prompt,
        seed: input.seed,
        scale: input.scale || 9,
        ddim_steps: input.ddim_steps || 20,
        a_prompt: input.a_prompt || "best quality, extremely detailed",
        n_prompt: input.n_prompt || "longbody, lowres, bad anatomy, bad hands",
      },
    });

    revalidateTag("hanzi-generations");
    return {
      error: null,
      success: true,
      data: output,
    };
  } catch (error: any) {
    console.log("Generation ERROR: ", error)
    return {
      error: error.message || "Failed to generate image",
      success: false,
      data: null,
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
      data: null,
    };
  }

  console.log("Calling model from actions2...");

  try {
    const output = await replicate.run(
      MODEL_VERSIONS.IMG2PAINT_CONTROLNET as `${string}/${string}`,
      {
        input: {
          image: input.canvasImage,
          prompt: input.prompt,
          seed: input.seed,
          condition_scale: input.condition_scale || 0.5,
          num_inference_steps: input.num_inference_steps || 50,
          negative_prompt: input.negative_prompt || "low quality, bad quality",
        },
      }
    );

    revalidateTag("hanzi-generations");
    return {
      error: null,
      success: true,
      data: output,
    };
  } catch (error: any) {
    console.error("Generation ERROR:", error);
    return {
      error: error.message || "Failed to generate image",
      success: false,
      data: null,
    };
  }
}

export async function storeHanziImages(
  images: Array<{
    url: string;
    model: string;
    prompt: string;
    num_inference_steps: number;
    num_outputs: number;
    guidance: number;
    aspect_ratio: string;
    output_format: string;
    output_quality: number;
  }>
): Promise<void> {
  // TODO: Implement actual Hanzi image storage logic
  console.log("Storing Hanzi images (not implemented)", images);
}
