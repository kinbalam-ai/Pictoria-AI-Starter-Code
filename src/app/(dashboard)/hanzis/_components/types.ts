export interface Hanzi {
  id: number;
  standard_character: string;
  traditional_character: string | null;
  is_identical: boolean;
  pinyin: { pronunciation: string }[];
  definition: string;
  simplified_stroke_count: number;
  traditional_stroke_count: number | null;
  hsk_level: number;
  frequency_rank?: number | null;
  simplified_radical_ids: { kangxi_id: number }[];
  traditional_radical_ids: { kangxi_id: number }[] | null;
}
