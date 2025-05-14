/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import useGenerateHanziStore, {
  useDisplayedCharacter,
  useSelectedPronunciations,
  useSetCanvasImage,
} from "./useGenerateHanziStore";
import { Loader2 } from "lucide-react";

interface GeneratedHanziProps {
  onImageGenerated?: (base64Image: string) => void;
}

const GeneratedHanzi = ({ onImageGenerated }: GeneratedHanziProps) => {
  const { images, loading } = useGenerateHanziStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isGeneratingCanvas, setIsGeneratingCanvas] = useState(false);

  const displayedCharacter = useDisplayedCharacter();
  const setCanvasImage = useSetCanvasImage();
  const selectedPronunciations = useSelectedPronunciations();

  const generateHanziImage = useCallback(async () => {
    if (!canvasRef.current || !displayedCharacter) return;

    setIsGeneratingCanvas(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const canvas = canvasRef.current;
      const displaySize = 1024;
      const renderScale = 4;
      const characterSize = 800;
      const pronunciationSize = 60 * renderScale; // Size for pronunciation text

      canvas.width = displaySize * renderScale;
      canvas.height = displaySize * renderScale;

      const context = canvas.getContext("2d");
      if (!context) return;

      // Draw white background with rounded corners
      context.imageSmoothingEnabled = true;
      context.textRendering = "optimizeLegibility";
      context.fillStyle = "#ffffff";
      context.beginPath();
      const radius = 12 * renderScale;
      context.roundRect(0, 0, canvas.width, canvas.height, radius);
      context.fill();

      // Draw main character
      context.fillStyle = "#000000";
      context.font = `${
        characterSize * renderScale
      }px "Noto Sans CJK SC", sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        displayedCharacter,
        canvas.width / 2,
        700 + canvas.height / 2 - pronunciationSize * 1.5 // Adjust position higher
      );

      // GeneratedHanzi.tsx - in your generateHanziImage function
      if (selectedPronunciations.length > 0) {
        context.font = `bold ${60 + pronunciationSize}px "Noto Sans CJK SC", sans-serif`;
        context.fillStyle = "#000000";

        // This will use the properly ordered array from the store
        const pronunciationsText = selectedPronunciations.join("  ");
        context.fillText(
          pronunciationsText,
          canvas.width / 2,
          480 + canvas.height / 2 + characterSize * renderScale * 0.4
        );
      }

      // Create display-sized version
      const displayCanvas = document.createElement("canvas");
      displayCanvas.width = displaySize;
      displayCanvas.height = displaySize;
      const displayContext = displayCanvas.getContext("2d");

      if (displayContext) {
        displayContext.imageSmoothingEnabled = true;
        displayContext.drawImage(
          canvas,
          0,
          0,
          canvas.width,
          canvas.height,
          0,
          0,
          displaySize,
          displaySize
        );

        const dataUrl = displayCanvas.toDataURL("image/png", 1.0);
        setBase64Image(dataUrl);
        onImageGenerated?.(dataUrl);
      }
    } finally {
      setIsGeneratingCanvas(false);
    }
  }, [displayedCharacter, onImageGenerated, selectedPronunciations]); // Add selectedPronunciations to dependencies
  // Sync to Zustand store whenever base64Image changes
  useEffect(() => {
    if (base64Image) {
      // console.log("base64Image: ", base64Image)
      setCanvasImage(base64Image);
    }
  }, [base64Image, setCanvasImage]);

  // Debounce rapid character changes
  useEffect(() => {
    const timer = setTimeout(() => {
      generateHanziImage();
    }, 300); // Small delay to batch rapid changes

    return () => clearTimeout(timer);
  }, [generateHanziImage]);

  if (images.length === 0) {
    return (
      <Card className="w-full max-w-2xl bg-muted rounded-lg overflow-hidden">
        <CardContent className="flex aspect-square items-center justify-center p-0">
          {loading || isGeneratingCanvas ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>Rendering character...</span>
            </div>
          ) : displayedCharacter ? (
            <div className="relative w-full h-full">
              <canvas ref={canvasRef} className="hidden" />
              {base64Image &&
                !isGeneratingCanvas && ( // Only show when stable
                  <div className="absolute inset-0 rounded-lg overflow-hidden">
                    <Image
                      src={base64Image}
                      alt={`Hanzi character ${displayedCharacter}`}
                      fill
                      className="object-contain"
                      priority
                      quality={100}
                    />
                  </div>
                )}
            </div>
          ) : (
            <span className="text-2xl">No Hanzi selected</span>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Carousel className="w-full max-w-2xl">
      <CarouselContent>
        {loading ? (
          <CarouselItem>
            <Card className="border-none rounded-lg overflow-hidden">
              <CardContent className="flex aspect-square items-center justify-center p-6">
                <span className="text-2xl">Generating more Hanzi...</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ) : (
          images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={`Generated Hanzi ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={100}
                />
              </div>
            </CarouselItem>
          ))
        )}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
};

export default GeneratedHanzi;
