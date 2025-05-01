import { Hanzi } from "./types";

export const sampleHanzis: Hanzi[] = [
  {
    id: 1,
    standard_character: "的",
    traditional_character: "的",
    is_identical: true,
    pinyin: [{ pronunciation: "de" }, { pronunciation: "dí" }],
    definition: "possessive particle",
    stroke_count: 8,
    hsk_level: 1,
    frequency_rank: 1,
    simplified_radical_ids: [
      { kangxi_id: 106 }, // 白
      { kangxi_id: 20 }, // 勹
      { kangxi_id: 3 }, // 丶
    ],
    traditional_radical_ids: [
      { kangxi_id: 106 },
      { kangxi_id: 20 },
      { kangxi_id: 3 },
    ],
  },
  {
    id: 2,
    standard_character: "一",
    traditional_character: "一",
    is_identical: true,
    pinyin: [{ pronunciation: "yī" }],
    definition: "one; a, an",
    stroke_count: 1,
    hsk_level: 1,
    frequency_rank: 2,
    simplified_radical_ids: [
      { kangxi_id: 1 }, // 一
    ],
    traditional_radical_ids: [{ kangxi_id: 1 }],
  },
  {
    id: 3,
    standard_character: "是",
    traditional_character: "是",
    is_identical: true,
    pinyin: [{ pronunciation: "shì" }],
    definition: "to be; correct",
    stroke_count: 9,
    hsk_level: 1,
    frequency_rank: 3,
    simplified_radical_ids: [
      { kangxi_id: 72 }, // 日
      { kangxi_id: 103 }, // 𤴓
    ],
    traditional_radical_ids: [{ kangxi_id: 72 }, { kangxi_id: 103 }],
  },
  {
    id: 4,
    standard_character: "不",
    traditional_character: "不",
    is_identical: true,
    pinyin: [{ pronunciation: "bù" }],
    definition: "not; no",
    stroke_count: 4,
    hsk_level: 1,
    frequency_rank: 4,
    simplified_radical_ids: [
      { kangxi_id: 1 }, // 一
      { kangxi_id: 25 }, // 卜
      { kangxi_id: 4 }, //  ⼃
    ],
    traditional_radical_ids: [
      { kangxi_id: 1 },
      { kangxi_id: 25 },
      { kangxi_id: 4 },
    ],
  },
  {
    id: 5,
    standard_character: "了",
    traditional_character: "了",
    is_identical: true,
    pinyin: [{ pronunciation: "le" }],
    definition: "completed action marker",
    stroke_count: 2,
    hsk_level: 1,
    frequency_rank: 5,
    simplified_radical_ids: [
      { kangxi_id: 6 }, // 亅
      { kangxi_id: 5 }, // 乙
    ],
    traditional_radical_ids: [{ kangxi_id: 6 }, { kangxi_id: 5 }],
  },
  {
    id: 6,
    standard_character: "国",
    traditional_character: "國",
    is_identical: false,
    pinyin: [{ pronunciation: "guó" }],
    definition: "country",
    stroke_count: 8,
    hsk_level: 1,
    frequency_rank: 20,
    simplified_radical_ids: [
      { kangxi_id: 31 }, // 囗
      { kangxi_id: 96 }, // 玉
      { kangxi_id: 3 }, // 丶
    ],
    traditional_radical_ids: [
      { kangxi_id: 31 }, // 囗
      { kangxi_id: 62 }, // 戈
      { kangxi_id: 4 }, //  ⼃
    ],
  },
  {
    id: 7,
    standard_character: "爱",
    traditional_character: "愛",
    is_identical: false,
    pinyin: [{ pronunciation: "ài" }],
    definition: "love",
    stroke_count: 10,
    hsk_level: 1,
    frequency_rank: 394,
    simplified_radical_ids: [
      { kangxi_id: 14 }, // 冖
      { kangxi_id: 4 }, //  ⼃
      { kangxi_id: 1 }, // 一
      { kangxi_id: 29 }, // 又
      { kangxi_id: 87 }, // 爪
    ],
    traditional_radical_ids: [
      { kangxi_id: 14 }, // 冖
      { kangxi_id: 34 }, // 夂
      { kangxi_id: 87 }, // 爪
      { kangxi_id: 61 }, // 心
    ],
  },
];
