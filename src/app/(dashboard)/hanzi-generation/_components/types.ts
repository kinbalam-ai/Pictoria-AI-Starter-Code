// types.ts
export type GenerationValues = {
  model: string;
  prompt: string;
  seed: number;
  canvasImage: string | null;
  selectedPronunciations: string[];
  character: string;
  // Add any other needed values
  standard_character?: string;
  traditional_character?: string;

  // Model-specific fields
  scale?: number;
  ddim_steps?: number;
  a_prompt?: string;
  n_prompt?: string;
  condition_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
};

export type ModelAction = (values: GenerationValues) => Promise<void>;

export type GenerateActions = {
  [key: string]: ModelAction;
};
