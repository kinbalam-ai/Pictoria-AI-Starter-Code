/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import Configurations from "./_components/Configurations";
import { getHanziByCharacter } from "@/app/actions/hanzi-actions";
import GeneratedHanzi from "./_components/GeneratedHanzi";

const HannziGeneration = async ({
  searchParams,
}: {
  searchParams: { character?: string };
}) => {
  const { character: hanzi } = await searchParams;

  let hanziData;

  if (hanzi) {
    const response = await getHanziByCharacter(hanzi);
    hanziData = response.data;
    if (response.success) {
      console.log("response.data: ", response.data);
    } else {
      console.log("response.error: ", response.error);
      return <div>No hanziData</div>;
    }
  } 

  if (!hanzi) {
    return <div>No hanzi</div>
  }
  

  return (
    <section className="container mx-auto grid flex-1 gap-4 overflow-auto grid-cols-1 lg:grid-cols-3">
      <Configurations userModels={[]} hanziData={hanziData} character={hanzi} />
      <div className="relative flex h-fit flex-col items-center justify-center rounded-xl p-0 lg:p-4 lg:col-span-2">
        <GeneratedHanzi />
        <div className="flex-1" />
      </div>
    </section>
  );
};

export default HannziGeneration;
