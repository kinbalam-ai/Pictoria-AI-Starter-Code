// app/hanzis/_components/types.ts
import { z } from "zod";

export const HanziCharacterType = z.enum([
  "identical",
  "simplified",
  "traditional",
]);
export type HanziCharacterType = z.infer<typeof HanziCharacterType>;

export interface Hanzi {
  id: number;
  character: string;
  character_type: HanziCharacterType;
  pinyin: {
    pronunciation: string;
  }[];
  definition: string;
  stroke_count: number;
  hsk_level: number;
  frequency_rank?: number;
  radical_ids: { radical_id: number }[];
  related_character: string | null;
  related_radical_ids: number[];
}

export const hanziSchema = z.object({
  character: z.string().length(1, "Must be exactly 1 character"),
  character_type: HanziCharacterType,
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
  definition: z.string().min(1, "Definition required"),
  stroke_count: z.number().min(1, "Minimum 1 stroke"),
  hsk_level: z.number().min(1).max(6),
  frequency_rank: z.number().optional(),
  radical_ids: z.array(z.object({ radical_id: z.number() })),
  related_character: z.string().optional(),
  related_radical_ids: z.array(z.object({ radical_id: z.number() })).optional(),
});

export type HanziFormValues = z.infer<typeof hanziSchema>;
