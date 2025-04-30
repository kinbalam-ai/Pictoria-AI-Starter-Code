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
    traditional_radical_ids: [{ kangxi_id: 106 }, { kangxi_id: 20 }, { kangxi_id: 3 }],
  },
  {
    id: 2,
    standard_character: "国",
    traditional_character: "國",
    is_identical: false,
    pinyin: [{ pronunciation: "guó" }],
    definition: "country",
    stroke_count: 8,
    hsk_level: 1,
    frequency_rank: 25,
    simplified_radical_ids: [
      { kangxi_id: 31 }, // 囗
      { kangxi_id: 8 }, // 玉
    ],
    traditional_radical_ids: [
      { kangxi_id: 31 },
      { kangxi_id: 8 },
      { kangxi_id: 75 }, // 或
    ],
  },
  {
    id: 3,
    standard_character: "爱",
    traditional_character: "愛",
    is_identical: false,
    pinyin: [{ pronunciation: "ài" }],
    definition: "love",
    stroke_count: 10,
    hsk_level: 2,
    frequency_rank: 42,
    simplified_radical_ids: [
      { kangxi_id: 87 }, // 爪
      { kangxi_id: 61 }, // 心
    ],
    traditional_radical_ids: [
      { kangxi_id: 61 },
      { kangxi_id: 140 }, // 冖
    ],
  },
  {
    id: 4,
    standard_character: "龙",
    traditional_character: "龍",
    is_identical: false,
    pinyin: [{ pronunciation: "lóng" }],
    definition: "dragon",
    stroke_count: 5,
    hsk_level: 3,
    frequency_rank: 78,
    simplified_radical_ids: [
      { kangxi_id: 141 }, // 龙
    ],
    traditional_radical_ids: [
      { kangxi_id: 212 }, // 龍
    ],
  },
  {
    id: 5,
    standard_character: "门",
    traditional_character: "門",
    is_identical: false,
    pinyin: [{ pronunciation: "mén" }],
    definition: "door",
    stroke_count: 3,
    hsk_level: 1,
    frequency_rank: 31,
    simplified_radical_ids: [
      { kangxi_id: 169 }, // 门
    ],
    traditional_radical_ids: [
      { kangxi_id: 169 }, // 門
    ],
  },
];
