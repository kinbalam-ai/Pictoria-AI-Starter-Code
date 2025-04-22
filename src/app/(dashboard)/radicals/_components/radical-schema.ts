import { z } from "zod";

export const radicalSchema = z.object({
  forms: z.array(
    z.string()
      .min(1, "Form is required")
      .max(2, "Cannot exceed 2 characters")
  ).min(1, "At least one form required"),
  pinyin: z.array(
    z.string()
      .min(1, "Pinyin is required")
      .regex(/^[a-zA-ZÀ-ÿ\s\d]+$/, "Invalid pinyin format")
  ).min(1, "At least one pronunciation required"),
  stroke_count: z.number()
    .min(1, "Minimum 1 stroke")
    .max(20, "Maximum 20 strokes"),
  name_zh: z.string().min(1, "Chinese name required"),
  name_en: z.string().min(1, "English name required"),
  meaning: z.string().min(1, "Meaning required"),
});

export type RadicalFormValues = z.infer<typeof radicalSchema>;