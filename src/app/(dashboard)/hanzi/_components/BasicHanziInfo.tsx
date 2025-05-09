/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const BasicHanziInfo = () => {
  const [showTraditional, setShowTraditional] = useState(false);

  const characterData = {
    standard: "爱",
    traditional: "愛",
    pinyin: "ài",
    definition: "love",
    simplifiedStrokes: 10,
    traditionalStrokes: 13,
    hskLevel: 1,
    frequencyRank: 394,
    simplifiedRadicals: [
      { id: 14, char: "冖", name: "cover" },
      { id: 4, char: "⼃", name: "slash" },
      { id: 1, char: "一", name: "one" },
      { id: 29, char: "又", name: "again" },
      { id: 87, char: "爪", name: "claw" },
    ],
    traditionalRadicals: [
      { id: 14, char: "冖", name: "cover" },
      { id: 34, char: "夂", name: "go slowly" },
      { id: 87, char: "爪", name: "claw" },
      { id: 61, char: "心", name: "heart" },
    ],
  };

  const currentCharacter = showTraditional
    ? characterData.traditional
    : characterData.standard;
  const currentStrokes = showTraditional
    ? characterData.traditionalStrokes
    : characterData.simplifiedStrokes;
  const currentRadicals = showTraditional
    ? characterData.traditionalRadicals
    : characterData.simplifiedRadicals;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow border border-gray-200">
      {/* Character Display with Toggle */}
      <div className="text-center space-y-4">
        {/* Toggle simplified/traditional */}
        {/* <div className="flex justify-center">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setShowTraditional(false)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${!showTraditional ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Simplified
            </button>
            <button
              onClick={() => setShowTraditional(true)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${showTraditional ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Traditional
            </button>
          </div>
        </div> */}
        <h1 className="text-6xl font-bold font-hanzi">{currentCharacter}</h1>

        <div className="space-y-1">
          <p className="text-2xl text-red-600 font-medium">
            {characterData.pinyin}
          </p>
          <p className="text-lg text-gray-700">{characterData.definition}</p>
        </div>

        <Link
          href={`hanzi-generation?character=${currentCharacter}`}
          className={buttonVariants()}
        >
          Generate
        </Link>
      </div>

      {/* Stroke Count */}
      {/* <div className="py-3 border-y border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Strokes:</span>
          <span className="text-2xl font-bold">{currentStrokes}</span>
        </div>
        {showTraditional && (
          <p className="text-xs text-gray-500 mt-1">
            (Simplified: {characterData.simplifiedStrokes} strokes)
          </p>
        )}
      </div> */}

      {/* Radicals */}
      {/* <div>
        <h3 className="font-medium text-gray-700 mb-3">Character Composition</h3>
        <div className="flex flex-wrap gap-3">
          {currentRadicals.map((radical, index) => (
            <Link 
              key={index}
              href={`/radical/${radical.id}`}
              className="inline-flex flex-col items-center p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              title={radical.name}
            >
              <span className="text-2xl font-hanzi">{radical.char}</span>
              <span className="text-xs text-gray-500 mt-1">{radical.name}</span>
            </Link>
          ))}
        </div>
      </div> */}

      {/* Metadata */}
      {/* <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">HSK Level</p>
          <p className="font-medium">HSK {characterData.hskLevel}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-500">Frequency Rank</p>
          <p className="font-medium">#{characterData.frequencyRank}</p>
        </div>
      </div> */}

      {/* Character Notes */}
      {showTraditional && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-1">
            Traditional Form Note
          </h4>
          <p className="text-sm text-gray-700">
            {/* Contains the "heart" (心) component, emphasizing emotional love, while the simplified form uses "friend" (友). */}
          </p>
        </div>
      )}
    </div>
  );
};

export default BasicHanziInfo;
