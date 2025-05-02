// app/radicals/_components/types.ts
export interface Radical {
  id: number;
  forms: {
    variant: string;
    strokes: number;
  }[];
  pinyin: {
    pronunciation: string;
  }[];
  kangxi_number: number;
  name_en: string;
  meaning: string;
  hsk_level: number;
  user_id?: string;
  created_at?: string;
}