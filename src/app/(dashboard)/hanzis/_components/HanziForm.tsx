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
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<HanziFormValues>({
    resolver: zodResolver(hanziSchema),
    defaultValues: {
      character: "",
      character_type: "standard",
      pinyin: [{ pronunciation: "" }],
      definition: "",
      stroke_count: 1,
      hsk_level: 1,
      frequency_rank: undefined,
      radical_ids_standard: [],
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

  const { fields: radicalFields, append: appendRadical, remove: removeRadical } = useFieldArray({
    control,
    name: "radical_ids_standard",
  });

  const handleFormSubmit = async (data: HanziFormValues) => {
    try {
      console.log("Form data:", data);
      onSubmit();
    } catch (error) {
      setError("root", {
        type: "manual",
        message: "Failed to save hanzi. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

      <div>
        <Label>Radicals *</Label>
        <div className="space-y-2">
          {radicalFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  {...register(`radical_ids_standard.${index}.radical_id`)}
                  placeholder="shuǐ"
                />
                {errors.radical_ids_standard?.[index]?.radical_id && (
                  <p className="text-sm text-red-500">
                    {errors.radical_ids_standard[index]?.radical_id?.message}
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
          {errors.radical_ids_standard?.message && (
            <p className="text-sm text-red-500">{errors.radical_ids_standard.message}</p>
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

      <div className="grid grid-cols-2 gap-4">
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

        
      </div>

      {/* <div>
        <Label>Radicals</Label>
        <div className="space-y-2">
          {radicalFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                type="number"
                {...register(`radical_ids.${index}`, { valueAsNumber: true })}
                placeholder="Radical ID"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeRadical(index)}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendRadical(0)}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Radical
          </Button>
        </div>
      </div> */}

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="traditional">Traditional</SelectItem>
                  </SelectContent>
                </Select>
                
              </div>
            )}
          />
        </div>

        <div>
          <Label>Traditional Character *</Label>
          <Input {...register("character_traditional")} placeholder="字" />
          {errors.character && (
            <p className="text-sm text-red-500">{errors.character.message}</p>
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
