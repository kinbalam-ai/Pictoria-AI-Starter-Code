/* eslint-disable @typescript-eslint/no-unused-vars */
// app/hanzis/_components/HanziForm.tsx
"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveHanzis } from "@/app/actions/hanzi-actions";
import { Hanzi } from "./types";
import { useEffect } from "react";

const hanziSchema = z.object({
  standard_character: z
    .string()
    .min(1, "Character is required")
    .max(1, "Must be single character"),
  traditional_character: z
    .string()
    .max(1, "Must be single character")
    .nullable(),
  is_identical: z.boolean(),
  pinyin: z
    .array(
      z.object({
        pronunciation: z.string().min(1, "Pinyin is required"),
      })
    )
    .min(1, "At least one pronunciation required"),
  definition: z.string().min(1, "Definition is required"),
  stroke_count: z
    .number()
    .min(1, "Minimum 1 stroke")
    .max(64, "Maximum 64 strokes"),
  hsk_level: z.number().min(1, "HSK 1").max(6, "HSK 6"),
  frequency_rank: z.number().min(1, "Minimum rank 1").nullable(),
  simplified_radical_ids: z
    .array(z.object({ kangxi_id: z.number().min(1, "Invalid radical ID") }))
    .min(1, "At least one radical required"),
  traditional_radical_ids: z
    .array(z.object({ kangxi_id: z.number().min(1, "Invalid radical ID") }))
    .nullable(),
});

type HanziFormValues = z.infer<typeof hanziSchema>;

interface HanziFormProps {
  initialValues?: Hanzi | null;
  onCancel: () => void;
}

export function HanziForm({ initialValues, onCancel }: HanziFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<HanziFormValues>({
    resolver: zodResolver(hanziSchema),
    defaultValues: initialValues || {
      standard_character: "",
      traditional_character: null,
      is_identical: false,
      pinyin: [{ pronunciation: "" }],
      definition: "",
      stroke_count: 1,
      hsk_level: 1,
      frequency_rank: null,
      simplified_radical_ids: [],
      traditional_radical_ids: null,
    },
  });

  const characterType = watch("is_identical")
    ? "identical"
    : watch("traditional_character")
    ? "simplified"
    : "traditional";

  const {
    fields: pinyinFields,
    append: appendPinyin,
    remove: removePinyin,
  } = useFieldArray({
    control,
    name: "pinyin",
  });

  const {
    fields: standardRadicalFields,
    append: appendStandardRadical,
    remove: removeStandardRadical,
  } = useFieldArray({
    control,
    name: "simplified_radical_ids",
  });

  const {
    fields: traditionalRadicalFields,
    append: appendTraditionalRadical,
    remove: removeTraditionalRadical,
  } = useFieldArray({
    control,
    name: "traditional_radical_ids",
  });

  const onSubmit = async (data: HanziFormValues) => {
    // Create a copy of the data to avoid mutating the original
    const formattedData = { ...data };

    try {
      // 1. Handle identical characters case
      if (formattedData.is_identical) {
        formattedData.traditional_character = formattedData.standard_character;
        formattedData.traditional_radical_ids =
          formattedData.simplified_radical_ids;
      }

      // 2. Check if characters are equal but identical flag is false
      if (
        !formattedData.is_identical &&
        formattedData.traditional_character === formattedData.standard_character
      ) {
        // Characters are equal but identical flag wasn't set - correct this
        formattedData.is_identical = true;
        formattedData.traditional_radical_ids =
          formattedData.simplified_radical_ids;
      }

      console.log("Submitting hanzi data:", formattedData);

      // Call the saveHanzis action
      const response = await saveHanzis([formattedData]);

      if (!response.success) {
        throw new Error(response.error || "Failed to save hanzi");
      }

      // Handle successful submission
      onCancel();
      reset();

      // Optional: Show success notification
      // toast.success("Hanzi saved successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      // You might want to show an error message to the user here
    }
  };

  useEffect(() => {
    if (watch("is_identical")) {
      setValue("traditional_character", watch("standard_character"));
      setValue("traditional_radical_ids", watch("simplified_radical_ids"));
    }
  }, [watch("is_identical")]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Standard Character */}
        <div>
          <Label>Standard Character *</Label>
          <Input {...register("standard_character")} maxLength={1} />
          {errors.standard_character && (
            <p className="text-sm text-red-500">
              {errors.standard_character.message}
            </p>
          )}
        </div>

        {/* Traditional Character (conditionally shown) */}
        {!watch("is_identical") && (
          <div>
            <Label>
              {characterType === "simplified"
                ? "Traditional Character *"
                : "Simplified Character"}
            </Label>
            <Input {...register("traditional_character")} maxLength={1} />
            {errors.traditional_character && (
              <p className="text-sm text-red-500">
                {errors.traditional_character.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Character Type Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_identical"
          {...register("is_identical")}
          className="h-4 w-4"
        />
        <Label htmlFor="is_identical">
          Identical in Simplified/Traditional
        </Label>
      </div>

      {/* Pinyin */}
      <div>
        <Label>Pronunciations *</Label>
        <div className="space-y-2">
          {pinyinFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  {...register(`pinyin.${index}.pronunciation`)}
                  placeholder="shuǐ"
                />
                {errors.pinyin?.[index]?.pronunciation && (
                  <p className="text-sm text-red-500">
                    {errors.pinyin[index]?.pronunciation?.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {pinyinFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePinyin(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPinyin({ pronunciation: "" })}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pronunciation
          </Button>
        </div>
      </div>

      {/* Definition */}
      <div>
        <Label>Definition *</Label>
        <Input {...register("definition")} />
        {errors.definition && (
          <p className="text-sm text-red-500">{errors.definition.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Stroke Count */}
        <div>
          <Label>Stroke Count *</Label>
          <Input
            type="number"
            {...register("stroke_count", { valueAsNumber: true })}
            min="1"
            max="64"
          />
          {errors.stroke_count && (
            <p className="text-sm text-red-500">
              {errors.stroke_count.message}
            </p>
          )}
        </div>

        {/* HSK Level */}
        <div>
          <Label>HSK Level *</Label>
          <Controller
            name="hsk_level"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select HSK level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      HSK {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.hsk_level && (
            <p className="text-sm text-red-500">{errors.hsk_level.message}</p>
          )}
        </div>

        {/* Frequency Rank */}
        <div>
          <Label>Frequency Rank</Label>
          <Input
            type="number"
            {...register("frequency_rank", {
              valueAsNumber: true,
              setValueAs: (v) => (v === "" ? null : Number(v)),
            })}
            min="1"
          />
          {errors.frequency_rank && (
            <p className="text-sm text-red-500">
              {errors.frequency_rank.message}
            </p>
          )}
        </div>
      </div>

      {/* Radicals Section - Side by Side Columns with Scroll */}
      <div>
        <Label>Radicals</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* Simplified/Standard Radicals Column */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {characterType === "simplified"
                ? "Simplified Radicals *"
                : "Standard Radicals *"}
            </Label>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {standardRadicalFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    {...register(`simplified_radical_ids.${index}.kangxi_id`, {
                      valueAsNumber: true,
                    })}
                    placeholder="Radical ID"
                    min="1"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeStandardRadical(index)}
                    disabled={standardRadicalFields.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendStandardRadical({ kangxi_id: 1 })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Radical
            </Button>
            {errors.simplified_radical_ids && (
              <p className="text-sm text-red-500">
                {errors.simplified_radical_ids.message}
              </p>
            )}
          </div>

          {/* Traditional Radicals Column - Conditionally shown */}
          {!watch("is_identical") && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {characterType === "simplified"
                  ? "Traditional Radicals"
                  : "Simplified Radicals"}
              </Label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {traditionalRadicalFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      {...register(
                        `traditional_radical_ids.${index}.kangxi_id`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      placeholder="Radical ID"
                      min="1"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeTraditionalRadical(index)}
                      disabled={
                        !traditionalRadicalFields ||
                        traditionalRadicalFields.length <= 1
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendTraditionalRadical({ kangxi_id: 1 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Radical
              </Button>
              {errors.traditional_radical_ids && (
                <p className="text-sm text-red-500">
                  {errors.traditional_radical_ids.message}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Hanzi"}
        </Button>
      </div>
    </form>
  );
}
