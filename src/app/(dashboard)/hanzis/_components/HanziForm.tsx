"use client";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added Textarea import
import { Plus, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveHanzis, updateHanzi } from "@/app/actions/hanzi-actions";
import { Hanzi } from "./types";
import { useEffect } from "react";

const hanziSchema = z.object({
  id: z.number().optional(),
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
  simplified_stroke_count: z
    .number()
    .min(1, "Minimum 1 stroke")
    .max(64, "Maximum 64 strokes"),
  traditional_stroke_count: z
    .number()
    .min(1, "Minimum 1 stroke")
    .max(64, "Maximum 64 strokes")
    .nullable(),
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
      simplified_stroke_count: 1,
      traditional_stroke_count: 1,
      hsk_level: 1,
      frequency_rank: null,
      simplified_radical_ids: [],
      traditional_radical_ids: null,
    },
  });

  // const characterType = watch("is_identical")
  //   ? "identical"
  //   : watch("traditional_character")
  //   ? "simplified"
  //   : "traditional";

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

  const onSubmit: SubmitHandler<HanziFormValues> = async (data) => {
    const formattedData = { ...data };
  
    try {
      if (formattedData.is_identical) {
        formattedData.traditional_character = formattedData.standard_character;
        formattedData.traditional_stroke_count = formattedData.simplified_stroke_count;
        formattedData.traditional_radical_ids = formattedData.simplified_radical_ids;
      }
  
      if (!formattedData.is_identical && formattedData.traditional_character === formattedData.standard_character) {
        formattedData.is_identical = true;
        formattedData.traditional_stroke_count = formattedData.simplified_stroke_count;
        formattedData.traditional_radical_ids = formattedData.simplified_radical_ids;
      }
  
      // Add this check for existing Hanzi
      if (initialValues) {
        // This is an edit operation - we need to update rather than create
        const response = await updateHanzi(initialValues.id, formattedData);
        if (!response.success) throw new Error(response.error || "Failed to update hanzi");
      } else {
        // This is a create operation
        const response = await saveHanzis([{...formattedData, id: 0}]);
        if (!response.success) throw new Error(response.error || "Failed to save hanzi");
      }
  
      onCancel();
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      // Add user-friendly error handling here
      alert(error instanceof Error ? error.message : "An unknown error occurred");
    }
  };

  useEffect(() => {
    if (watch("is_identical")) {
      setValue("traditional_character", watch("standard_character"));
      setValue("traditional_radical_ids", watch("simplified_radical_ids"));
    }
  }, [watch("is_identical")]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto p-1"
    >
      {/* Character Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Character Information</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Simplified *</Label>
              <Input {...register("standard_character")} maxLength={1} />
              {errors.standard_character && (
                <p className="text-sm text-destructive mt-1">
                  {errors.standard_character.message}
                </p>
              )}
            </div>

            {!watch("is_identical") && (
              <div>
                <Label>Traditional</Label>
                <Input {...register("traditional_character")} maxLength={1} />
                {errors.traditional_character && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.traditional_character.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="is_identical"
              {...register("is_identical")}
              className="h-4 w-4"
            />
            <Label htmlFor="is_identical" className="text-sm">
              Identical in Simplified/Traditional
            </Label>
          </div>
        </div>
      </div>

      {/* Pronunciation and Definition Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Definition - Changed to Textarea */}
          <div>
            <h3 className="font-medium text-lg mb-3">Definition *</h3>
            <Textarea
              {...register("definition")}
              className="min-h-[120px]"
              placeholder="Enter the definition..."
            />
            {errors.definition && (
              <p className="text-sm text-destructive mt-1">
                {errors.definition.message}
              </p>
            )}
          </div>
          {/* Pronunciation */}
          <div>
            <h3 className="font-medium text-lg mb-3">Pronunciation</h3>
            <div className="space-y-3">
              {pinyinFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      {...register(`pinyin.${index}.pronunciation`)}
                      placeholder="shuǐ"
                    />
                    {errors.pinyin?.[index]?.pronunciation && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.pinyin[index]?.pronunciation?.message}
                      </p>
                    )}
                  </div>
                  {pinyinFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePinyin(index)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPinyin({ pronunciation: "" })}
                className="mt-2"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Pronunciation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Simplified Strokes *</Label>
            <Input
              type="number"
              {...register("simplified_stroke_count", { valueAsNumber: true })}
              min="1"
              max="64"
            />
            {errors.simplified_stroke_count && (
              <p className="text-sm text-destructive mt-1">
                {errors.simplified_stroke_count.message}
              </p>
            )}
          </div>

          {!watch("is_identical") && (
            <div>
              <Label>Traditional Strokes</Label>
              <Input
                type="number"
                {...register("traditional_stroke_count", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" ? null : Number(v)),
                })}
                min="1"
                max="64"
              />
              {errors.traditional_stroke_count && (
                <p className="text-sm text-destructive mt-1">
                  {errors.traditional_stroke_count.message}
                </p>
              )}
            </div>
          )}

          <div className="col-span-2">
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
              <p className="text-sm text-destructive mt-1">
                {errors.hsk_level.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
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
              <p className="text-sm text-destructive mt-1">
                {errors.frequency_rank.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Radicals Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Radicals</h3>
        <div className="grid grid-cols-2 gap-3">
          
            <div className=" col-span-1">
              <Label className="block mb-2">Simplified Radicals *</Label>
              <div className="space-y-2">
                {standardRadicalFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <Input
                      type="number"
                      {...register(
                        `simplified_radical_ids.${index}.kangxi_id`,
                        {
                          valueAsNumber: true,
                        }
                      )}
                      placeholder="Radical ID"
                      min="1"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeStandardRadical(index)}
                      disabled={standardRadicalFields.length <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendStandardRadical({ kangxi_id: 1 })}
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Radical
                </Button>
              </div>
              {errors.simplified_radical_ids && (
                <p className="text-sm text-destructive mt-1">
                  {errors.simplified_radical_ids.message}
                </p>
              )}
            </div>

            {!watch("is_identical") && (
              <div className="col-span-1">
                <Label className="block mb-2">Traditional Radicals</Label>
                <div className="space-y-2">
                  {traditionalRadicalFields?.map((field, index) => (
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
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTraditionalRadical(index)}
                        disabled={
                          !traditionalRadicalFields ||
                          traditionalRadicalFields.length <= 1
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTraditionalRadical({ kangxi_id: 1 })}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add Radical
                  </Button>
                </div>
                {errors.traditional_radical_ids && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.traditional_radical_ids.message}
                  </p>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 sticky bottom-0 bg-background pb-4">
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
