// app/hanzis/page.tsx
import {AddHanziButton} from "./_components/AddHanziButton";
import { HanziTable } from "./_components/HanziTable";

const hanzis = [
  {
    id: 1,
    character: "的",
    pinyin: ["de"],
    definition: "possessive particle",
    stroke_count: 8,
    hsk_level: 1,
    frequency_rank: 1,
    radical_ids: [106, 112],
  },
  {
    id: 2,
    character: "一",
    pinyin: ["yī"],
    definition: "one",
    stroke_count: 1,
    hsk_level: 1,
    frequency_rank: 2,
    radical_ids: [1],
  },
  {
    id: 3,
    character: "是",
    pinyin: ["shì"],
    definition: "to be",
    stroke_count: 9,
    hsk_level: 1,
    frequency_rank: 3,
    radical_ids: [72, 140],
  },
];
export default function HanzisPage() {

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hanzis</h1>
        <AddHanziButton />
      </div>
      <HanziTable hanzis={hanzis} />
    </div>
  );
}