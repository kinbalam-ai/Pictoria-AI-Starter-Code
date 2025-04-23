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
import { saveRadicals } from "@/app/actions/radicals-actions";

// Updated Zod schema with required HSK level
const radicalSchema = z.object({
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
            message: "Invalid pinyin format - must include valid tone marks",
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

export function RadicalForm({ onCancel }: { onCancel: () => void }) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RadicalFormValues>({
    resolver: zodResolver(radicalSchema),
    defaultValues: {
      forms: [{ variant: "", strokes: 4 }],
      pinyin: [{ pronunciation: "" }],
      kangxi_number: 1,
      hsk_level: 1, // Default to HSK 1
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
    console.log("values form data: ", values);
    // const result =
    await saveRadicals([values]);

    // if (!result.success) {
    //   // Handle error (show toast, etc.)
    //   console.error("Failed to save:", result.error);
    //   // You can also set form errors if needed:
    //   setError("root", {
    //     type: "manual",
    //     message: result.error || "Failed to save radical",
    //   });
    //   return;
    // }

    // On success:
    // - Redirect
    // - Show success message
    // - Reset form, etc.
    // console.log("Saved successfully:", result.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Combined Forms and Strokes Section */}
      <div>
        <Label>Variant Forms *</Label>
        <div className="space-y-2">
          {formFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Input
                  {...register(`forms.${index}.variant`)}
                  placeholder="水 or 氵"
                />
                {errors.forms?.[index]?.variant && (
                  <p className="text-sm text-red-500">
                    {errors.forms[index]?.variant?.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  {...register(`forms.${index}.strokes`, {
                    valueAsNumber: true,
                  })}
                  placeholder="Strokes"
                  min="1"
                  max="20"
                />
                {formFields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeForm(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {errors.forms?.message && (
            <p className="text-sm text-red-500">{errors.forms.message}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendForm({ variant: "", strokes: 3 })}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Form Variant
          </Button>
        </div>
      </div>

      {/* Dynamic Pinyin Section */}
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

      {/* Kangxi Number Field */}
      <div>
        <Label>Kangxi Number *</Label>
        <Input
          type="number"
          {...register("kangxi_number", { valueAsNumber: true })}
          min="1"
          max="214"
          placeholder="Enter Kangxi number (1-214)"
        />
        {errors.kangxi_number && (
          <p className="text-sm text-red-500">{errors.kangxi_number.message}</p>
        )}
      </div>

      {/* HSK Level Field - Required with default value 1 */}

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
          <p className="text-sm text-red-500">{errors.hsk_level.message}</p>
        )}
      </div>

      {/* English Name Field */}
      <div>
        <Label>English Name *</Label>
        <Input {...register("name_en")} placeholder="Water Radical" />
        {errors.name_en && (
          <p className="text-sm text-red-500">{errors.name_en.message}</p>
        )}
      </div>

      {/* Meaning Field */}
      <div>
        <Label>Meaning *</Label>
        <Input {...register("meaning")} placeholder="Related to liquids" />
        {errors.meaning && (
          <p className="text-sm text-red-500">{errors.meaning.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Radical</Button>
      </div>
    </form>
  );
}
