/* eslint-disable @typescript-eslint/no-unused-vars */
// app/hanzis/_components/HanziForm.tsx
"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hanzi, hanziSchema, type HanziFormValues } from "./types";
import { Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { saveHanzis } from "@/app/actions/hanzi-actions";

interface HanziFormProps {
  initialValues?: Hanzi | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export function HanziForm({
  initialValues,
  onCancel,
  onSubmit,
}: HanziFormProps) {
  const [_, setIsSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<HanziFormValues>({
    resolver: zodResolver(hanziSchema),
    defaultValues: {
      character: "",
      character_type: "identical",
      pinyin: [{ pronunciation: "" }],
      definition: "",
      stroke_count: 1,
      hsk_level: 1,
      frequency_rank: undefined,
      radical_ids: [],
    },
  });

  const {
    fields: pinyinFields,
    append: appendPinyin,
    remove: removePinyin,
  } = useFieldArray({
    control,
    name: "pinyin",
  });

  const {
    fields: radicalFields,
    append: appendRadical,
    remove: removeRadical,
  } = useFieldArray({
    control,
    name: "radical_ids",
  });

  const {
    fields: relatedRadicalFields,
    append: appendRelatedRadical,
    remove: removeRelatedRadical,
  } = useFieldArray({
    control,
    name: "related_radical_ids",
  });

  // Watch character type to conditionally show traditional character field
  const characterType = watch("character_type");

  const handleFormSubmit = async (data: HanziFormValues) => {
    try {
      // Prepare the data for submission
      const submissionData = {
        // !!!! FIX
        standard_character: data.character,
        traditional_character:
          data.character_type !== "identical" ? data.related_character : null,
        is_identical: data.character_type === "identical",
        pinyin: data.pinyin,
        definition: data.definition,
        stroke_count: data.stroke_count,
        hsk_level: data.hsk_level,
        frequency_rank: data.frequency_rank || null,
        standard_radical_ids: data.radical_ids.map((id) => ({
          id,
          name: "",
        })), // Add radical names if available
        traditional_radical_ids:
          data.character_type === "traditional"
            ? data.related_radical_ids?.map((id) => ({ id, name: "" })) || []
            : null,
      };

      // Call the server action
      const response = await saveHanzis([submissionData]);

      if (!response.success) {
        throw new Error(response.error || "Failed to save hanzi");
      }

      // Show success feedback
      // toast.success("Hanzi saved successfully!", {
      //   position: "top-center",
      //   autoClose: 3000,
      // });

      // Call the parent onSubmit callback if provided
      if (onSubmit) {
        onSubmit();
      }

      // Optional: reset form after successful submission
      // reset();
    } catch (error) {
      console.error("Submission error:", error);

      // Set form error
      setError("root", {
        type: "manual",
        message:
          error instanceof Error
            ? error.message
            : "Failed to save hanzi. Please try again.",
      });

      // Show error toast
      // toast.error("Failed to save hanzi. Please try again.", {
      //   position: "top-center",
      //   autoClose: 5000,
      // });
    } finally {
      // Set submitting state to false
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        setIsSubmitting(true);
        handleFormSubmit(data);
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Character *</Label>
          <Input {...register("character")} placeholder="字" />
          {errors.character && (
            <p className="text-sm text-red-500">{errors.character.message}</p>
          )}
        </div>

        <div>
          <Label>Stroke Count *</Label>
          <Input
            type="number"
            {...register("stroke_count", { valueAsNumber: true })}
            min="1"
          />
          {errors.stroke_count && (
            <p className="text-sm text-red-500">
              {errors.stroke_count.message}
            </p>
          )}
        </div>
      </div>

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
          {errors.pinyin?.message && (
            <p className="text-sm text-red-500">{errors.pinyin.message}</p>
          )}
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Character Type *</Label>
          <Controller
            name="character_type"
            control={control}
            render={({ field }) => (
              <div>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identical">Identical</SelectItem>
                    <SelectItem value="simplified">Simplified</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
                {errors.character_type && (
                  <p className="text-sm text-red-500">
                    {errors.character_type.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div>
          <Label>HSK Level *</Label>
          <Input
            type="number"
            {...register("hsk_level", { valueAsNumber: true })}
            min="1"
            max="6"
          />
          {errors.hsk_level && (
            <p className="text-sm text-red-500">{errors.hsk_level.message}</p>
          )}
        </div>

        <div>
          <Label>Frequency Rank</Label>
          <Input
            type="number"
            {...register("frequency_rank", { valueAsNumber: true })}
            min="1"
            placeholder="Optional"
          />
          {errors.frequency_rank && (
            <p className="text-sm text-red-500">
              {errors.frequency_rank.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>Radicals *</Label>
        <div className="space-y-2">
          {radicalFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  {...register(`radical_ids.${index}.radical_id`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Radical ID"
                  type="number"
                />
                {errors.radical_ids?.[index]?.radical_id && (
                  <p className="text-sm text-red-500">
                    {errors.radical_ids[index]?.radical_id?.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {radicalFields.length > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeRadical(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {errors.radical_ids?.message && (
            <p className="text-sm text-red-500">{errors.radical_ids.message}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendRadical({ radical_id: 1 })}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Radical
          </Button>
        </div>
      </div>

      <div>
        <Label>Definition *</Label>
        <Input {...register("definition")} placeholder="character, letter" />
        {errors.definition && (
          <p className="text-sm text-red-500">{errors.definition.message}</p>
        )}
      </div>

      {/* Show Traditional Character field only when type is simplified */}
      {characterType !== "identical" && (
        <div>
          <div>
            <Label>
              {characterType === "simplified" ? "Traditional" : "Simplified"}{" "}
              Character *
            </Label>
            <Input {...register("related_character")} placeholder="字" />
            {errors.related_character && (
              <p className="text-sm text-red-500">
                {errors.related_character.message}
              </p>
            )}
          </div>

          <div>
            <Label>Related Character Radicals *</Label>
            <div className="space-y-2">
              {relatedRadicalFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      {...register(`related_radical_ids.${index}.radical_id`, {
                        valueAsNumber: true,
                      })}
                      placeholder="Related Radical ID"
                      type="number"
                    />
                    {errors.related_radical_ids?.[index]?.radical_id && (
                      <p className="text-sm text-red-500">
                        {errors.related_radical_ids[index]?.radical_id?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {relatedRadicalFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeRelatedRadical(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {errors.related_radical_ids?.message && (
                <p className="text-sm text-red-500">
                  {errors.related_radical_ids.message}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendRelatedRadical({ radical_id: 1 })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Radical
              </Button>
            </div>
          </div>
        </div>
      )}

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

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
