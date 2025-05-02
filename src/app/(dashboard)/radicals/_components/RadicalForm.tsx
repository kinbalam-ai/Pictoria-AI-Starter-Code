// app/radicals/_components/RadicalForm.tsx
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
import { saveRadicals, updateRadical } from "@/app/actions/radicals-actions";
import { Radical } from "./types";
import { Textarea } from "@/components/ui/textarea";

const radicalSchema = z.object({
  id: z.number().optional(),
  forms: z
    .array(
      z.object({
        variant: z
          .string()
          .min(1, "Form is required")
          .max(2, "Cannot exceed 2 characters"),
        strokes: z
          .number()
          .min(1, "Minimum 1 stroke")
          .max(20, "Maximum 20 strokes"),
      })
    )
    .min(1, "At least one form required"),
  pinyin: z
    .array(
      z.object({
        pronunciation: z
          .string()
          .min(1, "Pinyin is required")
          .regex(/^[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü\s\d]+$/, {
            message: "Invalid pinyin format",
          }),
      })
    )
    .min(1, "At least one pronunciation required"),
  kangxi_number: z
    .number()
    .min(1, "Minimum Kangxi number is 1")
    .max(214, "Maximum Kangxi number is 214"),
  hsk_level: z
    .number()
    .min(1, "Minimum HSK level is 1")
    .max(6, "Maximum HSK level is 6"),
  name_en: z.string().min(1, "English name required"),
  meaning: z.string().min(1, "Meaning required"),
});

type RadicalFormValues = z.infer<typeof radicalSchema>;

interface RadicalFormProps {
  initialValues?: Radical | null;
  onCancel: () => void;
}

export function RadicalForm({ initialValues, onCancel }: RadicalFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RadicalFormValues>({
    resolver: zodResolver(radicalSchema),
    defaultValues: initialValues || {
      forms: [{ variant: "", strokes: 4 }],
      pinyin: [{ pronunciation: "" }],
      kangxi_number: 1,
      hsk_level: 1,
      name_en: "",
      meaning: "",
    },
  });

  const {
    fields: formFields,
    append: appendForm,
    remove: removeForm,
  } = useFieldArray({
    control,
    name: "forms",
  });

  const {
    fields: pinyinFields,
    append: appendPinyin,
    remove: removePinyin,
  } = useFieldArray({
    control,
    name: "pinyin",
  });

  const onSubmit = async (values: RadicalFormValues) => {
    try {
      let result;
      if (initialValues?.id) {
        result = await updateRadical(initialValues.id, values);
      } else {
        result = await saveRadicals([values]);
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to save radical");
      }

      onCancel();
      reset();
    } catch (error) {
      console.error("Submission error:", error);
      setError("root", {
        type: "manual",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto p-1"
    >
      {/* Variant Forms Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Variant Forms *</h3>
        <div className="space-y-3">
          {formFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Character</Label>
                <Input
                  {...register(`forms.${index}.variant`)}
                  placeholder="水 or 氵"
                />
                {errors.forms?.[index]?.variant && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.forms[index]?.variant?.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Strokes</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    {...register(`forms.${index}.strokes`, {
                      valueAsNumber: true,
                    })}
                    min="1"
                    max="20"
                  />
                  {formFields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="mt-auto"
                      onClick={() => removeForm(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendForm({ variant: "", strokes: 3 })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Form Variant
          </Button>
          {errors.forms?.message && (
            <p className="text-sm text-destructive mt-1">
              {errors.forms.message}
            </p>
          )}
        </div>
      </div>

      {/* Pronunciation Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Pronunciations *</h3>
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
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendPinyin({ pronunciation: "" })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pronunciation
          </Button>
          {errors.pinyin?.message && (
            <p className="text-sm text-destructive mt-1">
              {errors.pinyin.message}
            </p>
          )}
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-card rounded-lg shadow-sm border p-4">
        <h3 className="font-medium text-lg mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Kangxi Number *</Label>
            <Input
              type="number"
              {...register("kangxi_number", { valueAsNumber: true })}
              min="1"
              max="214"
            />
            {errors.kangxi_number && (
              <p className="text-sm text-destructive mt-1">
                {errors.kangxi_number.message}
              </p>
            )}
          </div>

          <div>
            <Label>HSK Level *</Label>
            <Controller
              name="hsk_level"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
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
            <Label>English Name *</Label>
            <Input {...register("name_en")} />
            {errors.name_en && (
              <p className="text-sm text-destructive mt-1">
                {errors.name_en.message}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Label>Meaning *</Label>
            <Textarea {...register("meaning")} className="min-h-[100px]" />
            {errors.meaning && (
              <p className="text-sm text-destructive mt-1">
                {errors.meaning.message}
              </p>
            )}
          </div>
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
          {isSubmitting ? "Saving..." : "Save Radical"}
        </Button>
      </div>
    </form>
  );
}
