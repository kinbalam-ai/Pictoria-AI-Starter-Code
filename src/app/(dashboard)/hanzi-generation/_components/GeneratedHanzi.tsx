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
// import { cn } from "@/lib/utils";
import { Hanzi } from "../../hanzis/_components/types";
import useGenerateHanziStore from "./useGenerateHanziStore";

interface GeneratedHanziProps {
  hanziData?: Hanzi;
  character: string;
  onImageGenerated?: (base64Image: string) => void;
}

const GeneratedHanzi = ({ hanziData, character, onImageGenerated }: GeneratedHanziProps) => {
  const { images, loading } = useGenerateHanziStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  // Generate high-resolution Hanzi character
  const generateHanziImage = useCallback(() => {
    if (!canvasRef.current || !character) return;

    const canvas = canvasRef.current;
    const displaySize = 1024; // Double resolution for crisp display
    const renderScale = 4; // Render at 4x then scale down for anti-aliasing
    const 字体大小 = 800; // zìtǐ dàxiǎo
    
    canvas.width = displaySize * renderScale;
    canvas.height = displaySize * renderScale;

    const context = canvas.getContext("2d");
    if (!context) return;

    // High-quality rendering settings
    context.imageSmoothingEnabled = true;
    context.textRendering = "optimizeLegibility";

    // White background with rounded corners
    context.fillStyle = "#ffffff";
    context.beginPath();
    const radius = 12 * renderScale; // Corner radius scaled up
    context.roundRect(0, 0, canvas.width, canvas.height, radius);
    context.fill();

    // Black text with precise centering
    context.fillStyle = "#000000";
    context.font = `${字体大小 * renderScale}px "Noto Sans CJK SC", sans-serif`; // Larger font with Chinese font stack
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Draw character with perfect centering
    context.fillText(
      character,
      canvas.width / 2,
      180 + canvas.height / 2 + (20 * renderScale) // Slight vertical adjustment
    );

    // Create display-sized version
    const displayCanvas = document.createElement("canvas");
    displayCanvas.width = displaySize;
    displayCanvas.height = displaySize;
    const displayContext = displayCanvas.getContext("2d");
    
    if (displayContext) {
      displayContext.imageSmoothingEnabled = true;
      displayContext.drawImage(
        canvas,
        0, 0, canvas.width, canvas.height,
        0, 0, displaySize, displaySize
      );
      
      const dataUrl = displayCanvas.toDataURL("image/png", 1.0); // Maximum quality
      setBase64Image(dataUrl);
      onImageGenerated?.(dataUrl);
    }
  }, [character, onImageGenerated]);

  useEffect(() => {
    generateHanziImage();
  }, [generateHanziImage]);

  if (images.length === 0) {
    return (
      <Card className="w-full max-w-2xl bg-muted rounded-lg overflow-hidden">
        <CardContent className="flex aspect-square items-center justify-center p-0">
          {loading ? (
            <span className="text-2xl">Generating Hanzi images...</span>
          ) : hanziData ? (
            <div className="relative w-full h-full">
              {/* Hidden high-res canvas */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Display with smooth edges */}
              {base64Image && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <Image
                    src={base64Image}
                    alt={`Hanzi character ${character}`}
                    fill
                    className="object-contain"
                    priority
                    quality={100}
                  />
                </div>
              )}
            </div>
          ) : (
            <span className="text-2xl">No Hanzi images generated yet</span>
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