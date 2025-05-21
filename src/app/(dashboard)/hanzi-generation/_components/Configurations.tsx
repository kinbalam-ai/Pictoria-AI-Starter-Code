/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Hanzi } from "../../hanzis/_components/types";
import {
  useCanvasImage,
  useGenerateHanzi,
  useSelectedPronunciations,
  useSetCanvasImage,
  useSetDisplayedCharacter,
  useSetSelectedPronunciations,
} from "./useGenerateHanziStore";

type ModelConfig = {
  fields: Record<
    string,
    {
      type: "number" | "text";
      label: string;
      min?: number;
      max?: number;
      default: number | string;
      step?: number;
      advanced?: boolean;
    }
  >;
  defaults: Record<string, number | string>;
};

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  "jagilley/controlnet-scribble": {
    fields: {
      guidance_scale: {
        // Changed from 'scale'
        type: "number",
        label: "Guidance Scale",
        min: 0.1,
        max: 30,
        default: 9,
        step: 0.1,
      },
      num_inference_steps: {
        // Changed from 'ddim_steps'
        type: "number",
        label: "Steps",
        min: 1,
        max: 100,
        default: 20,
      },
      a_prompt: {
        type: "text",
        label: "Added Prompt",
        default: "best quality, extremely detailed",
        advanced: true,
      },
      n_prompt: {
        type: "text",
        label: "Negative Prompt",
        default:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, bad quality, sketches, nsfw, watermark, brand, copyright, trademark",
        advanced: true,
      },
    },
    defaults: {
      seed: -1,
    },
  },
  "qr2ai/img2paint_controlnet": {
    fields: {
      guidance_scale: {
        // Changed from 'condition_scale'
        type: "number",
        label: "ControlNet Scale",
        min: 0,
        max: 1,
        default: 0.5,
        step: 0.1,
      },
      num_inference_steps: {
        // Already correct
        type: "number",
        label: "Denoising Steps",
        min: 1,
        max: 500,
        default: 50,
      },
      n_prompt: {
        type: "text",
        label: "Negative Prompt",
        default:
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, bad quality, sketches, nsfw, watermark, brand, copyright, trademark",
        advanced: true,
      },
    },
    defaults: {
      seed: 0,
    },
  },
  "openai/dall-e-3": {
    fields: {
      size: {
        type: "text",
        label: "Image Size",
        default: "1024x1024",
        advanced: true,
      },
      quality: {
        type: "text",
        label: "Quality",
        default: "standard",
        advanced: true,
      },
      style: {
        type: "text",
        label: "Style",
        default: "vivid",
        advanced: true,
      },
    },
    defaults: {
      // Add default values for any fields that should have different defaults
      // than what's specified in the fields configuration
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
    },
  },
  "openai/gpt-image-1": {
    fields: {
      size: {
        type: "text",
        label: "Image Size",
        default: "1024x1024",
        advanced: true
      },
      detail: {
        type: "text",
        label: "Detail Level",
        default: "high",
        advanced: true
      }
    },
    defaults: {
      size: "1024x1024",
      detail: "high"
    }
  }
};

type BaseGenerationFormValues = {
  model: string;
  prompt: string;
  seed: number;
  // Standardized fields
  guidance_scale?: number;
  num_inference_steps?: number;
  // Other fields
  a_prompt?: string;
  n_prompt?: string;
  negative_prompt?: string;
  // OpenAI-specific fields
  size?: "256x256" | "512x512" | "1024x1024" | "1024x1792" | "1792x1024";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
  // GPT Image 1 specific fields
  detail?: "low" | "medium" | "high" | "auto"; // Correct options for GPT Image 1
};
// 2. Create a type-safe default values initializer
// const getDefaultValues = (selectedModel?: string): BaseGenerationFormValues => {
//   const baseDefaults: BaseGenerationFormValues = {
//     model: selectedModel || "jagilley/controlnet-scribble",
//     prompt: "",
//     seed: -1,
//   };

//   if (!selectedModel || !MODEL_CONFIGS[selectedModel]) {
//     return baseDefaults;
//   }

//   const modelDefaults = Object.entries(MODEL_CONFIGS[selectedModel].fields)
//     .reduce((acc, [key, field]) => {
//       // Type-safe assignment
//       if (field.type === "number") {
//         acc[key as keyof BaseGenerationFormValues] = field.default as number;
//       } else {
//         acc[key as keyof BaseGenerationFormValues] = field.default as string;
//       }
//       return acc;
//     }, {} as Partial<BaseGenerationFormValues>);

//   return {
//     ...baseDefaults,
//     ...modelDefaults,
//   };
// };

const createFormSchema = (selectedModel?: string) => {
  // Base fields for all models
  const baseFields = {
    model: z.string().min(1, {
      message: "Please select a model to use for generation",
    }),
    prompt: z
      .string()
      .min(1, {
        message: "Prompt cannot be empty - describe what you want to generate",
      })
      .max(1000, {
        message: "Prompt must be less than 1000 characters",
      }),
    seed: z
      .number()
      .int()
      .min(-1)
      .refine((val) => val === -1 || val >= 0, {
        message:
          "Use -1 for random seed or a positive number for reproducibility",
      }),
  };

  if (!selectedModel) return z.object(baseFields);

  const modelConfig = MODEL_CONFIGS[selectedModel];
  if (!modelConfig) return z.object(baseFields);

  // Add model-specific fields
  const allFields = {
    ...baseFields,
    ...Object.entries(modelConfig.fields).reduce((acc, [fieldName, config]) => {
      return {
        ...acc,
        [fieldName]: config.type === "number" ? z.number() : z.string(),
      };
    }, {}),
  };

  return z.object(allFields);
};

interface ConfigurationsProps {
  userModels: any[];
  character: string;
  model_id?: string;
  hanziData?: Hanzi;
}

const Configurations = ({
  userModels,
  model_id,
  hanziData,
  character,
}: ConfigurationsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    model_id || "jagilley/controlnet-scribble"
  );
  const [displayCharacter, setDisplayCharacter] = useState(() => {
    const showTraditional = hanziData?.traditional_character === character;
    return showTraditional && hanziData?.traditional_character
      ? hanziData.traditional_character
      : hanziData?.standard_character || character;
  });
  const [pronunciationOrder, setPronunciationOrder] = useState<string[]>([]);
  const selectedPronunciations = useSelectedPronunciations();
  const setSelectedPronunciations = useSetSelectedPronunciations();

  const formSchema = useMemo(
    () => createFormSchema(selectedModel),
    [selectedModel]
  );

  const form = useForm<BaseGenerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: selectedModel,
      prompt: "",
      seed: -1,
      // Add OpenAI defaults
      size: "1024x1024",
      quality: "standard",
      style: "vivid",
      ...(selectedModel && MODEL_CONFIGS[selectedModel]
        ? Object.entries(MODEL_CONFIGS[selectedModel].fields).reduce(
            (acc, [key, field]) => {
              (acc as Record<string, string | number>)[key] = field.default;
              return acc;
            },
            {} as Partial<BaseGenerationFormValues>
          )
        : {}),
    },
  });

  useEffect(() => {
    if (hanziData?.pinyin) {
      const order = hanziData.pinyin.map((p) => p.pronunciation);
      setPronunciationOrder(order);
      setSelectedPronunciations([]);
    }
  }, [hanziData]);

  const togglePronunciation = (pronunciation: string) => {
    const newSelected = selectedPronunciations.includes(pronunciation)
      ? selectedPronunciations.filter((p) => p !== pronunciation)
      : [...selectedPronunciations, pronunciation];

    const orderedSelected = pronunciationOrder.filter((p) =>
      newSelected.includes(p)
    );
    setSelectedPronunciations(orderedSelected);
  };

  const canvasImage = useCanvasImage();
  const setDisplayedCharacter = useSetDisplayedCharacter();

  useEffect(() => {
    setDisplayedCharacter(displayCharacter);
  }, [displayCharacter]);

  const handleModelChange = (newModel: string) => {
    const prevValues = form.getValues();
    const newDefaults = MODEL_CONFIGS[newModel]?.defaults || {};

    form.reset({
      ...prevValues,
      model: newModel,
      ...Object.fromEntries(
        Object.entries(MODEL_CONFIGS[newModel]?.fields || {}).map(
          ([key, field]) => [key, field.default]
        )
      ),
      ...newDefaults,
    } as BaseGenerationFormValues);

    setSelectedModel(newModel);
  };

  const generateHanzi = useGenerateHanzi();

  async function onSubmit(values: BaseGenerationFormValues) {
    console.log("Form values:", values);

    try {
      const payload = {
        ...values,
        canvasImage,
        selectedPronunciations,
        character: displayCharacter,
        standard_character: hanziData?.standard_character,
        traditional_character: hanziData?.traditional_character,
      };

      // The store's generateHanzi will handle the appropriate API call
      await generateHanzi(payload);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {hanziData && (
          <fieldset className="rounded-lg border p-3 bg-background">
            <div className="flex justify-between items-start gap-4 mb-2">
              <legend className="text-sm font-medium px-1">
                Hanzi Details
              </legend>
              {hanziData.traditional_character &&
                hanziData.traditional_character !==
                  hanziData.standard_character && (
                  <div className="top-4 right-4 flex items-center gap-2">
                    <Switch
                      checked={
                        displayCharacter === hanziData.traditional_character
                      }
                      onClick={() =>
                        displayCharacter === hanziData.traditional_character
                          ? setDisplayCharacter(hanziData.standard_character)
                          : setDisplayCharacter(
                              hanziData.traditional_character!
                            )
                      }
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-sm font-medium">
                      {hanziData.standard_character}
                    </span>
                    {"/"}
                    <span className="text-sm font-medium">
                      {hanziData.traditional_character}
                    </span>
                  </div>
                )}
            </div>

            <div className="flex flex-col xs:flex-row gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 border rounded-lg shrink-0">
                <span className="text-3xl font-bold">{displayCharacter}</span>
              </div>

              <div className="grid gap-1.5 flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-muted-foreground shrink-0">
                    Definition:
                  </p>
                  <p className="text-sm font-medium truncate">
                    {hanziData.definition || "No definition available"}
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <p className="text-xs text-muted-foreground shrink-0">
                    Pinyin:
                  </p>
                  {hanziData.pinyin?.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {hanziData.pinyin?.map((pinyinObj) => {
                          const isSelected = selectedPronunciations.includes(
                            pinyinObj.pronunciation
                          );
                          return (
                            <Button
                              key={pinyinObj.pronunciation}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                togglePronunciation(pinyinObj.pronunciation)
                              }
                            >
                              {pinyinObj.pronunciation}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>
        )}

        <fieldset className="rounded-lg border p-4 bg-background space-y-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={handleModelChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jagilley/controlnet-scribble">
                        ControlNet Scribble
                      </SelectItem>
                      <SelectItem value="qr2ai/img2paint_controlnet">
                        Img2Paint ControlNet
                      </SelectItem>
                      <SelectItem value="openai/dall-e-3">
                        OpenAI DALL·E 3
                      </SelectItem>
                      <SelectItem value="openai/gpt-image-1">OpenAI GPT Image 1</SelectItem>
                      {userModels?.map(
                        (model) =>
                          model.training_status === "succeeded" && (
                            <SelectItem
                              key={model.id}
                              value={`${process.env.NEXT_PUBLIC_REPLICATE_USER_NAME}/${model.model_id}:${model.version}`}
                            >
                              {model.model_name ?? ""}
                            </SelectItem>
                          )
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={
                        selectedModel === "openai/gpt-image-1"
                          ? "Describe the image with precise details for GPT Image 1..."
                          : selectedModel === "openai/dall-e-3"
                          ? "Example: 'A watercolor painting of the character...'"
                          : "Describe the image you want to generate..."
                      }
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedModel && MODEL_CONFIGS[selectedModel] && (
              <div className="grid gap-4">
                {/* Show only relevant fields based on model */}
                {selectedModel !== "openai/dall-e-3" ? (
                  /* Replicate model fields */
                  <>
                    {Object.entries(MODEL_CONFIGS[selectedModel].fields)
                      .filter(([_, config]) => !config.advanced)
                      .map(([name, config]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name as keyof BaseGenerationFormValues}
                          render={({ field }) => {
                            if (config.type === "number") {
                              return (
                                <FormItem>
                                  <FormLabel>{config.label}</FormLabel>
                                  <div className="space-y-2">
                                    <div className="flex gap-4">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min={config.min}
                                          max={config.max}
                                          step={config.step ?? 1}
                                          value={field.value as number}
                                          onChange={(e) => {
                                            const value = Number(
                                              e.target.value
                                            );
                                            field.onChange(
                                              isNaN(value)
                                                ? config.default
                                                : value
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <Slider
                                        value={[field.value as number]}
                                        min={config.min}
                                        max={config.max}
                                        step={config.step ?? 1}
                                        onValueChange={(vals) =>
                                          field.onChange(vals[0])
                                        }
                                      />
                                    </div>
                                  </div>
                                </FormItem>
                              );
                            }
                            return (
                              <FormItem>
                                <FormLabel>{config.label}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={field.value as string}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                  </>
                ) : (
                  /* OpenAI-specific guidance */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>
                        For best results with DALL·E 3, describe the artistic
                        style and context
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keep this single prompt field for all models */}
            {/* <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder={
                        selectedModel === "openai/dall-e-3"
                          ? "Example: 'A watercolor painting of the character surrounded by cherry blossoms, soft pastel colors, delicate brush strokes'"
                          : "Describe the image you want to generate..."
                      }
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            <div className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full justify-start"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide Advanced
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show Advanced
                  </>
                )}
              </Button>

              {showAdvanced && (
                <div className="space-y-4 border-t pt-4">
                  {/* Seed field - show for all models */}
                  <FormField
                    control={form.control}
                    name="seed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seed</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value === -1 ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? -1 : Number(value));
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                field.onChange(-1);
                              }
                            }}
                            placeholder="-1 for random"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Model-specific advanced options */}
                  {selectedModel === "openai/gpt-image-1" ? (
                    <>
    <FormField
      control={form.control}
      name="size"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image Size</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1024x1024">1024x1024 (Square)</SelectItem>
              <SelectItem value="1536x1024">1536x1024 (Landscape)</SelectItem>
              <SelectItem value="1024x1536">1024x1536 (Portrait)</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="detail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Detail Level</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select detail level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  </>
                  ) : selectedModel === "openai/dall-e-3" ? (
                    <>
                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image Size</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1024x1024">
                                  1024x1024 (Square)
                                </SelectItem>
                                <SelectItem value="1024x1792">
                                  1024x1792 (Portrait)
                                </SelectItem>
                                <SelectItem value="1792x1024">
                                  1792x1024 (Landscape)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quality</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select quality" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="hd">
                                  HD (Higher Quality)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Style</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vivid">
                                  Vivid (More dramatic)
                                </SelectItem>
                                <SelectItem value="natural">
                                  Natural (More realistic)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    /* Advanced fields for Replicate models */
                    Object.entries(MODEL_CONFIGS[selectedModel].fields)
                      .filter(([_, config]) => config.advanced)
                      .map(([name, config]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name as keyof BaseGenerationFormValues}
                          render={({ field }) => {
                            if (config.type === "number") {
                              return (
                                <FormItem>
                                  <FormLabel>{config.label}</FormLabel>
                                  <div className="flex gap-4">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        type="number"
                                        min={config.min}
                                        max={config.max}
                                        step={config.step ?? 1}
                                        value={field.value as number}
                                        onChange={(e) => {
                                          const value = Number(e.target.value);
                                          field.onChange(
                                            isNaN(value)
                                              ? config.default
                                              : value
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <Slider
                                      value={[field.value as number]}
                                      min={config.min}
                                      max={config.max}
                                      step={config.step ?? 1}
                                      onValueChange={(vals) =>
                                        field.onChange(vals[0])
                                      }
                                    />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              );
                            }
                            return (
                              <FormItem>
                                <FormLabel>{config.label}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    value={field.value as string}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      ))
                  )}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full">
              Generate
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};

export default Configurations;
