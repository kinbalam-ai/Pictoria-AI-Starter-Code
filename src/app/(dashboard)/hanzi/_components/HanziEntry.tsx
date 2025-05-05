import React from "react";
import ExampleSentences from "./ExampleSentences";
import ExampleWords from "./ExampleWords";
import CharacterAnimation from "./CharacterAnimation";
import CharacterHeader from "./CharacterHeader";

const HanziEntry = () => {
  return (
    <div className="card-body">
      <div className="flex">
        <div className="flex-1">
          <CharacterHeader />
        </div>

        <CharacterAnimation />
      </div>

      <ExampleWords />
      <ExampleSentences />
      
      <ExampleWords />
      <ExampleSentences />
    </div>
  );
};

export default HanziEntry;
