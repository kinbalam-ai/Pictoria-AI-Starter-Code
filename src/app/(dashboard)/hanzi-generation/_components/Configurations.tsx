/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
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
      default: any;
      step?: number;
      advanced?: boolean;
    }
  >;
  defaults: Record<string, any>;
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

const formSchema = z.object({
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
});

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
  const [displayCharacter, setDisplayCharacter] = useState(() => {
    // Default to showing traditional if the URL character matches traditional
    const showTraditional = hanziData?.traditional_character === character;
    return showTraditional && hanziData?.traditional_character
      ? hanziData.traditional_character
      : hanziData?.standard_character || character;
  });
  const [pronunciationOrder, setPronunciationOrder] = useState<string[]>([]);
  const selectedPronunciations = useSelectedPronunciations();
  const setSelectedPronunciations = useSetSelectedPronunciations();

  // Initialize pronunciation order
  useEffect(() => {
    if (hanziData?.pinyin) {
      const order = hanziData.pinyin.map((p) => p.pronunciation);
      setPronunciationOrder(order);
      // Initialize selections as empty but in correct order
      setSelectedPronunciations([]);
    }
  }, [hanziData]);
  const togglePronunciation = (pronunciation: string) => {
    const newSelected = selectedPronunciations.includes(pronunciation)
      ? selectedPronunciations.filter((p) => p !== pronunciation)
      : [...selectedPronunciations, pronunciation];

    // Sort the selected pronunciations according to the original order
    const orderedSelected = pronunciationOrder.filter((p) =>
      newSelected.includes(p)
    );

    setSelectedPronunciations(orderedSelected);
  };

  const canvasImage = useCanvasImage();
  const setDisplayedCharacter = useSetDisplayedCharacter();

  // Sync to Zustand
  useEffect(() => {
    setDisplayedCharacter(displayCharacter);
  }, [displayCharacter]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: model_id || "jagilley/controlnet-scribble",
      prompt: "",
      seed: -1,
      ...Object.values(MODEL_CONFIGS).reduce((acc, config) => {
        Object.entries(config.fields).forEach(([key, field]) => {
          acc[key as keyof typeof acc] = field.default;
        });
        return acc;
      }, {} as Record<string, any>),
    },
  });

  const selectedModel = form.watch("model");

  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log("canvasImage: ", canvasImage)
    console.log("Submitting values:", { ...values, canvasImage });
    const modelConfig = MODEL_CONFIGS[values.model];
    console.log("Submitting modelConfig:", modelConfig);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {/* Your EXACT Hanzi Details Section */}
        {hanziData && (
          <fieldset className="rounded-lg border p-3 bg-background">
            {/* Responsive header row */}
            <div className="flex justify-between items-start gap-4 mb-2">
              <legend className="text-sm font-medium px-1">
                Hanzi Details
              </legend>

              {/* Switch - now part of the flex flow */}
              {hanziData.traditional_character &&
                hanziData.traditional_character !==
                  hanziData.standard_character && (
                  <div className=" top-4 right-4 flex items-center gap-2">
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

            {/* Content area with responsive layout */}
            <div className="flex flex-col xs:flex-row gap-3">
              {/* Character display - fixed size */}
              <div
                className="w-12 h-12 flex items-center justify-center 
                      bg-white dark:bg-gray-800 border rounded-lg shrink-0"
              >
                <span className="text-3xl font-bold">{displayCharacter}</span>
              </div>

              {/* Details section */}
              <div className="grid gap-1.5 flex-1 min-w-0">
                {/* Definition */}
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
                  {/* Pinyin - Inline with definition when space allows */}
                  {hanziData.pinyin?.length > 0 && (
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {hanziData.pinyin?.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-2">
                              {hanziData?.pinyin?.map((pinyinObj) => {
                                const isSelected =
                                  selectedPronunciations.includes(
                                    pinyinObj.pronunciation
                                  );
                                return (
                                  <Button
                                    key={pinyinObj.pronunciation}
                                    type="button"
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                      togglePronunciation(
                                        pinyinObj.pronunciation
                                      )
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
                  )}
                </div>
              </div>
            </div>
          </fieldset>
        )}

        {/* Optimized Form Section */}
        <fieldset className="rounded-lg border p-4 bg-background space-y-4">
          <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>

          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  .map(([name, config]) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{config.label}</FormLabel>
                          {config.type === "number" ? (
                            <div className="space-y-2">
                              <div className="flex gap-4">
                                <FormControl>
                                  <Input
                                    {...field}
                                    type="number"
                                    min={config.min}
                                    max={config.max}
                                    step={config.step}
                                    className="w-24"
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <Slider
                                  value={[field.value ?? config.default]}
                                  min={config.min}
                                  max={config.max}
                                  step={config.step}
                                  onValueChange={(vals) =>
                                    field.onChange(vals[0])
                                  }
                                />
                              </div>
                            </div>
                          ) : (
                            <FormControl>
                              <Textarea
                                {...field}
                                rows={3}
                                defaultValue={config.default}
                              />
                            </FormControl>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {selectedModel && MODEL_CONFIGS[selectedModel] && (
                    <div className="grid gap-4">
                      {Object.entries(MODEL_CONFIGS[selectedModel].fields)
                        .filter(([_, config]) => config.advanced)
                        .map(([name, config]) => (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{config.label}</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    rows={3}
                                    // Remove defaultValue since field provides value
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
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
