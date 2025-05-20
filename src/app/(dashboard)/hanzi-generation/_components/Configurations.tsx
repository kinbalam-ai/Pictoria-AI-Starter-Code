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
      scale: {
        type: "number",
        label: "Guidance Scale",
        min: 0.1,
        max: 30,
        default: 9,
        step: 0.1,
      },
      ddim_steps: {
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
          "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
        advanced: true,
      },
    },
    defaults: {
      seed: -1,
    },
  },
  "qr2ai/img2paint_controlnet": {
    fields: {
      condition_scale: {
        type: "number",
        label: "ControlNet Scale",
        min: 0,
        max: 1,
        default: 0.5,
        step: 0.1,
      },
      num_inference_steps: {
        type: "number",
        label: "Denoising Steps",
        min: 1,
        max: 500,
        default: 50,
      },
      negative_prompt: {
        type: "text",
        label: "Negative Prompt",
        default: "low quality, bad quality, sketches, nsfw",
        advanced: true,
      },
    },
    defaults: {
      seed: 0,
    },
  },
};

type BaseGenerationFormValues = {
  model: string;
  prompt: string;
  seed: number;
  // Fields from jagilley/controlnet-scribble
  scale?: number;
  ddim_steps?: number;
  a_prompt?: string;
  n_prompt?: string;
  // Fields from qr2ai/img2paint_controlnet
  condition_scale?: number;
  num_inference_steps?: number;
  negative_prompt?: string;
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
  // Define base fields
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
    }, {} as Record<string, z.ZodNumber | z.ZodString>),
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
      ...(selectedModel && MODEL_CONFIGS[selectedModel]
        ? Object.entries(MODEL_CONFIGS[selectedModel].fields).reduce(
            (acc, [key, field]) => {
              // Type assertion here
              (acc as Record<string, string | number>)[key] = field.default;
              return acc;
            },
            {} as Partial<BaseGenerationFormValues>
          )
        : {}),
    } as BaseGenerationFormValues, // Final type assertion
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
    console.log("Model config:", MODEL_CONFIGS[values.model]);

    try {
      const payload = {
        ...values,
        canvasImage,
        selectedPronunciations,
        character: displayCharacter,
        standard_character: hanziData?.standard_character || "",
        traditional_character: hanziData?.traditional_character || "",
      };

      console.log("Full payload:", payload);
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
                      placeholder="Describe the image you want to generate..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {selectedModel && MODEL_CONFIGS[selectedModel] && (
              <div className="grid gap-4">
                {Object.entries(MODEL_CONFIGS[selectedModel].fields)
                  .filter(([_, config]) => !config.advanced)
                  .map(([name, config]) => {
                    if (
                      !form.getValues(name as keyof BaseGenerationFormValues)
                    ) {
                      form.setValue(
                        name as keyof BaseGenerationFormValues,
                        config.default
                      );
                    }

                    return (
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
                    );
                  })}
              </div>
            )}

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
                            value={field.value === -1 ? "-1" : field.value} // Show empty string for -1
                            onChange={(e) => {
                              const value = e.target.value;
                              // Convert to number or use -1 if empty
                              field.onChange(value === "" ? -1 : Number(value));
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                field.onChange(-1);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {selectedModel && MODEL_CONFIGS[selectedModel] && (
                    <div className="grid gap-4">
                      {Object.entries(MODEL_CONFIGS[selectedModel].fields)
                        .filter(([_, config]) => config.advanced)
                        .map(([name, config]) => {
                          if (
                            !form.getValues(
                              name as keyof BaseGenerationFormValues
                            )
                          ) {
                            form.setValue(
                              name as keyof BaseGenerationFormValues,
                              config.default
                            );
                          }

                          return (
                            <FormField
                              key={name}
                              control={form.control}
                              name={name as keyof BaseGenerationFormValues}
                              render={({ field }) => (
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
                              )}
                            />
                          );
                        })}
                    </div>
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
