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
import { Hanzi } from "../../hanzis/_components/types";

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

const Configurations = ({ userModels, model_id, hanziData, character }: ConfigurationsProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "jagilley/controlnet-scribble",
      prompt: "",
      seed: -1,
      // Initialize all model-specific fields
      ...Object.values(MODEL_CONFIGS).reduce((acc, config) => {
        Object.entries(config.fields).forEach(([key, field]) => {
          acc[key as keyof typeof acc] = field.default;
        });
        return acc;
      }, {} as Record<string, any>),
    },
  });

  const selectedModel = form.watch("model");

  useEffect(() => {
    const config = MODEL_CONFIGS[selectedModel];
    if (config) {
      // Reset all fields to their defaults when model changes
      // form.reset({
      //   ...form.getValues(),
      //   ...config.defaults,
      //   ...Object.fromEntries(
      //     Object.entries(config.fields).map(([key, field]) => [key, field.default]
      //   )
      // });
    }
  }, [selectedModel, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const modelConfig = MODEL_CONFIGS[values.model];
    // const payload = {
    //   ...values,
    //   ...modelConfig.defaults,
    //   ...Object.fromEntries(
    //     Object.keys(modelConfig.fields).map(key => [
    //       key,
    //       form.getValues(key as any) ?? modelConfig.fields[key].default
    //     ])
    // };
    console.log("Submitting modelConfig:", modelConfig);
  }

  return (
    <TooltipProvider>
    
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4"> {/* Changed to space-y-4 */}
          
          {/* Hanzi Details - Top Section */}
          {hanziData && (
            <fieldset className="rounded-lg border p-4 bg-background">
              <legend className="-ml-1 px-1 text-sm font-medium">Hanzi Details</legend>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <span className="text-4xl font-bold">{character}</span>
                </div>
                <div className="grid gap-1">
                  {/* <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Pinyin</p>
                      <p className="font-medium">{hanziData.pinyin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Strokes</p>
                      <p className="font-medium">{hanziData.stroke_count || 'N/A'}</p>
                    </div>
                  </div> */}
                  <div>
                    <p className="text-xs text-muted-foreground">Definition</p>
                    <p className="font-medium line-clamp-2">{hanziData.definition || 'No definition'}</p>
                  </div>
                </div>
              </div>
            </fieldset>
          )}
          <fieldset className="grid gap-6 rounded-lg border p-4 bg-background">
            <legend className="-ml-1 px-1 text-sm font-medium">Settings</legend>

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jagilley/controlnet-scribble">
                        ControlNet Scribble
                      </SelectItem>
                      <SelectItem value="qr2ai/img2paint_controlnet">
                        Img2Paint ControlNet
                      </SelectItem>
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
                    <Textarea {...field} rows={3} />
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
                                    onChange={(e: { target: { value: any } }) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <Slider
                                  value={[field.value ?? config.default]}
                                  min={config.min}
                                  max={config.max}
                                  step={config.step}
                                  onValueChange={(vals: any[]) =>
                                    field.onChange(vals[0])
                                  }
                                  className="flex-1"
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground px-1">
                                <span>{config.min}</span>
                                <span>{config.max}</span>
                              </div>
                            </div>
                          ) : (
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                          )}
                        </FormItem>
                      )}
                    />
                  ))}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
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
              </div>

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
                            onChange={(e: { target: { value: any } }) =>
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
                                  <Textarea {...field} rows={3} />
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

            <Button type="submit">Generate</Button>
          </fieldset>
        </form>
      </Form>
    </TooltipProvider>
  );
};

export default Configurations;
