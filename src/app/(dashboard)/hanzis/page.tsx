/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/radicals/page.tsx
import { getHanzis } from "@/app/actions/hanzi-actions";
import { AddHanziButton } from "./_components/AddHanziButton";
import HanzisTable from "./_components/HanzisTable";
import { sampleHanzis } from "./_components/static-data";
import { Hanzi } from "./_components/types";
// import { getHanzis } from "@/app/actions/radicals-actions";

const hanzis: Hanzi[] = sampleHanzis;

export default async function HanzisPage() {
  // Call the backend function directly
  const { data: hanzis, error } = await getHanzis();

  if (!hanzis) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Hanzis</h1>
          <AddHanziButton />
        </div>
        <p className="text-red-500">{error || "Failed to load radicals"}</p>
      </div>
    );
  }

  console.log("hanzis: ", hanzis);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hanzis</h1>
        <AddHanziButton />
      </div>

      <HanzisTable hanzis={hanzis} />
    </div>
  );
}
